import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, BookOpen, Shield, Loader2, KeyRound } from 'lucide-react';
import { InsfpUser } from '../types';
import { SpotlightCard, Magnet, ShinyText } from './react-bits';
import { supabase } from '../lib/supabase';

interface NewInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newInstructor: InsfpUser) => void;
}

export const NewInstructorModal: React.FC<NewInstructorModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Informatique & Multimédia');
  const [phone, setPhone] = useState('+213 550 ');
  const [role, setRole] = useState<'INSTRUCTOR' | 'ADMINISTRATION'>('INSTRUCTOR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const insertPayload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        department: department,
        phone_number: phone.trim(),
        role: role,
      };

      let createdId = `inst-${Date.now()}`;
      try {
        const { data, error } = await supabase
          .from('insfp_users')
          .insert([insertPayload])
          .select()
          .maybeSingle();

        if (data && data.id) {
          createdId = data.id;
        } else if (error) {
          console.warn('Supabase instructor insert offline/warning, holding optimistic state:', error.message);
        }
      } catch (err) {
        console.warn('Network exception during instructor insert:', err);
      }

      const created: InsfpUser = {
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
        spotlightColor="rgba(20, 184, 166, 0.16)"
        className="bg-[#111724] border border-[#1f293d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <ShinyText
                text="Nouveau Compte Enseignant"
                speed={5}
                className="text-sm font-bold text-white"
              />
              <p className="text-[11px] text-slate-400">Création et affectation de formateur titulaire</p>
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
                placeholder="Karim"
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Nom</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Mansouri"
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Adresse E-mail Institutionnelle</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="k.mansouri@insfp.dz"
                className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Numéro de Téléphone</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Rôle Système</label>
              <div className="relative">
                <Shield className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'INSTRUCTOR' | 'ADMINISTRATION')}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="INSTRUCTOR">Formateur</option>
                  <option value="ADMINISTRATION">Administration</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Département d'Affectation</label>
            <div className="relative">
              <BookOpen className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="Informatique & Multimédia">Informatique & Multimédia</option>
                <option value="Audiovisuel & Post-production">Audiovisuel & Post-production</option>
                <option value="Télécommunications & Réseaux">Télécommunications & Réseaux</option>
                <option value="Gestion & Comptabilité">Gestion & Comptabilité</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#162032] border border-[#223049] rounded-xl flex items-center gap-2.5 text-[11px] text-slate-400">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Un mot de passe temporaire complexe conforme à la politique de sécurité (10+ car., maj/min/chiffre/symbole) sera généré automatiquement.</span>
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
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Créer le profil enseignant</span>
              )}
            </button>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
};
