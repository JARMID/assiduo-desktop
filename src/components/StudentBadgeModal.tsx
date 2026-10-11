import React from 'react';
import { X, Printer, QrCode, ShieldCheck, School } from 'lucide-react';
import { Student } from '../types';
import { SpotlightCard, Magnet, ShinyText } from './react-bits';
import { sound } from '../lib/audioFeedback';

interface StudentBadgeModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export const StudentBadgeModal: React.FC<StudentBadgeModalProps> = ({
  isOpen,
  student,
  onClose,
}) => {
  if (!isOpen || !student) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    JSON.stringify({
      matricule: student.matricule,
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      insfp: 'INSFP-DZ',
    })
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 no-print-backdrop">
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.16)"
        className="bg-[#111724] border border-[#1f293d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-[#1f293d] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-400" />
            <ShinyText
              text="Carte Officielle de Stagiaire INSFP"
              speed={5}
              className="text-xs font-bold text-white uppercase tracking-wider"
            />
          </div>
          <div className="flex items-center gap-2">
            <Magnet padding={10} magnetStrength={0.2}>
              <button
                onClick={() => {
                  sound.playClick();
                  window.print();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer la Carte</span>
              </button>
            </Magnet>
            <Magnet padding={8} magnetStrength={0.2}>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2334] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </Magnet>
          </div>
        </div>

        {/* Badge Preview Canvas */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#0a0e17]">
          {/* Physical ID Card Container (Standard ISO 85.6mm x 54mm scaled) */}
          <div className="w-[380px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-emerald-500/40 p-4 shadow-2xl relative overflow-hidden text-slate-100 print:border print:border-black print:text-black print:bg-white print:shadow-none">
            {/* Algerian Institutional Strip */}
            <div className="text-center border-b border-emerald-500/30 pb-2">
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-300 print:text-black">
                République Algérienne Démocratique et Populaire
              </div>
              <div className="text-[7.5px] font-semibold text-emerald-400 print:text-black mt-0.5">
                Ministère de la Formation et de l'Enseignement Professionnels
              </div>
              <div className="text-[9px] font-extrabold text-white print:text-black mt-0.5 tracking-wide">
                INSTITUT NATIONAL SPÉCIALISÉ (INSFP)
              </div>
            </div>

            {/* Badge Title */}
            <div className="my-2 flex items-center justify-between px-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400 print:text-black bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                CARTE DE STAGIAIRE
              </span>
              <span className="text-[9px] font-mono text-slate-400 print:text-black">
                Année: 2025/2026
              </span>
            </div>

            {/* Card Body: Photo + Details + QR */}
            <div className="flex gap-3 items-center mt-2">
              {/* Photo Box */}
              <div className="w-20 h-24 rounded-xl bg-[#141d2e] border border-[#2b3c5c] flex flex-col items-center justify-center shrink-0 overflow-hidden relative shadow-inner print:border-black print:bg-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-700/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm">
                  {student.first_name[0]}
                  {student.last_name[0]}
                </div>
                <span className="text-[8px] text-slate-400 mt-2 font-mono uppercase tracking-tighter">
                  PHOTO
                </span>
                <div className="absolute bottom-0 inset-x-0 bg-emerald-600/80 py-0.5 text-[6.5px] text-center font-bold text-white uppercase">
                  INSFP
                </div>
              </div>

              {/* Trainee Identity Details */}
              <div className="flex-1 space-y-1 text-[10px]">
                <div>
                  <span className="text-slate-400 text-[8px] block uppercase tracking-wider">
                    Nom & Prénom
                  </span>
                  <span className="font-bold text-white text-xs print:text-black">
                    {student.last_name.toUpperCase()} {student.first_name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[8px] block uppercase tracking-wider">
                    Matricule National
                  </span>
                  <div className="font-mono font-bold text-slate-100 print:text-black">
                    {student.matricule}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[8px] block uppercase tracking-wider">
                    Section & Spécialité
                  </span>
                  <span className="text-slate-200 print:text-black truncate block text-[9.5px]">
                    {student.class_name || 'BTS Informatique'}
                  </span>
                </div>
              </div>

              {/* QR Code Box */}
              <div className="shrink-0 p-1.5 bg-white rounded-xl shadow-md border border-slate-300 flex flex-col items-center">
                <img
                  src={qrImageUrl}
                  alt={`QR ${student.matricule}`}
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-[7px] text-slate-800 font-mono font-bold mt-0.5">
                  SCAN POINTAGE
                </span>
              </div>
            </div>

            {/* Footer Institutional Seals */}
            <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[8px] text-slate-400 print:text-black">
              <div className="flex items-center gap-1 text-emerald-400 print:text-black font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Document Pédagogique Officiel</span>
              </div>
              <div className="text-right italic text-[7.5px]">
                Le Directeur de l'Institut
              </div>
            </div>
          </div>
        </div>

        {/* Notice Footer */}
        <div className="p-3 bg-[#0d131f] border-t border-[#1f293d] text-center text-[11px] text-slate-400 no-print flex items-center justify-center gap-2">
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Ce QR Code permet le pointage numérique instantané sur l'application mobile INSFP.
          </span>
        </div>
      </SpotlightCard>
    </div>
  );
};
