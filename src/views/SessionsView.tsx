import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  CheckCircle,
  Radio,
  QrCode,
  Printer,
  Plus,
} from 'lucide-react';
import { Session, AttendanceRecord } from '../types';
import { supabase } from '../lib/supabase';
import { NewSessionModal } from '../components/NewSessionModal';
import { SpotlightCard, ShinyText, Magnet, CountUp, AnimatedContent } from '../components/react-bits';
import { sound } from '../lib/audioFeedback';

interface SessionsViewProps {
  sessions: Session[];
  attendanceRecords: AttendanceRecord[];
  onRefresh: () => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  attendanceRecords,
  onRefresh,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[0]?.id || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Time slot tabs
  const timeSlots = [
    { label: '08:30 - 10:45', slot: 'M1' },
    { label: '10:45 - 13:00', slot: 'M2' },
    { label: '13:30 - 15:00', slot: 'A1' },
    { label: '15:00 - 17:00', slot: 'A2' },
  ];

  const [localStatuses, setLocalStatuses] = useState<
    Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>
  >({});

  const currentSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  // Records for current session
  const sessionRecords = attendanceRecords.filter(
    (r) => r.session_id === currentSession?.id
  );

  const handleUpdateStatus = async (
    recordId: string,
    newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  ) => {
    sound.playClick();
    // Instant optimistic update
    setLocalStatuses((prev) => ({ ...prev, [recordId]: newStatus }));

    try {
      const { error } = await supabase
        .from('insfp_attendance_records')
        .update({ status: newStatus })
        .eq('id', recordId);

      if (error) {
        console.warn('Supabase offline or update failed, using optimistic state:', error.message);
      } else {
        onRefresh();
      }
    } catch (err) {
      console.warn('Network exception, maintained in local state:', err);
    }
  };

  const handleBulkMarkAllPresent = async () => {
    if (!currentSession) return;
    sound.playClick();
    setIsSaving(true);

    // Instant optimistic update
    const updatedMap: Record<string, 'PRESENT'> = {};
    sessionRecords.forEach((r) => {
      updatedMap[r.id] = 'PRESENT';
    });
    setLocalStatuses((prev) => ({ ...prev, ...updatedMap }));

    try {
      const { error } = await supabase
        .from('insfp_attendance_records')
        .update({ status: 'PRESENT' })
        .eq('session_id', currentSession.id);

      sound.playSuccess();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      if (!error) {
        onRefresh();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Slot Header Selector */}
      <div className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {timeSlots.map((ts, idx) => (
            <button
              key={idx}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                idx === 0
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#182338] text-slate-400 hover:text-slate-200 border border-[#23314a]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{ts.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            Créneaux INSFP officiels
          </span>
        </div>
      </div>

      {/* Main Grid: Sessions List (Left) and Roll-Call Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Séances du Jour
            </h2>
            <Magnet padding={10} magnetStrength={0.2}>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle Séance</span>
              </button>
            </Magnet>
          </div>

          <AnimatedContent distance={12} stagger={0.04} duration={0.4} className="space-y-2.5">
            {sessions.map((s) => {
              const isSelected = s.id === selectedSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#172338] border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                      : 'bg-[#141d2e] border-[#1f2c42] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {s.class_name || 'Section BTS'}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                          : 'bg-[#202d45] text-slate-400 border-[#2b3c5c]'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-emerald-400 mt-1">
                    {s.module_name || 'Module Pédagogique'}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Salle: {s.room || 'Salle 12'}</span>
                    <span className="font-mono text-slate-300">
                      {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 mt-1">
                    Formateur: {s.instructor_name || 'Titulaire de cours'}
                  </div>
                </div>
              );
            })}
          </AnimatedContent>
        </div>

        {/* Interactive Roll-Call Sheet (8 Cols) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.12)"
          className="lg:col-span-8 bg-[#141d2e] border border-[#1f2c42] rounded-xl p-5 flex flex-col justify-between"
        >
          <div>
            {/* Sheet Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f2c42] gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShinyText
                    text="Feuille d'Émargement Numérique"
                    speed={5}
                    className="text-sm font-bold text-white"
                  />
                  <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 text-[10px] font-mono">
                    {currentSession?.class_name || 'Section'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {currentSession?.module_name || 'Module'} • Salle{' '}
                  {currentSession?.room || 'Salle A'} • Créneau{' '}
                  {currentSession?.start_time.slice(0, 5)} -{' '}
                  {currentSession?.end_time.slice(0, 5)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#182338] hover:bg-[#202d45] border border-[#23314a] text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Imprimer la feuille d'émargement"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-300" />
                  <span>Imprimer</span>
                </button>
                <Magnet padding={8} magnetStrength={0.2}>
                  <button
                    onClick={handleBulkMarkAllPresent}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-[#1b273d] hover:bg-[#233350] border border-[#2b3c5c] text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tous Présents</span>
                  </button>
                </Magnet>
              </div>
            </div>

            {saveSuccess && (
              <div className="my-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Modifications enregistrées avec succès.</span>
              </div>
            )}

            {/* Attendance Roster Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101726] border-b border-[#1f2c42] text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Matricule</th>
                    <th className="py-2.5 px-3">Stagiaire</th>
                    <th className="py-2.5 px-3 text-center">Émargement</th>
                    <th className="py-2.5 px-3 text-right">Statut Actuel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b263b] text-slate-200">
                  {sessionRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-slate-500 text-xs"
                      >
                        Aucun enregistrement d'appel pour cette séance.
                      </td>
                    </tr>
                  ) : (
                    sessionRecords.map((rec) => {
                      const effectiveStatus = localStatuses[rec.id] || rec.status;
                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-[#182338]/60 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                            {rec.matricule || '2024-001'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {rec.student_name || 'Stagiaire INSFP'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {/* Segmented control */}
                            <div className="inline-flex rounded-lg bg-[#0e1420] p-0.5 border border-[#1f2c42]">
                              <button
                                onClick={() => handleUpdateStatus(rec.id, 'PRESENT')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                  effectiveStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Présent
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(rec.id, 'ABSENT')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                  effectiveStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(rec.id, 'LATE')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                  effectiveStatus === 'LATE'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Retard
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(rec.id, 'EXCUSED')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                  effectiveStatus === 'EXCUSED'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Justifié
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                effectiveStatus === 'PRESENT'
                                  ? 'text-emerald-400 bg-emerald-950/40'
                                  : effectiveStatus === 'ABSENT'
                                  ? 'text-rose-400 bg-rose-950/40'
                                  : effectiveStatus === 'LATE'
                                  ? 'text-amber-400 bg-amber-950/40'
                                  : 'text-blue-400 bg-blue-950/40'
                              }`}
                            >
                              {effectiveStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roll Call Footer */}
          <div className="mt-5 pt-4 border-t border-[#1f2c42] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Validation par QR Code mobile ou saisie manuelle sécurisée</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Total inscrits: <CountUp to={sessionRecords.length} duration={0.8} />
            </span>
          </div>
        </SpotlightCard>
      </div>

      <NewSessionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={() => {
          onRefresh();
          setIsNewModalOpen(false);
        }}
      />
    </div>
  );
};
