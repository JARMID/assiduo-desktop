import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  Sparkles,
  X,
  FileBadge,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Plus,
  Download,
  QrCode,
  FileSpreadsheet,
  MessageSquare,
} from 'lucide-react';
import { Student } from '../types';
import { assessDropoutRisk, RiskAnalysisResult } from '../services/aiService';
import { NewTraineeModal } from '../components/NewTraineeModal';
import { StudentBadgeModal } from '../components/StudentBadgeModal';
import { BulkImportModal } from '../components/BulkImportModal';
import { SpotlightCard, ShinyText, Magnet, CountUp, AnimatedContent } from '../components/react-bits';

interface TraineesViewProps {
  students: Student[];
  onRefresh: () => void;
  onContactStudent?: (studentId: string) => void;
}

export const TraineesView: React.FC<TraineesViewProps> = ({
  students,
  onRefresh,
  onContactStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [badgeStudent, setBadgeStudent] = useState<Student | null>(null);
  const [isAssessingRisk, setIsAssessingRisk] = useState(false);
  const [aiRiskResult, setAiRiskResult] = useState<RiskAnalysisResult | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const exportCsv = () => {
    const headers = ['Matricule', 'Nom', 'Prénom', 'Section', 'Assiduité (%)', 'Total Absences (h)', 'Absences Non-Justifiées (h)', 'Téléphone'];
    const rows = filteredStudents.map((s) => [
      s.matricule,
      `"${s.last_name}"`,
      `"${s.first_name}"`,
      `"${s.class_name || ''}"`,
      s.attendance_rate || 100,
      s.total_absences || 0,
      s.unjustified_absences || 0,
      `"${s.phone_number || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    // oxlint-disable-next-line react/purity
    link.setAttribute('download', `INSFP_Registre_Stagiaires_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique classes
  const classesList = Array.from(
    new Set(students.map((s) => s.class_name).filter(Boolean))
  ) as string[];

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === 'ALL' || s.class_name === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleOpenDetail = (student: Student) => {
    setSelectedStudent(student);
    setAiRiskResult(null);
  };

  const handleRunAiRisk = async () => {
    if (!selectedStudent) return;
    setIsAssessingRisk(true);
    try {
      const result = await assessDropoutRisk(
        `${selectedStudent.first_name} ${selectedStudent.last_name}`,
        selectedStudent.total_absences || 0,
        selectedStudent.unjustified_absences || 0,
        selectedStudent.attendance_rate || 95,
        'Absences accumulées en fin de semaine'
      );
      setAiRiskResult(result);
    } finally {
      setIsAssessingRisk(false);
    }
  };

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
              placeholder="Nom, prénom ou matricule..."
              className="w-full bg-[#182338] border border-[#23314a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-[#182338] border border-[#23314a] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">Toutes les sections</option>
              {classesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {filteredStudents.length} stagiaire(s)
          </span>
          <Magnet padding={10} magnetStrength={0.2}>
            <button
              onClick={exportCsv}
              className="px-3 py-1.5 bg-[#1b263b] hover:bg-[#23324d] text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#263756]"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exporter CSV</span>
            </button>
          </Magnet>
          <Magnet padding={10} magnetStrength={0.2}>
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="px-3 py-1.5 bg-[#172338] hover:bg-[#1f304d] text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/30"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Importer CSV</span>
            </button>
          </Magnet>
          <Magnet padding={10} magnetStrength={0.2}>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Stagiaire</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Trainees Table */}
      <AnimatedContent distance={16} duration={0.4} className="bg-[#141d2e] border border-[#1f2c42] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101726] border-b border-[#1f2c42] text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Matricule</th>
                <th className="py-3 px-4">Stagiaire</th>
                <th className="py-3 px-4">Section / Spécialité</th>
                <th className="py-3 px-4 text-center">Assiduité</th>
                <th className="py-3 px-4 text-center">Heures Abs.</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b263b] text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    Aucun stagiaire trouvé correspondant aux filtres.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const rate = st.attendance_rate ?? 95;
                  const rateColor =
                    rate >= 90
                      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                      : rate >= 75
                      ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                      : 'text-rose-400 bg-rose-950/40 border-rose-800/40';

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-[#182338]/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {st.matricule}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {st.first_name} {st.last_name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {st.email || 'stagiaire@insfp.dz'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {st.class_name || 'Section Standard'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {st.speciality_name || 'Informatique'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${rateColor}`}
                        >
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="text-slate-300">{st.total_absences || 0} h</span>
                        {(st.unjustified_absences || 0) > 0 && (
                          <span className="text-[10px] text-rose-400 block font-sans">
                            {st.unjustified_absences} h sans motif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Inscrit
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {onContactStudent && (
                            <button
                              onClick={() => onContactStudent(st.id)}
                              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 border border-blue-500/20"
                              title="Ouvrir une discussion avec ce stagiaire"
                            >
                              <MessageSquare className="w-3 h-3 text-blue-400" />
                              <span>Contacter</span>
                            </button>
                          )}
                          <button
                            onClick={() => setBadgeStudent(st)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 border border-emerald-500/20"
                            title="Imprimer la carte officielle avec QR"
                          >
                            <QrCode className="w-3 h-3 text-emerald-400" />
                            <span>Badge</span>
                          </button>
                          <button
                            onClick={() => handleOpenDetail(st)}
                            className="px-2.5 py-1 bg-[#1e2a40] hover:bg-[#273754] text-slate-300 hover:text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Dossier</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AnimatedContent>

      {/* Trainee Detail Modal with Predictive Risk Engine */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.14)"
            className="bg-[#121927] border border-[#223049] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1c273d] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex items-start gap-4 pb-4 border-b border-[#1f2c42]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <ShinyText
                  text={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                  speed={5}
                  className="text-base font-bold text-white"
                />
                <div className="text-xs text-slate-400 mt-0.5">
                  Matricule: <span className="font-mono text-emerald-400">{selectedStudent.matricule}</span> • {selectedStudent.class_name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Spécialité: {selectedStudent.speciality_name || 'Filière Pédagogique'}
                </div>
              </div>
            </div>

            {/* Trainee Contact & Attributes */}
            <div className="grid grid-cols-2 gap-3 py-4 border-b border-[#1f2c42] text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedStudent.phone_number || '+213 550 12 34 56'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{selectedStudent.email || 'stagiaire@insfp.dz'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Né(e) le: {selectedStudent.birth_date || '14/05/2003'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <FileBadge className="w-3.5 h-3.5 text-slate-400" />
                <span>Régime: Demi-pensionnaire</span>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="py-4 border-b border-[#1f2c42]">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
                Bilan d'Assiduité Pédagogique
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#182338] border border-[#23314a] rounded-lg">
                  <div className="text-[10px] text-slate-400">Taux Global</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5 font-mono">
                    <CountUp
                      to={selectedStudent.attendance_rate ?? 95}
                      decimals={1}
                      suffix="%"
                      duration={0.9}
                    />
                  </div>
                </div>
                <div className="p-3 bg-[#182338] border border-[#23314a] rounded-lg">
                  <div className="text-[10px] text-slate-400">Total Absences</div>
                  <div className="text-base font-bold text-slate-200 mt-0.5 font-mono">
                    <CountUp
                      to={selectedStudent.total_absences || 0}
                      suffix=" h"
                      duration={0.9}
                    />
                  </div>
                </div>
                <div className="p-3 bg-[#182338] border border-[#23314a] rounded-lg">
                  <div className="text-[10px] text-slate-400">Non Justifiées</div>
                  <div className="text-base font-bold text-rose-400 mt-0.5 font-mono">
                    <CountUp
                      to={selectedStudent.unjustified_absences || 0}
                      suffix=" h"
                      duration={0.9}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Risk Assessment Engine */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Évaluation Prédictive du Risque d'Abandon</span>
                </div>
                {!aiRiskResult && (
                  <button
                    onClick={handleRunAiRisk}
                    disabled={isAssessingRisk}
                    className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAssessingRisk ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyse en cours...</span>
                      </>
                    ) : (
                      <span>Calculer le risque</span>
                    )}
                  </button>
                )}
              </div>

              {aiRiskResult && (
                <div className="p-4 rounded-xl bg-[#162133] border border-[#24334f] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">
                      Score de vulnérabilité:
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        aiRiskResult.riskTier === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : aiRiskResult.riskTier === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      Palier {aiRiskResult.riskTier} ({aiRiskResult.riskScore}/100)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{aiRiskResult.commentary}"
                  </p>

                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block mb-1">
                      Mesures préconisées par le système:
                    </span>
                    <ul className="list-disc pl-4 space-y-1">
                      {aiRiskResult.recommendedMeasures.map((measure, idx) => (
                        <li key={idx}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBadgeStudent(selectedStudent)}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Imprimer Carte</span>
                </button>
                {onContactStudent && (
                  <button
                    onClick={() => {
                      const id = selectedStudent.id;
                      setSelectedStudent(null);
                      onContactStudent(id);
                    }}
                    className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>Contacter</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-[#1a2436] hover:bg-[#222f46] text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Modals */}
      <NewTraineeModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={() => {
          onRefresh();
        }}
        classList={classesList}
      />

      <StudentBadgeModal
        isOpen={Boolean(badgeStudent)}
        student={badgeStudent}
        onClose={() => setBadgeStudent(null)}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={(imported) => {
          imported.forEach((st) => students.unshift(st));
          onRefresh();
        }}
        classList={classesList}
      />
    </div>
  );
};
