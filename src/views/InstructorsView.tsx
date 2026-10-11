import React, { useState } from 'react';
import {
  Search,
  Mail,
  Phone,
  BookOpen,
  Plus,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { InsfpUser } from '../types';
import { NewInstructorModal } from '../components/NewInstructorModal';
import { InstructorAssignmentsModal } from '../components/InstructorAssignmentsModal';
import { SpotlightCard, CountUp, Magnet, AnimatedContent } from '../components/react-bits';

interface InstructorsViewProps {
  instructors: InsfpUser[];
  onRefresh: () => void;
}

export const InstructorsView: React.FC<InstructorsViewProps> = ({ instructors, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<InsfpUser | null>(null);

  const departments = Array.from(
    new Set(instructors.map((i) => i.department).filter(Boolean))
  ) as string[];

  const filtered = instructors.filter((inst) => {
    const fullName = `${inst.first_name} ${inst.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      selectedDept === 'ALL' || inst.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, prénom ou courriel..."
              className="w-full bg-[#182338] border border-[#23314a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#182338] border border-[#23314a] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tous les départements</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium font-mono">
            <CountUp to={filtered.length} duration={0.8} /> enseignant(s)
          </span>
          <Magnet padding={10} magnetStrength={0.2}>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Formateur</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Instructors Table */}
      <AnimatedContent distance={16} duration={0.4}>
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.08)"
          className="bg-[#141d2e] border border-[#1f2c42] rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101726] border-b border-[#1f2c42] text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Formateur</th>
                  <th className="py-3 px-4">Coordonnées</th>
                  <th className="py-3 px-4">Département</th>
                  <th className="py-3 px-4">Rôle Système</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b263b] text-slate-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      Aucun formateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inst) => (
                    <tr
                      key={inst.id}
                      className="hover:bg-[#182338]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 font-bold text-xs">
                            {inst.first_name[0]}
                            {inst.last_name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {inst.first_name} {inst.last_name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Titulaire de section
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{inst.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{inst.phone_number || '+213 (0) 23 45 67 89'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-300">
                          {inst.department || 'Informatique & Réseaux'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#1c273d] text-emerald-300 border border-[#263756]">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          {inst.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Actif
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInstructor(inst)}
                          className="px-2.5 py-1 bg-[#1e2a40] hover:bg-[#273754] text-slate-300 hover:text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          <span>Modules</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      </AnimatedContent>

      {/* Modals */}
      <NewInstructorModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={() => {
          onRefresh();
        }}
      />

      <InstructorAssignmentsModal
        isOpen={selectedInstructor !== null}
        onClose={() => setSelectedInstructor(null)}
        instructor={selectedInstructor}
      />
    </div>
  );
};
