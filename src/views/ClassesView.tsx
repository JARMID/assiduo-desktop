import React, { useState } from 'react';
import {
  School,
  Search,
  Users,
  Calendar,
  Layers,
  Plus,
  BookOpen,
} from 'lucide-react';
import { InsfpClass } from '../types';
import { NewClassModal } from '../components/NewClassModal';
import { ClassTimetableModal } from '../components/ClassTimetableModal';
import { SpotlightCard, CountUp, Magnet, AnimatedContent } from '../components/react-bits';

interface ClassesViewProps {
  classes: InsfpClass[];
  onRefresh: () => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ classes, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [timetableClass, setTimetableClass] = useState<InsfpClass | null>(null);

  const filtered = classes.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.speciality?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une section, filière..."
            className="w-full bg-[#182338] border border-[#23314a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium font-mono">
            <CountUp to={filtered.length} duration={0.8} /> promotion(s)
          </span>
          <Magnet padding={10} magnetStrength={0.2}>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Section</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Classes Grid */}
      <AnimatedContent distance={16} stagger={0.05} duration={0.45} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cls) => (
          <SpotlightCard
            key={cls.id}
            spotlightColor="rgba(16, 185, 129, 0.12)"
            className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-5 hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 text-[10px] font-mono font-bold">
                    {cls.code}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">{cls.name}</h3>
                </div>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <School className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Spécialité:{' '}
                <span className="text-slate-200 font-medium">
                  {cls.speciality?.name || 'Développement Web & Mobile'}
                </span>
              </div>

              {/* Badges / Metrics */}
              <div className="mt-4 pt-4 border-t border-[#1f2c42] grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Année {cls.academic_year}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Semestre S{cls.semester}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Capacité: {cls.capacity || 28} places</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Modules: 6 unités</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1b263b] flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-medium">
                Pédagogie active
              </span>
              <button
                onClick={() => setTimetableClass(cls)}
                className="px-2.5 py-1 bg-[#1a2538] hover:bg-[#23314a] text-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                Emploi du temps
              </button>
            </div>
          </SpotlightCard>
        ))}
      </AnimatedContent>

      {/* Modals */}
      <NewClassModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={() => {
          onRefresh();
        }}
      />

      <ClassTimetableModal
        isOpen={timetableClass !== null}
        onClose={() => setTimetableClass(null)}
        insfpClass={timetableClass}
      />
    </div>
  );
};
