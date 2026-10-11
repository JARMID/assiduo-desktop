import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, Calendar, School, Loader2, FileBadge } from 'lucide-react';
import { Student } from '../types';
import { SpotlightCard, Magnet, ShinyText } from './react-bits';
import { supabase } from '../lib/supabase';

interface NewTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newStudent: Student) => void;
  classList: string[];
}

export const NewTraineeModal: React.FC<NewTraineeModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  classList,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // oxlint-disable-next-line react/purity
  const [matricule, setMatricule] = useState(() => `2026-${Math.floor(100 + Math.random() * 900)}`);
  const [birthDate, setBirthDate] = useState('2004-05-12');
  const [selectedClass, setSelectedClass] = useState(classList[0] || 'BTS Développement Web S3');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+213 555 ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const studentMatricule = matricule.trim();
      const studentFirst = firstName.trim();
      const studentLast = lastName.trim();
      const studentEmail =
        email.trim().toLowerCase() ||
        `${studentFirst.toLowerCase()}.${studentLast.toLowerCase()}@insfp.dz`;
      const studentPhone = phone.trim();
      const studentSpeciality = selectedClass.includes('Réseaux')
        ? 'Administration Réseaux'
        : 'Développement Web & Mobile';

      const insertPayload = {
        matricule: studentMatricule,
        first_name: studentFirst,
        last_name: studentLast,
        birth_date: birthDate,
        phone_number: studentPhone,
        email: studentEmail,
        class_name: selectedClass,
        speciality_name: studentSpeciality,
        attendance_rate: 100.0,
        total_absences: 0,
        unjustified_absences: 0,
        is_active: true,
      };

      let createdId = `st-${Date.now()}`;
      try {
        const { data, error } = await supabase
          .from('insfp_students')
          .insert([insertPayload])
          .select()
          .maybeSingle();

        if (data && data.id) {
          createdId = data.id;
        } else if (error) {
          console.warn('Supabase trainee insert offline/warning, holding optimistic state:', error.message);
        }
      } catch (err) {
        console.warn('Network exception during trainee insert:', err);
      }

      const created: Student = {
        id: createdId,
        ...insertPayload,
        created_at: new Date().toISOString(),
      };
      onCreated(created);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.16)"
        className="bg-[#111724] border border-[#1f293d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <ShinyText
                text="Inscription d'un Nouveau Stagiaire"
                speed={5}
                className="text-sm font-bold text-white"
              />
              <p className="text-[11px] text-slate-400">Registre scolarité INSFP et génération de matricule</p>
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
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Prénom</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Amine"
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Nom de famille</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Cherifi"
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Matricule Scolaire</label>
              <div className="relative">
                <FileBadge className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-semibold text-emerald-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Date de Naissance</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Section / Promotion</label>
            <div className="relative">
              <School className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {classList.length === 0 ? (
                  <option value="BTS Développement Web S3">BTS Développement Web S3</option>
                ) : (
                  classList.map((c, idx) => (
                    <option key={idx} value={c}>
                      {c}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Courriel Stagiaire</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="a.cherifi@insfp.dz"
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Téléphone Tuteur / Stagiaire</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
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
                  <span>Inscription...</span>
                </>
              ) : (
                <span>Valider l'inscription</span>
              )}
            </button>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
};
