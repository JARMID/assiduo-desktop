import React, { useState } from 'react';
import { X, Calendar, BookOpen, School, Loader2, Radio } from 'lucide-react';
import { Session } from '../types';
import { SpotlightCard, Magnet, ShinyText } from './react-bits';
import { supabase } from '../lib/supabase';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newSession: Session) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [module, setModule] = useState('Développement Web Frontend (React)');
  const [slot, setSlot] = useState('08:30 - 10:45');
  const [slotCode, setSlotCode] = useState('M1');
  const [room, setRoom] = useState('Labo Info 02');
  const [className, setClassName] = useState('BTS Développement Web S3');
  const [teacherName, setTeacherName] = useState('M. Khaldi');
  // oxlint-disable-next-line react/purity
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const times = slot.split(' - ');
      const startTime = times[0] || '08:30';
      const endTime = times[1] || '10:45';

      const insertPayload = {
        module_name: module.trim(),
        class_name: className.trim(),
        instructor_name: teacherName.trim(),
        room: room.trim(),
        date: date,
        start_time: startTime,
        end_time: endTime,
        session_type: 'COURSE',
        status: 'ACTIVE',
      };

      let createdId = `sess-${Date.now()}`;
      try {
        const { data, error } = await supabase
          .from('insfp_sessions')
          .insert([insertPayload])
          .select()
          .maybeSingle();

        if (data && data.id) {
          createdId = data.id;
        } else if (error) {
          console.warn('Supabase session insert offline/warning, holding optimistic state:', error.message);
        }
      } catch (err) {
        console.warn('Network exception during session insert:', err);
      }

      const created: Session = {
        id: createdId,
        class_id: 'cls-1',
        class_name: className.trim(),
        module_id: 'mod-1',
        module_name: module.trim(),
        instructor_id: 'inst-1',
        instructor_name: teacherName.trim(),
        room: room.trim(),
        date: date,
        start_time: startTime,
        end_time: endTime,
        session_type: 'COURSE',
        status: 'ACTIVE',
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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <ShinyText
                text="Programmer une Séance d'Appel"
                speed={5}
                className="text-sm font-bold text-white"
              />
              <p className="text-[11px] text-slate-400">Séance pédagogique officielle ou rattrapage</p>
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
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Module / Matière</label>
            <div className="relative">
              <BookOpen className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="Intitulé du module..."
                className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Section Pédagogique</label>
              <div className="relative">
                <School className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Formateur Responsable</label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Créneau Horaire</label>
              <select
                value={slotCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setSlotCode(val);
                  if (val === 'M1') setSlot('08:30 - 10:45');
                  if (val === 'M2') setSlot('10:45 - 13:00');
                  if (val === 'A1') setSlot('13:30 - 15:00');
                  if (val === 'A2') setSlot('15:00 - 17:00');
                }}
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer font-mono"
              >
                <option value="M1">M1 (08h30-10h45)</option>
                <option value="M2">M2 (10h45-13h00)</option>
                <option value="A1">A1 (13h30-15h00)</option>
                <option value="A2">A2 (15h00-17h00)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Salle / Labo</label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Labo Info 02"
                className="w-full bg-[#162032] border border-[#223049] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="p-3 bg-[#162032] border border-[#223049] rounded-xl flex items-center gap-2 text-[11px] text-emerald-400">
            <Radio className="w-4 h-4 shrink-0" />
            <span>La séance sera immédiatement accessible aux formateurs sur l'application mobile pour le scan QR.</span>
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
                <span>Créer la séance</span>
              )}
            </button>
          </div>
        </form>
      </SpotlightCard>
    </div>
  );
};
