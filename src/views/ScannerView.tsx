import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Scan,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Search,
  Volume2,
  VolumeX,
  History,
} from 'lucide-react';
import { Student, Session, AttendanceRecord } from '../types';
import { SpotlightCard, AnimatedContent } from '../components/react-bits';
import { sound } from '../lib/audioFeedback';
import { supabase } from '../lib/supabase';

interface ScannerViewProps {
  students: Student[];
  sessions: Session[];
  onRecordAttendance: (record: AttendanceRecord) => void;
  onLogAuditEvent?: (action: string, target: string, details: string, severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL') => void;
}

interface ScanResult {
  student: Student;
  session?: Session;
  status: 'PRESENT' | 'LATE';
  timestamp: string;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  students,
  sessions,
  onRecordAttendance,
  onLogAuditEvent,
}) => {
  const [scanInput, setScanInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastScanned, setLastScanned] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(sound.getEnabled());
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const effectiveSessionId = selectedSessionId || sessions[0]?.id || '';
  const currentActiveSession = sessions.find((s) => s.id === effectiveSessionId) || sessions[0];

  // Auto-focus the USB reader input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle Camera Stream
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      setCameraError(null);
    } else {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (err: unknown) {
        console.warn('Webcam stream not accessible:', err);
        setCameraError("Caméra non détectée ou permission refusée. Utilisez la douchette USB ou la saisie manuelle.");
        setIsCameraActive(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Process Scanned Payload
  const processScan = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    let matricule = code;
    // Check if JSON QR payload from student badge
    try {
      if (code.startsWith('{') && code.endsWith('}')) {
        const parsed = JSON.parse(code);
        if (parsed.matricule) {
          matricule = parsed.matricule;
        }
      }
    } catch {
      // Not JSON, use raw text as matricule
    }

    // Match student by matricule or id
    const foundStudent = students.find(
      (s) =>
        s.matricule.toLowerCase() === matricule.toLowerCase() ||
        s.id.toLowerCase() === matricule.toLowerCase() ||
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(matricule.toLowerCase())
    );

    if (!foundStudent) {
      sound.playWarning();
      setScanInput('');
      onLogAuditEvent?.(
        'EMARGEMENT',
        `Code inconnu: ${matricule}`,
        'Tentative d’émargement avec un badge ou matricule non répertorié',
        'WARNING'
      );
      return;
    }

    // Determine session
    const currentSession = currentActiveSession;

    // Determine status (PRESENT vs LATE)
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isLate = now.getMinutes() > 20;
    const status: 'PRESENT' | 'LATE' = isLate ? 'LATE' : 'PRESENT';

    const result: ScanResult = {
      student: foundStudent,
      session: currentSession,
      status,
      timestamp: timeString,
    };

    setLastScanned(result);
    setRecentScans((prev) => [result, ...prev.slice(0, 19)]);
    setScanInput('');
    sound.playSuccess();

    // Persist to Supabase if session exists
    if (currentSession) {
      const record: AttendanceRecord = {
        id: `rec-scan-${Date.now()}`,
        session_id: currentSession.id,
        student_id: foundStudent.id,
        student_name: `${foundStudent.first_name} ${foundStudent.last_name}`,
        matricule: foundStudent.matricule,
        status: result.status,
        scanned_at: now.toISOString(),
        verification_method: 'QR',
        notes: `Émargement guichet direct (${timeString})`,
        created_at: now.toISOString(),
      };

      onRecordAttendance(record);

      try {
        await supabase.from('insfp_attendance_records').insert({
          session_id: currentSession.id,
          student_id: foundStudent.id,
          status: result.status,
          verification_method: 'QR',
          notes: 'Guichet d’accueil - Poste Administratif',
        });
      } catch (err) {
        console.warn('Could not insert live record into Supabase:', err);
      }
    }

    onLogAuditEvent?.(
      'EMARGEMENT',
      `${foundStudent.first_name} ${foundStudent.last_name} (${foundStudent.matricule})`,
      `Émargement validé au guichet: ${status === 'LATE' ? 'En retard' : 'Présent'} sur ${currentSession?.class_name || 'Séance courante'}`,
      status === 'LATE' ? 'WARNING' : 'SUCCESS'
    );

    // Keep focus for next scan
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processScan(scanInput);
    }
  };

  const filteredStudents = searchFilter
    ? students
        .filter(
          (s) =>
            s.matricule.toLowerCase().includes(searchFilter.toLowerCase()) ||
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchFilter.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1f293d]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scan className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Guichet d'Émargement Direct & Scan de Badges
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contrôle d'accès et pointage instantané par douchette USB, caméra ou saisie au poste d'accueil
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Feedback Toggle */}
          <button
            onClick={() => {
              const next = !isAudioEnabled;
              sound.setEnabled(next);
              setIsAudioEnabled(next);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-colors cursor-pointer ${
              isAudioEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-[#162032] border-[#223049] text-slate-400'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Signaux sonores {isAudioEnabled ? 'Actifs' : 'Muets'}</span>
          </button>

          {/* Session Selector */}
          <div className="flex items-center gap-2 bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={effectiveSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#111724] text-white">
                  {s.class_name || 'Section'} • {s.module_name || 'Module'} ({s.start_time.slice(0, 5)})
                </option>
              ))}
            </select>
            {currentActiveSession?.room && (
              <span className="hidden sm:inline text-[10px] text-slate-400 border-l border-[#223049] pl-2 font-mono">
                {currentActiveSession.room}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner Engine vs Live Confirmation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hardware Barcode & USB Reader Card */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.15)"
            className="p-5 bg-[#141d2e] border border-[#1f2c42] rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Lecteur de Badges (Douchette USB ou Clavier)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
                Écoute active
              </span>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scannez un QR de badge avec la douchette ou tapez le matricule..."
                className="w-full bg-[#0d1422] border-2 border-emerald-500/40 focus:border-emerald-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none transition-all shadow-inner"
              />
              <button
                onClick={() => processScan(scanInput)}
                disabled={!scanInput.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Valider
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Positionnez le curseur ou scannez à tout moment avec la douchette USB</span>
              <span className="text-slate-500 font-mono">Entrée automatique</span>
            </div>
          </SpotlightCard>

          {/* Camera Scan Module */}
          <SpotlightCard
            spotlightColor="rgba(59, 130, 246, 0.12)"
            className="p-5 bg-[#141d2e] border border-[#1f2c42] rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scanner Vidéo par Webcam
                </span>
              </div>
              <button
                onClick={toggleCamera}
                className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isCameraActive
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
                }`}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Désactiver Webcam</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Activer Webcam</span>
                  </>
                )}
              </button>
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{cameraError}</span>
              </div>
            )}

            {isCameraActive ? (
              <div className="relative rounded-xl overflow-hidden border border-[#223049] bg-black aspect-video max-h-64 mx-auto flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {/* Animated Scanning Laser */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse pointer-events-none" />
                <div className="absolute inset-12 border-2 border-emerald-400/50 rounded-lg pointer-events-none" />
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-[#223049] bg-[#0f1726]/60 text-center">
                <Scan className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  La caméra permet de scanner les cartes physiques des stagiaires directement à l'accueil.
                </p>
              </div>
            )}
          </SpotlightCard>

          {/* Quick Search Lookup Fallback */}
          <div className="bg-[#141d2e] border border-[#1f2c42] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">
                Recherche manuelle par Nom ou Matricule
              </span>
            </div>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Ex: Amine, 2024001, Mansouri..."
              className="w-full bg-[#0d1422] border border-[#223049] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            {filteredStudents.length > 0 && (
              <div className="mt-2 space-y-1">
                {filteredStudents.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      processScan(st.matricule);
                      setSearchFilter('');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-[#182338] hover:bg-emerald-500/10 border border-[#223049] hover:border-emerald-500/30 flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-white">
                        {st.last_name} {st.first_name}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2 font-mono">
                        ({st.matricule})
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">Émarger →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Instant Confirmation & Today's Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Glowing Result Card */}
          {lastScanned ? (
            <AnimatedContent distance={16} duration={0.4}>
              <SpotlightCard
                spotlightColor="rgba(16, 185, 129, 0.25)"
                className="p-6 bg-gradient-to-b from-[#16263b] to-[#111928] border-2 border-emerald-500/50 rounded-2xl shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Émargement Enregistré
                  </span>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {lastScanned.timestamp}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-950/60 shrink-0">
                    {lastScanned.student.first_name[0]}
                    {lastScanned.student.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {lastScanned.student.first_name} {lastScanned.student.last_name}
                    </h3>
                    <div className="text-xs text-slate-300 font-mono mt-0.5">
                      Matricule: {lastScanned.student.matricule}
                    </div>
                    <div className="text-xs text-emerald-300 mt-0.5">
                      {lastScanned.student.class_name || 'BTS Formation'}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#22334d] grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0d1624] border border-[#1e2f47]">
                    <div className="text-[10px] text-slate-400">Statut Présence</div>
                    <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{lastScanned.status === 'LATE' ? 'En retard' : 'Présent'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0d1624] border border-[#1e2f47]">
                    <div className="text-[10px] text-slate-400">Taux d'Assiduité</div>
                    <div className="font-bold text-white mt-0.5 font-mono">
                      {lastScanned.student.attendance_rate || 96.0}%
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ) : (
            <div className="p-8 rounded-2xl border border-[#1f2c42] bg-[#141d2e] text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1b263b] border border-[#23334e] flex items-center justify-center text-slate-400 mx-auto">
                <UserCheck className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">
                En attente du prochain badge
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Dès qu'un stagiaire présente sa carte ou son QR mobile, sa fiche de présence s'affichera immédiatement ici.
              </p>
            </div>
          )}

          {/* Today's Front-Desk Feed */}
          <div className="bg-[#141d2e] border border-[#1f2c42] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Pointages récents au guichet
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {recentScans.length} aujourd'hui
              </span>
            </div>

            {recentScans.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Aucun pointage enregistré depuis l'ouverture de la session.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {recentScans.map((scan, idx) => (
                  <div
                    key={`${scan.student.id}-${idx}`}
                    className="p-2.5 rounded-xl bg-[#182338] border border-[#22314a] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {scan.student.last_name} {scan.student.first_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {scan.student.matricule} • {scan.student.class_name || 'BTS'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          scan.status === 'LATE'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {scan.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {scan.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
