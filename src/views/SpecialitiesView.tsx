import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Users,
  Clock,
  Award,
  Layers,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Speciality } from '../types';
import { supabase } from '../lib/supabase';
import { sound } from '../lib/audioFeedback';
import { Magnet } from '../components/react-bits';

interface SpecialitiesViewProps {
  specialities: Speciality[];
  onRefresh: () => void;
}

export const SpecialitiesView: React.FC<SpecialitiesViewProps> = ({
  specialities,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiplomaFilter, setSelectedDiplomaFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedSpeciality, setSelectedSpeciality] = useState<Speciality | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form states for new speciality
  const [newCode, setNewCode] = useState('');
  const [newNameFr, setNewNameFr] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newDiploma, setNewDiploma] = useState('Brevet de Technicien Supérieur (BTS)');
  const [newDuration, setNewDuration] = useState('30 mois (5 semestres)');
  const [newTrainingType, setNewTrainingType] = useState('Présentiel');
  const [newConditions, setNewConditions] = useState('3ème Année Secondaire accomplie');
  const [newCapacity, setNewCapacity] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter options
  const diplomaOptions = useMemo(() => {
    const set = new Set<string>();
    specialities.forEach((s) => {
      if (s.diploma) set.add(s.diploma);
    });
    return Array.from(set);
  }, [specialities]);

  const filteredSpecialities = useMemo(() => {
    return specialities.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        (item.name_fr && item.name_fr.toLowerCase().includes(q)) ||
        (item.name_ar && item.name_ar.toLowerCase().includes(q)) ||
        (item.diploma && item.diploma.toLowerCase().includes(q));

      const matchDiploma =
        selectedDiplomaFilter === 'ALL' || item.diploma === selectedDiplomaFilter;

      return matchSearch && matchDiploma;
    });
  }, [specialities, searchQuery, selectedDiplomaFilter]);

  // Aggregate stats
  const totalCapacity = useMemo(() => {
    return specialities.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  }, [specialities]);

  const handleCreateSpeciality = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newCode.trim()) {
      setFormError('Le code de la filière est obligatoire.');
      return;
    }
    if (!newNameFr.trim() && !newNameAr.trim()) {
      setFormError('Veuillez renseigner au moins un intitulé (français ou arabe).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        name_fr: newNameFr.trim() || newCode.trim(),
        name_ar: newNameAr.trim() || null,
        diploma: newDiploma.trim() || null,
        duration: newDuration.trim() || null,
        training_type: newTrainingType.trim() || 'Présentiel',
        conditions: newConditions.trim() || null,
        capacity: parseInt(newCapacity, 10) || 30,
      };

      const { error } = await supabase.from('insfp_specialities').insert([payload]);

      if (error) throw error;

      sound.playSuccess();
      setIsNewModalOpen(false);
      setNewCode('');
      setNewNameFr('');
      setNewNameAr('');
      onRefresh();
    } catch (err: any) {
      console.error('Failed to create speciality:', err);
      sound.playError();
      setFormError(err.message || 'Impossible d enregistrer cette filière.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Statistical Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Filières Homologuées</div>
            <div className="text-2xl font-bold text-white mt-1">{specialities.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>Programmes officiels MFEP</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Capacité Pédagogique</div>
            <div className="text-2xl font-bold text-white mt-1">{totalCapacity}</div>
            <div className="text-[11px] text-blue-400 mt-1">Places stagiaires ouvertes</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Diplômes d État</div>
            <div className="text-2xl font-bold text-white mt-1">
              {diplomaOptions.length}
            </div>
            <div className="text-[11px] text-amber-400 mt-1">BTS, CMP, CAP et Qualifiants</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Modes d Enseignement</div>
            <div className="text-2xl font-bold text-white mt-1">Présentiel & Apprentissage</div>
            <div className="text-[11px] text-purple-400 mt-1">INSFP Ouled Fayet 2026</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Modes, Add Button */}
      <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par code, intitulé français ou arabe..."
              className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Diploma Filter Select */}
          {diplomaOptions.length > 0 && (
            <select
              value={selectedDiplomaFilter}
              onChange={(e) => setSelectedDiplomaFilter(e.target.value)}
              aria-label="Filtrer par type de diplôme"
              className="bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tous les diplômes ({specialities.length})</option>
              {diplomaOptions.map((dip) => (
                <option key={dip} value={dip}>
                  {dip}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Mode Toggle and Add Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-[#162032] border border-[#223049] rounded-lg p-0.5 text-xs text-slate-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              Cartes
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              Tableau
            </button>
          </div>

          <Magnet padding={8} magnetStrength={0.2}>
            <button
              onClick={() => {
                sound.playClick();
                setIsNewModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Filière</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Main Specialities Surface */}
      {filteredSpecialities.length === 0 ? (
        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-base font-semibold text-slate-200">
            Aucune filière trouvée
          </div>
          <div className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Aucune spécialité ne correspond à vos filtres actuels. Réinitialisez la recherche ou ajoutez une nouvelle filière.
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpecialities.map((spec) => (
            <div
              key={spec.id}
              onClick={() => setSelectedSpeciality(spec)}
              className="bg-[#111724] hover:bg-[#141c2c] border border-[#1f293d] hover:border-emerald-500/40 rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Header Code and Diploma Pill */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-md">
                    {spec.code}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300 bg-[#1a2538] border border-[#23334c] px-2 py-0.5 rounded-full truncate max-w-[160px]">
                    {spec.diploma || 'Formation Diplômante'}
                  </span>
                </div>

                {/* French Name */}
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {spec.name_fr || spec.name || spec.code}
                </h3>

                {/* Arabic Name (RTL) */}
                {spec.name_ar && (
                  <p
                    dir="rtl"
                    className="text-xs font-medium text-slate-300 mt-2 font-arabic leading-relaxed line-clamp-2"
                  >
                    {spec.name_ar}
                  </p>
                )}
              </div>

              {/* Specs Footer */}
              <div className="mt-5 pt-3 border-t border-[#1a2336] flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{spec.duration || '30 mois'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Capacité: {spec.capacity || 30}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#111724] border border-[#1f293d] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0e1420] border-b border-[#1f293d] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Intitulé Officiel (FR)</th>
                  <th className="px-5 py-3.5 text-right font-arabic">التسمية الرسمية (AR)</th>
                  <th className="px-5 py-3.5">Diplôme d État</th>
                  <th className="px-5 py-3.5">Durée</th>
                  <th className="px-5 py-3.5 text-center">Capacité</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2336] text-xs">
                {filteredSpecialities.map((spec) => (
                  <tr
                    key={spec.id}
                    className="hover:bg-[#141d2e] transition-colors cursor-pointer"
                    onClick={() => setSelectedSpeciality(spec)}
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                      {spec.code}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white max-w-xs truncate">
                      {spec.name_fr || spec.name || spec.code}
                    </td>
                    <td
                      dir="rtl"
                      className="px-5 py-3.5 text-slate-300 font-arabic text-right max-w-xs truncate"
                    >
                      {spec.name_ar || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{spec.diploma || 'BTS'}</td>
                    <td className="px-5 py-3.5 text-slate-400">{spec.duration || '30 mois'}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-emerald-300">
                      {spec.capacity || 30}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpeciality(spec);
                        }}
                        className="px-2.5 py-1 bg-[#1a2538] hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-[#24354e] rounded text-[11px] transition-colors"
                      >
                        Fiche
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Speciality Details Modal */}
      {selectedSpeciality && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111724] border border-[#223049] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-[#1f293d] pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">
                  {selectedSpeciality.code}
                </span>
                <h2 className="text-lg font-bold text-white mt-2">
                  {selectedSpeciality.name_fr || selectedSpeciality.name || selectedSpeciality.code}
                </h2>
                {selectedSpeciality.name_ar && (
                  <p dir="rtl" className="text-sm font-semibold text-slate-300 font-arabic mt-1">
                    {selectedSpeciality.name_ar}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedSpeciality(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2336] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#162032] border border-[#223049] rounded-lg">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Diplôme Délivré
                </div>
                <div className="font-semibold text-slate-200 mt-1">
                  {selectedSpeciality.diploma || 'Brevet de Technicien Supérieur'}
                </div>
              </div>

              <div className="p-3 bg-[#162032] border border-[#223049] rounded-lg">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Durée de Formation
                </div>
                <div className="font-semibold text-slate-200 mt-1">
                  {selectedSpeciality.duration || '30 mois'}
                </div>
              </div>

              <div className="p-3 bg-[#162032] border border-[#223049] rounded-lg">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Capacité d Accueil
                </div>
                <div className="font-semibold text-slate-200 mt-1">
                  {selectedSpeciality.capacity || 30} stagiaires
                </div>
              </div>

              <div className="p-3 bg-[#162032] border border-[#223049] rounded-lg">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Mode d Enseignement
                </div>
                <div className="font-semibold text-slate-200 mt-1">
                  {selectedSpeciality.training_type || 'Présentiel'}
                </div>
              </div>
            </div>

            {/* Conditions of Admission */}
            <div className="p-3.5 bg-[#162032] border border-[#223049] rounded-lg text-xs space-y-1">
              <div className="text-slate-400 font-medium">Conditions d Accès Pédagogiques :</div>
              <div className="text-slate-200 leading-relaxed">
                {selectedSpeciality.conditions ||
                  '3ème Année Secondaire accomplie avec orientation favorable de la commission de sélection.'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSpeciality(null)}
                className="px-4 py-2 bg-[#1a2336] hover:bg-[#223049] text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Speciality Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111724] border border-[#223049] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Enregistrer une Filière</h2>
                  <div className="text-xs text-slate-400">
                    Ajouter une spécialité au catalogue pédagogique de l institut
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2336] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSpeciality} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Code Spécialité *
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Ex: DEV_MOB, RES_SEC"
                    className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Capacité d Accueil
                  </label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    placeholder="30"
                    min="1"
                    className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Intitulé en Français (Officiel)
                </label>
                <input
                  type="text"
                  value={newNameFr}
                  onChange={(e) => setNewNameFr(e.target.value)}
                  placeholder="Ex: Développement Web et Applications Mobiles"
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1 text-right font-arabic">
                  التسمية الرسمية باللغة العربية
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  placeholder="مثال: تطوير مواقع الويب وتطبيقات الهاتف المحمول"
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-arabic text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Diplôme Sanctionné
                  </label>
                  <select
                    value={newDiploma}
                    onChange={(e) => setNewDiploma(e.target.value)}
                    className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Brevet de Technicien Supérieur (BTS)">
                      Brevet de Technicien Supérieur (BTS)
                    </option>
                    <option value="Certificat de Maîtrise Professionnelle (CMP)">
                      Certificat de Maîtrise Professionnelle (CMP)
                    </option>
                    <option value="Certificat d Aptitude Professionnelle (CAP)">
                      Certificat d Aptitude Professionnelle (CAP)
                    </option>
                    <option value="Certificat de Qualification Professionnelle (CQP)">
                      Certificat de Qualification Professionnelle (CQP)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Durée des Études
                  </label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="Ex: 30 mois, 24 mois"
                    className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Conditions d Admission
                  </label>
                  <input
                    type="text"
                    value={newConditions}
                    onChange={(e) => setNewConditions(e.target.value)}
                    placeholder="Ex: 3ème Année Secondaire"
                    className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Mode d Enseignement
                  </label>
                  <select
                    value={newTrainingType}
                    onChange={(e) => setNewTrainingType(e.target.value)}
                    className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Présentiel">Présentiel</option>
                    <option value="Apprentissage">Apprentissage</option>
                    <option value="Formation Continue / Soir">Formation Continue / Soir</option>
                    <option value="Passerelle">Passerelle</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f293d]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-[#1a2336] hover:bg-[#223049] text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer la Filière'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
