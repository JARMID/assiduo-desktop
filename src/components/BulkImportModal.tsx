import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
} from 'lucide-react';
import { Student } from '../types';
import { SpotlightCard, Magnet, ShinyText, CountUp } from './react-bits';
import { supabase } from '../lib/supabase';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedStudents: Student[]) => void;
  classList: string[];
}

interface ParsedRow {
  matricule: string;
  lastName: string;
  firstName: string;
  className: string;
  birthDate: string;
  phone: string;
  email: string;
  isValid: boolean;
  warnings: string[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  classList,
}) => {
  const [rawText, setRawText] = useState('');
  const [defaultClass, setDefaultClass] = useState(classList[0] || 'BTS Développement Web S3');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = 'Matricule,Nom,Prénom,Section,Date_Naissance,Téléphone,Email';
    const sampleRows = [
      '2026-101,BOUKHALFA,Yacine,BTS Développement Web S3,2004-03-15,+213 555 11 22 33,yacine.boukhalfa@insfp.dz',
      '2026-102,MEZIANE,Nadia,BTS Développement Web S3,2003-08-22,+213 661 44 55 66,nadia.meziane@insfp.dz',
      '2026-103,CHIKH,Farid,BTS Administration Réseaux S1,2004-11-05,+213 770 88 99 00,farid.chikh@insfp.dz',
    ];
    const csv = '\uFEFF' + [headers, ...sampleRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'INSFP_Modele_Import_Stagiaires.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        parseContent(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseContent = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Determine delimiter: comma, semicolon, or tab
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes(';') && !firstLine.includes(',')) {
      delimiter = ';';
    } else if (firstLine.includes('\t')) {
      delimiter = '\t';
    }

    const startIndex =
      firstLine.toLowerCase().includes('matricule') ||
      firstLine.toLowerCase().includes('nom')
        ? 1
        : 0;

    const results: ParsedRow[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cols = line
        .split(delimiter)
        .map((c) => c.replace(/^["']|["']$/g, '').trim());

      if (cols.length < 2) continue;

      let matricule = cols[0] || '';
      let lastName = cols[1] || '';
      let firstName = cols[2] || '';
      let className = cols[3] || defaultClass;
      let birthDate = cols[4] || '2004-01-01';
      let phone = cols[5] || '+213 555 ';
      let email = cols[6] || '';

      const warnings: string[] = [];

      if (!matricule) {
        matricule = `2026-${Math.floor(100 + Math.random() * 900)}`;
        warnings.push('Matricule auto-généré');
      }

      if (!lastName) {
        warnings.push('Nom manquant');
      }

      if (!firstName) {
        warnings.push('Prénom manquant');
      }

      if (!email && firstName && lastName) {
        email = `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}@insfp.dz`;
      }

      const isValid = Boolean(lastName && firstName);

      results.push({
        matricule,
        lastName,
        firstName,
        className,
        birthDate,
        phone,
        email,
        isValid,
        warnings,
      });
    }

    setParsedRows(results);
    if (results.length > 0) {
      setActiveStep('PREVIEW');
    }
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      const validRows = parsedRows.filter((r) => r.isValid);
      const insertPayloads = validRows.map((r) => ({
        matricule: r.matricule,
        first_name: r.firstName,
        last_name: r.lastName,
        class_name: r.className,
        birth_date: r.birthDate,
        phone_number: r.phone,
        email: r.email,
        speciality_name: r.className.includes('Réseaux')
          ? 'Administration Réseaux'
          : 'Développement Web & Mobile',
        attendance_rate: 100.0,
        total_absences: 0,
        unjustified_absences: 0,
        is_active: true,
      }));

      let insertedRows: any[] | null = null;
      try {
        const { data, error } = await supabase
          .from('insfp_students')
          .insert(insertPayloads)
          .select();

        if (error) {
          console.warn('Bulk insert warning, persisting optimistic state:', error.message);
        } else {
          insertedRows = data;
        }
      } catch (err) {
        console.warn('Network exception during bulk insert:', err);
      }

      const createdStudents: Student[] = validRows.map((r, idx) => ({
        id: (insertedRows && insertedRows[idx]?.id) || `st-bulk-${Date.now()}-${idx}`,
        matricule: r.matricule,
        first_name: r.firstName,
        last_name: r.lastName,
        class_name: r.className,
        birth_date: r.birthDate,
        phone_number: r.phone,
        email: r.email,
        speciality_name: r.className.includes('Réseaux')
          ? 'Administration Réseaux'
          : 'Développement Web & Mobile',
        attendance_rate: 100.0,
        total_absences: 0,
        unjustified_absences: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      }));

      onImport(createdStudents);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <SpotlightCard
        spotlightColor="rgba(59, 130, 246, 0.15)"
        className="bg-[#111724] border border-[#1f293d] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <ShinyText
                text="Importation Massive de Stagiaires (CSV / Excel)"
                speed={5}
                className="text-sm font-bold text-white"
              />
              <p className="text-[11px] text-slate-400">
                Enrôlement groupé des promotions semestrielles INSFP
              </p>
            </div>
          </div>
          <Magnet padding={8} magnetStrength={0.2}>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2334] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </Magnet>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveStep('INPUT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeStep === 'INPUT'
                  ? 'bg-[#182338] text-white border-t border-x border-[#23314a]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Fichier ou Données Brutes
            </button>
            <button
              onClick={() => {
                if (parsedRows.length > 0) setActiveStep('PREVIEW');
              }}
              disabled={parsedRows.length === 0}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer disabled:opacity-40 ${
                activeStep === 'PREVIEW'
                  ? 'bg-[#182338] text-white border-t border-x border-[#23314a]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Prévisualisation ({parsedRows.length} lignes)
            </button>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 pb-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger Modèle CSV</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeStep === 'INPUT' ? (
            <div className="space-y-4">
              {/* Target Section */}
              <div className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-300 font-medium">
                  Section d'attribution par défaut:
                </span>
                <select
                  value={defaultClass}
                  onChange={(e) => setDefaultClass(e.target.value)}
                  className="bg-[#182338] border border-[#23314a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {classList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-[#23314a] hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-colors bg-[#0e1422]">
                <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-white">
                  Déposez votre fichier CSV / TXT ici
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Séparateurs acceptés: virgule (,), point-virgule (;) ou tabulation
                </div>
                <label className="mt-3 inline-block px-4 py-1.5 bg-[#1a2538] hover:bg-[#22314a] border border-[#2b3c5c] rounded-lg text-xs font-medium text-slate-200 cursor-pointer transition-colors">
                  <span>Parcourir mes fichiers</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Ou collez directement vos lignes copiées depuis Excel:
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`2026-101\tBOUKHALFA\tYacine\tBTS Dev Web S3\n2026-102\tMEZIANE\tNadia\tBTS Dev Web S3`}
                  rows={6}
                  className="w-full bg-[#0e1422] border border-[#1f293d] rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => parseContent(rawText)}
                  disabled={!rawText.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-md"
                >
                  Analyser le tableau
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#141d2e] border border-[#1f2c42] rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Détecté</span>
                  <span className="text-sm font-bold text-white">
                    {parsedRows.length}
                  </span>
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Valides
                  </span>
                  <span className="text-sm font-bold text-emerald-300">
                    {validCount}
                  </span>
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Incomplets
                  </span>
                  <span className="text-sm font-bold text-amber-300">
                    {invalidCount}
                  </span>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-[#1f2c42] rounded-xl overflow-hidden">
                <div className="max-h-[340px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e1422] text-slate-400 sticky top-0 border-b border-[#1f2c42]">
                      <tr>
                        <th className="py-2.5 px-3">Matricule</th>
                        <th className="py-2.5 px-3">Nom & Prénom</th>
                        <th className="py-2.5 px-3">Section</th>
                        <th className="py-2.5 px-3">Téléphone</th>
                        <th className="py-2.5 px-3 text-center">État</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#182338]">
                      {parsedRows.map((r, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-[#141d2e]/60 transition-colors ${
                            !r.isValid ? 'bg-rose-950/10' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-mono text-[11px] text-emerald-400">
                            {r.matricule}
                          </td>
                          <td className="py-2 px-3 font-semibold text-white">
                            {r.lastName.toUpperCase()} {r.firstName}
                          </td>
                          <td className="py-2 px-3 text-slate-300 text-[11px]">
                            {r.className}
                          </td>
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                            {r.phone}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.isValid ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                Valide
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                Rejeté
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f293d] flex items-center justify-between">
          <button
            onClick={() => {
              if (activeStep === 'PREVIEW') setActiveStep('INPUT');
              else onClose();
            }}
            className="px-4 py-2 bg-[#182338] hover:bg-[#202d45] text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            {activeStep === 'PREVIEW' ? 'Modifier la saisie' : 'Annuler'}
          </button>

          {activeStep === 'PREVIEW' && (
            <button
              onClick={handleConfirmImport}
              disabled={isProcessing || validCount === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enrôlement en cours...</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5" />
                  <span>Enrôler <CountUp to={validCount} duration={0.6} /> Stagiaire(s)</span>
                </>
              )}
            </button>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
};
