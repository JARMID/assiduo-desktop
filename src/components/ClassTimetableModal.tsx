import React from 'react';
import { X, Calendar, Clock, MapPin, User, Printer } from 'lucide-react';
import { InsfpClass } from '../types';
import { SpotlightCard, Magnet, ShinyText } from './react-bits';

interface ClassTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  insfpClass: InsfpClass | null;
}

export const ClassTimetableModal: React.FC<ClassTimetableModalProps> = ({
  isOpen,
  onClose,
  insfpClass,
}) => {
  if (!isOpen || !insfpClass) return null;

  const timetableSlots = [
    { day: 'Dimanche', time: '08:30 - 11:30', module: 'Développement Web Frontend (React)', teacher: 'M. Khaldi', room: 'Labo Info 02' },
    { day: 'Dimanche', time: '13:00 - 16:00', module: 'Conception de Bases de Données (PostgreSQL)', teacher: 'F. Saidi', room: 'Salle 14' },
    { day: 'Lundi', time: '08:30 - 11:30', module: 'Réseaux & Protocoles IP', teacher: 'A. Belkacem', room: 'Labo Réseaux' },
    { day: 'Mardi', time: '08:30 - 11:30', module: 'Algorithmique & Structures de Données', teacher: 'M. Khaldi', room: 'Amphi B' },
    { day: 'Mercredi', time: '08:30 - 11:30', module: 'Anglais Technique & Professionnel', teacher: 'S. Benali', room: 'Salle 08' },
    { day: 'Jeudi', time: '08:30 - 12:30', module: 'Atelier Projet Intégrateur & Soutenance', teacher: 'M. Khaldi & F. Saidi', room: 'Labo Multimédia' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <SpotlightCard
        spotlightColor="rgba(20, 184, 166, 0.16)"
        className="bg-[#111724] border border-[#1f293d] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ShinyText
                  text="Emploi du Temps Officiel"
                  speed={5}
                  className="text-sm font-bold text-white"
                />
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[10px] text-emerald-300 font-mono">
                  {insfpClass.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{insfpClass.name} • Semestre S{insfpClass.semester}</p>
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

        {/* Timetable Body */}
        <div className="p-5 space-y-3 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-2.5">
            {timetableSlots.map((slot, idx) => (
              <div
                key={idx}
                className="bg-[#162032] border border-[#223049] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-teal-500/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-teal-950/50 text-teal-300 border border-teal-800/30 rounded text-[10px] font-bold">
                      {slot.day}
                    </span>
                    <span className="text-xs font-semibold text-white">{slot.module}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {slot.teacher}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {slot.room}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300 text-xs font-mono bg-[#111724] px-2.5 py-1 rounded-lg border border-[#1f2c42] shrink-0">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>{slot.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f293d] flex items-center justify-between bg-[#0e131d]">
          <span className="text-[11px] text-slate-500 font-mono">
            Régime hebdomadaire: 24 Heures / Semaine
          </span>
          <div className="flex items-center gap-2">
            <Magnet padding={8} magnetStrength={0.2}>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#1b263b] hover:bg-[#23324d] text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>
            </Magnet>
            <Magnet padding={8} magnetStrength={0.2}>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </Magnet>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
};
