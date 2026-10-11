import React, { useState } from 'react';
import { X, School, BookOpen, Layers, Users, Calendar, Loader2 } from 'lucide-react';
import { InsfpClass } from '../types';
import { SpotlightCard, Magnet, ShinyText } from './react-bits';
import { supabase } from '../lib/supabase';

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newClass: InsfpClass) => void;
}

export const NewClassModal: React.FC<NewClassModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [code, setCode] = useState('BTS-DEV-S4');
  const [name, setName] = useState('BTS Développement Web & Mobile S4');
  const [department, setDepartment] = useState('Informatique & Multimédia');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState(4);
  const [capacity, setCapacity] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const insertPayload = {
        code: code.trim(),
        name: name.trim(),
        academic_year: academicYear,
        semester: semester,
        capacity: capacity,
      };

      let createdId = `cls-${Date.now()}`;
      try {
        const { data, error } = await supabase
          .from('insfp_classes')
          .insert([insertPayload])
          .select()
          .maybeSingle();

        if (data && data.id) {
          createdId = data.id;
        } else if (error) {
          console.warn('Supabase class insert offline/warning, holding optimistic state:', error.message);
        }
      } catch (err) {
        console.warn('Network exception during class insert:', err);
      }

      const created: InsfpClass = {
        id: createdId,
        code: code.trim(),
        name: name.trim(),
        academic_year: academicYear,
        semester: semester,
        capacity: capacity,
        speciality_id: 'spec-1',
        speciality: {
          id: 'spec-1',
          code: code.slice(0, 7),
          name: department,
          department: department,
          created_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };
      onCreated(created);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.16)"
        className="bg-[#111724] border border-[#1f293d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <ShinyText
                text="Nouvelle Promotion / Section"
                speed={5}
                className="text-sm font-bold text-white"
              />
              <p className="text-[11px] text-slate-400">Enregistrement d'une cohorte pédagogique INSFP</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Code Filière</label>
              <div className="relative">
                <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="BTS-DEV-S1"
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Capacité (Places)</label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  required
                  min={10}
                  max={45}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Intitulé Officiel</label>
            <div className="relative">
              <BookOpen className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="BTS Audiovisuel Option Montage"
                className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Département de Rattachement</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Informatique & Multimédia">Informatique & Multimédia</option>
              <option value="Audiovisuel & Post-production">Audiovisuel & Post-production</option>
              <option value="Télécommunications & Réseaux">Télécommunications & Réseaux</option>
              <option value="Gestion & Comptabilité">Gestion & Comptabilité</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Année Académique</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2025-2026"
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Semestre</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={1}>Semestre 1 (S1)</option>
                <option value={2}>Semestre 2 (S2)</option>
                <option value={3}>Semestre 3 (S3)</option>
                <option value={4}>Semestre 4 (S4)</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#1f293d] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#162032] hover:bg-[#1a263d] text-slate-300 rounded-lg text-xs font-medium border border-[#223049] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <span>Enregistrer la section</span>
              )}
            </button>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
};
