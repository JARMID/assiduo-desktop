import React from 'react';
import { X, Clock, School, CheckCircle } from 'lucide-react';
import { InsfpUser } from '../types';
import { SpotlightCard, Magnet, ShinyText } from './react-bits';

interface InstructorAssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: InsfpUser | null;
}

export const InstructorAssignmentsModal: React.FC<InstructorAssignmentsModalProps> = ({
  isOpen,
  onClose,
  instructor,
}) => {
  if (!isOpen || !instructor) return null;

  const assignments = [
    { module: 'Développement Web Frontend (React & TypeScript)', code: 'M-INF-301', hours: '6h / sem', classCode: 'BTS-DEV-S3', room: 'Labo Info 02' },
    { module: 'Algorithmique & Structures de Données', code: 'M-INF-204', hours: '4h / sem', classCode: 'BTS-DEV-S1', room: 'Salle 12' },
    { module: 'Atelier Intégrateur & Suivi de Projet', code: 'M-INF-405', hours: '4h / sem', classCode: 'BTS-DEV-S4', room: 'Labo Multimédia' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <SpotlightCard
        spotlightColor="rgba(20, 184, 166, 0.16)"
        className="bg-[#111724] border border-[#1f293d] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">
              {instructor.first_name[0]}{instructor.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ShinyText
                  text="Affectations Pédagogiques"
                  speed={5}
                  className="text-sm font-bold text-white"
                />
                <span className="px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/40 text-[10px] text-teal-300 font-mono">
                  {instructor.department || 'Enseignement'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {instructor.first_name} {instructor.last_name} • {instructor.email}
              </p>
            </div>
          </div>
          <Magnet padding={8} magnetStrength={0.2}>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2333] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </Magnet>
        </div>

        {/* Assignments List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span>Modules sous la responsabilité du formateur</span>
            <span className="text-emerald-400 font-mono font-medium">Charge totale: 14h / sem</span>
          </div>

          <div className="space-y-2.5">
            {assignments.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#162032] border border-[#223049] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-teal-300 bg-teal-950/50 border border-teal-800/30 px-1.5 py-0.5 rounded">
                      {item.code}
                    </span>
                    <span className="text-xs font-semibold text-white">{item.module}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <School className="w-3 h-3 text-slate-500" />
                      Section: {item.classCode}
                    </span>
                    <span>• Lieu: {item.room}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-200 text-xs font-mono bg-[#101726] px-2.5 py-1 rounded-lg border border-[#1f2c42] shrink-0">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{item.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f293d] flex items-center justify-between bg-[#0e131d]">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Fiche de charge validée par la Direction Pédagogique</span>
          </div>
          <Magnet padding={8} magnetStrength={0.2}>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#1b263b] hover:bg-[#23324d] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </Magnet>
        </div>
      </SpotlightCard>
    </div>
  );
};
