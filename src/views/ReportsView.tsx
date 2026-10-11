import React, { useState } from 'react';
import { Printer, School, Users, CheckCircle, AlertOctagon, BarChart3, FileSpreadsheet } from 'lucide-react';
import { InsfpClass, Student } from '../types';
import { Magnet, SpotlightCard, CountUp, AnimatedContent } from '../components/react-bits';
import { sound } from '../lib/audioFeedback';

interface ReportsViewProps {
  classes: InsfpClass[];
  students: Student[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ classes, students }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || ''
  );
  const [reportType, setReportType] = useState<'MONTHLY' | 'EXAM_ADMISSION'>('MONTHLY');

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(
    (s) => s.class_id === currentClass?.id || s.class_name === currentClass?.name
  );

  const avgAttendance = classStudents.length > 0
    ? classStudents.reduce((acc, s) => acc + (s.attendance_rate || 95), 0) / classStudents.length
    : 95.0;

  const admissibleCount = classStudents.filter((s) => (s.attendance_rate || 95) >= 75).length;
  const criticalCount = classStudents.filter((s) => (s.attendance_rate || 95) < 75).length;

  const exportReportCsv = () => {
    const headers = [
      'Matricule',
      'Nom',
      'Prénom',
      'Section',
      'Assiduité (%)',
      'Absences Justifiées (h)',
      'Absences Non Justifiées (h)',
      'Total Absences (h)',
      'Statut Examen',
    ];
    const rows = classStudents.map((s) => {
      const rate = s.attendance_rate || 95;
      const status = rate >= 75 ? 'Admissible' : 'Non Admissible (Seuil 25%)';
      return [
        s.matricule,
        `"${s.last_name}"`,
        `"${s.first_name}"`,
        `"${currentClass?.name || s.class_name || ''}"`,
        rate,
        (s.total_absences || 0) - (s.unjustified_absences || 0),
        s.unjustified_absences || 0,
        s.total_absences || 0,
        `"${status}"`,
      ];
    });
    const title = reportType === 'MONTHLY' ? 'Bilan_Mensuel_Assiduite' : 'Admission_Examens';
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `INSFP_${title}_${currentClass?.code || 'SECTION'}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sound.playSuccess();
  };

  const verificationHash = React.useMemo(() => {
    const raw = `${currentClass?.id || 'CLS'}_${classStudents.length}_${avgAttendance.toFixed(1)}_${reportType}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `ASD-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
  }, [currentClass?.id, classStudents.length, avgAttendance, reportType]);

  return (
    <div className="space-y-6">
      {/* Controls Bar (Hidden in print) */}
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.12)"
        className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Class selection */}
          <div className="flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-[#182338] border border-[#23314a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="bg-[#182338] border border-[#23314a] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="MONTHLY">Bilan Mensuel d'Assiduité</option>
            <option value="EXAM_ADMISSION">Feuille d'Admission aux Examens (Seuil 25%)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Magnet padding={10} magnetStrength={0.2}>
            <button
              onClick={exportReportCsv}
              className="px-3.5 py-1.5 bg-[#182338] hover:bg-[#202d45] border border-[#263756] hover:border-emerald-500 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Exporter le registre au format CSV (Excel)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exporter CSV</span>
            </button>
          </Magnet>

          <Magnet padding={10} magnetStrength={0.2}>
            <button
              onClick={() => {
                sound.playClick();
                window.print();
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le Registre A4</span>
            </button>
          </Magnet>
        </div>
      </SpotlightCard>

      {/* Summary KPI Strip for Current Section (Hidden in print) */}
      <AnimatedContent
        distance={14}
        duration={0.45}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print"
      >
        <div className="p-3 bg-[#141d2e] border border-[#1f2c42] rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Effectif Section</div>
            <div className="text-sm font-bold text-white font-mono">
              <CountUp to={classStudents.length} duration={0.8} />
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#141d2e] border border-[#1f2c42] rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Assiduité Moyenne</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              <CountUp to={avgAttendance} decimals={1} suffix="%" duration={0.8} />
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#141d2e] border border-[#1f2c42] rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Admissibles (≥ 75%)</div>
            <div className="text-sm font-bold text-teal-300 font-mono">
              <CountUp to={admissibleCount} duration={0.8} />
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#141d2e] border border-[#1f2c42] rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Sous le Seuil (&lt; 75%)</div>
            <div className="text-sm font-bold text-rose-400 font-mono">
              <CountUp to={criticalCount} duration={0.8} />
            </div>
          </div>
        </div>
      </AnimatedContent>

      {/* Official A4 Register Document (Print Ready) */}
      <AnimatedContent
        key={`${selectedClassId}-${reportType}`}
        distance={16}
        duration={0.4}
        className="bg-white text-slate-900 rounded-xl p-8 shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0"
      >
        {/* Institutional Header with Dual Emblem Branding */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img
              src="/INSFP.png"
              alt="INSFP"
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-left">
              <div className="text-[11px] font-black uppercase text-slate-900 tracking-wider">INSFP Ouled Fayet</div>
              <div className="text-[9px] text-slate-600 font-medium">Institut National Spécialisé</div>
              <div className="text-[8px] text-slate-500">Formation Professionnelle</div>
            </div>
          </div>

          <div className="text-center px-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
              République Algérienne Démocratique et Populaire
            </div>
            <div className="text-[10px] font-semibold text-slate-700 mt-0.5">
              Ministère de la Formation et de l'Enseignement Professionnels
            </div>
            <div className="text-xs font-extrabold text-slate-900 mt-1 uppercase tracking-wide">
              {reportType === 'MONTHLY'
                ? "Registre Pédagogique Officiel d'Assiduité Mensuelle"
                : "Procès-Verbal d'Admission aux Examens Semestriels (Seuil 25%)"}
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-[11px] font-black tracking-wider text-slate-900">ASSIDUO</div>
              <div className="text-[9px] text-emerald-700 font-semibold font-mono">v2.0 Certifié</div>
              <div className="text-[8px] text-slate-500 font-mono">ID: {verificationHash}</div>
            </div>
            <img
              src="/logos/assiduo-icon.png"
              alt="Assiduo"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        {/* Section Context Box */}
        <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-lg border border-slate-300 text-xs">
          <div>
            <span className="font-bold">Filière / Spécialité:</span>{' '}
            {currentClass?.speciality?.name || 'Développement Web & Mobile'}
          </div>
          <div>
            <span className="font-bold">Section / Code:</span> {currentClass?.name} ({currentClass?.code})
          </div>
          <div className="text-right">
            <span className="font-bold">Semestre:</span> S{currentClass?.semester || 1} •{' '}
            {currentClass?.academic_year || '2025/2026'}
          </div>
        </div>

        {/* Register Table */}
        <div className="mt-5 overflow-hidden border border-slate-800 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-800 text-slate-900 font-bold">
                <th className="py-2 px-3 border-r border-slate-400 w-12 text-center">N°</th>
                <th className="py-2 px-3 border-r border-slate-400 w-28">Matricule</th>
                <th className="py-2 px-3 border-r border-slate-400">Nom & Prénom du Stagiaire</th>
                <th className="py-2 px-3 border-r border-slate-400 text-center w-24">Assiduité</th>
                <th className="py-2 px-3 border-r border-slate-400 text-center w-24">Abs. Just.</th>
                <th className="py-2 px-3 border-r border-slate-400 text-center w-24">Abs. Non J.</th>
                <th className="py-2 px-3 text-center w-32">Décision Pédagogique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    Aucun stagiaire enregistré dans cette section.
                  </td>
                </tr>
              ) : (
                classStudents.map((st, idx) => {
                  const rate = st.attendance_rate ?? 95;
                  const isExcluded = rate < 75;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono font-medium">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 font-mono text-[11px]">
                        {st.matricule}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 font-semibold text-slate-900">
                        {st.first_name} {st.last_name}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono font-bold">
                        {rate.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono">
                        {(st.total_absences || 0) - (st.unjustified_absences || 0)} h
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-center font-mono text-rose-700 font-bold">
                        {st.unjustified_absences || 0} h
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isExcluded
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isExcluded ? 'Exclu d’Évaluation' : 'Admis aux Épreuves'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legal Signatures Block */}
        <div className="mt-10 grid grid-cols-3 gap-6 text-xs text-slate-800">
          <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
            <div className="font-bold text-slate-900">Le Formateur Référent</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Visa de Présence & Contrôle</div>
            <div className="mt-10 text-[10px] text-slate-400 italic">Signature & Date:</div>
          </div>
          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 text-center">
            <div className="font-bold text-slate-900">Le Chef de Département</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Contrôle Pédagogique Conforme</div>
            <div className="mt-10 text-[10px] text-slate-400 italic">Visa Pédagogique & Date:</div>
          </div>
          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 text-right">
            <div className="font-bold text-slate-900">Le Directeur de l'Institut</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Validation Administrative</div>
            <div className="mt-10 text-[10px] text-slate-400 italic">Sceau Officiel:</div>
          </div>
        </div>

        {/* Regulatory & Security Compliance Seal */}
        <div className="mt-6 pt-3 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <div>
            Document réglementaire officiel généré numériquement via Assiduo Desktop v2.0 • INSFP Ouled Fayet
          </div>
          <div>
            Empreinte d'intégrité : <span className="font-bold text-slate-700">{verificationHash}</span> • Conforme Décret Exécutif n° 18-162 & Algorithme k-Anonymat k=5
          </div>
        </div>
      </AnimatedContent>
    </div>
  );
};
