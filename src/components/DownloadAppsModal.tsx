import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  GraduationCap,
  Users,
  ShieldCheck,
  Info,
} from 'lucide-react';
import QRCode from 'qrcode';
import { sound } from '../lib/audioFeedback';
import { ShinyText } from './react-bits';

interface DownloadAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppsModal: React.FC<DownloadAppsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [studentQrDataUrl, setStudentQrDataUrl] = useState<string>('');
  const [teacherQrDataUrl, setTeacherQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<'student' | 'teacher' | null>(null);

  const studentAppUrl =
    'https://afwqtjmwklmoqntnvgww.supabase.co/storage/v1/object/public/apks/student_app.apk';
  const teacherAppUrl =
    'https://afwqtjmwklmoqntnvgww.supabase.co/storage/v1/object/public/apks/presence_insfp.apk';

  useEffect(() => {
    if (!isOpen) return;

    // Generate real QR codes as data URLs
    QRCode.toDataURL(studentAppUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0B0F17',
        light: '#FFFFFF',
      },
    })
      .then(setStudentQrDataUrl)
      .catch((err) => console.error('Failed to generate student QR:', err));

    QRCode.toDataURL(teacherAppUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0B0F17',
        light: '#FFFFFF',
      },
    })
      .then(setTeacherQrDataUrl)
      .catch((err) => console.error('Failed to generate teacher QR:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (url: string, type: 'student' | 'teacher') => {
    navigator.clipboard.writeText(url);
    sound.playSuccess();
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#111724] border border-[#223049] rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1f293d] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <ShinyText
                text="Applications Mobiles Officielles"
                speed={6}
                className="text-base md:text-lg font-bold text-white"
              />
              <div className="text-xs text-slate-400 mt-0.5">
                Téléchargement et distribution des APK Android pour stagiaires et formateurs
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2336] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student App Card */}
          <div className="bg-[#141d2e] border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-lg shadow-black/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Application Stagiaire</h3>
            </div>

            <p className="text-xs text-slate-400">
              Consultation des présences, historique des absences, scan d émargement et dépôt des justificatifs médicaux.
            </p>

            {/* QR Code Frame */}
            <div className="p-3 bg-white rounded-2xl shadow-md border-4 border-[#1f293d]">
              {studentQrDataUrl ? (
                <img
                  src={studentQrDataUrl}
                  alt="QR Code Application Stagiaire"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                  Génération du QR...
                </div>
              )}
            </div>

            <div className="w-full space-y-2 pt-2">
              <a
                href={studentAppUrl}
                target="_blank"
                rel="noreferrer"
                download="student_app.apk"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger student_app.apk</span>
              </a>

              <button
                onClick={() => handleCopy(studentAppUrl, 'student')}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#182338] hover:bg-[#202e48] border border-[#23354e] rounded-xl text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedLink === 'student' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copier le lien direct</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Teacher App Card */}
          <div className="bg-[#141d2e] border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-lg shadow-black/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Application Enseignant</h3>
            </div>

            <p className="text-xs text-slate-400">
              Génération du QR Code dynamique de séance, appel numérique et validation en direct de l assiduité en classe.
            </p>

            {/* QR Code Frame */}
            <div className="p-3 bg-white rounded-2xl shadow-md border-4 border-[#1f293d]">
              {teacherQrDataUrl ? (
                <img
                  src={teacherQrDataUrl}
                  alt="QR Code Application Enseignant"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                  Génération du QR...
                </div>
              )}
            </div>

            <div className="w-full space-y-2 pt-2">
              <a
                href={teacherAppUrl}
                target="_blank"
                rel="noreferrer"
                download="presence_insfp.apk"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger presence_insfp.apk</span>
              </a>

              <button
                onClick={() => handleCopy(teacherAppUrl, 'teacher')}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#182338] hover:bg-[#202e48] border border-[#23354e] rounded-xl text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedLink === 'teacher' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copier le lien direct</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Installation Instructions Footnote */}
        <div className="bg-[#162032] border border-[#223049] rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white">Instructions d installation sur smartphone Android :</div>
            <p className="text-slate-400 leading-relaxed">
              1. Ouvrez l appareil photo de votre smartphone ou une application de scan pour lire le code QR ci-dessus.
              <br />
              2. Téléchargez le fichier APK directement depuis le serveur Supabase officiel de l institut.
              <br />
              3. Si Android affiche une alerte de sécurité, autorisez l installation depuis cette source dans les paramètres de votre navigateur.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1f293d]">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fichiers hébergés sur Supabase Storage (afwqtjmwklmoqntnvgww)</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#182338] hover:bg-[#223049] text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
