import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  Eye,
  Loader2,
  FileImage,
} from 'lucide-react';
import { Justification } from '../types';
import { auditMedicalDocument, MedicalAuditResult } from '../services/aiService';
import { supabase } from '../lib/supabase';
import { SpotlightCard, CountUp, Magnet, ShinyText, BlurText, AnimatedContent } from '../components/react-bits';

interface JustificationsViewProps {
  justifications: Justification[];
  onRefresh: () => void;
}

export const JustificationsView: React.FC<JustificationsViewProps> = ({
  justifications,
  onRefresh,
}) => {
  const [selectedJustif, setSelectedJustif] = useState<Justification | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<MedicalAuditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decisionOverrides, setDecisionOverrides] = useState<
    Record<
      string,
      {
        status: 'APPROVED' | 'REJECTED';
        reviewed_at: string;
        score?: number;
        summary?: string;
      }
    >
  >({});

  const effectiveJustifications = justifications.map((j) => {
    const override = decisionOverrides[j.id];
    if (!override) return j;
    return {
      ...j,
      status: override.status,
      reviewed_at: override.reviewed_at,
      ai_audit_score: override.score ?? j.ai_audit_score,
      ai_audit_summary: override.summary ?? j.ai_audit_summary,
    };
  });

  const handleOpenAuditModal = (justif: Justification) => {
    setSelectedJustif(justif);
    setAuditResult(null);
  };

  const handleRunAiAudit = async () => {
    if (!selectedJustif) return;
    setIsAuditing(true);
    try {
      // Mock base64 image or sample document url
      const sampleDoc =
        selectedJustif.document_url ||
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800';

      const result = await auditMedicalDocument(
        sampleDoc,
        selectedJustif.reason,
        3
      );
      setAuditResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedJustif) return;
    const justifId = selectedJustif.id;
    const score = auditResult?.validityScore;
    const summary = auditResult?.summary;
    setIsProcessing(true);
    setSelectedJustif(null);

    // Optimistic immutable state update
    setDecisionOverrides((prev) => ({
      ...prev,
      [justifId]: {
        status: decision,
        reviewed_at: new Date().toISOString(),
        score,
        summary,
      },
    }));

    try {
      const { error } = await supabase
        .from('insfp_justifications')
        .update({
          status: decision,
          reviewed_at: new Date().toISOString(),
          ai_audit_score: score || null,
          ai_audit_summary: summary || null,
        })
        .eq('id', justifId);

      if (!error) {
        onRefresh();
      }
    } catch (err) {
      console.warn('Network exception during justification update, held in local state:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <SpotlightCard
        spotlightColor="rgba(245, 158, 11, 0.16)"
        className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <BlurText
              text="Vérification Intelligente des Certificats Médicaux"
              className="text-xs font-bold text-white"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Propulsé par le modèle NVIDIA Llama 3.2 90B Vision Instruct
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            <CountUp
              to={effectiveJustifications.filter((j) => j.status === 'PENDING').length}
              duration={0.8}
            />{' '}
            en attente
          </span>
        </div>
      </SpotlightCard>

      {/* Justifications Table */}
      <AnimatedContent distance={16} duration={0.4} className="bg-[#141d2e] border border-[#1f2c42] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101726] border-b border-[#1f2c42] text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Stagiaire</th>
                <th className="py-3 px-4">Date Absence</th>
                <th className="py-3 px-4">Motif Déclaré</th>
                <th className="py-3 px-4 text-center">Score IA</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b263b] text-slate-200">
              {effectiveJustifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Aucun justificatif déposé pour le moment.
                  </td>
                </tr>
              ) : (
                effectiveJustifications.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-[#182338]/60 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {j.student_name || 'Stagiaire INSFP'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {j.matricule || '2024-001'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {j.absence_date}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {j.reason}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {j.ai_audit_score !== null && j.ai_audit_score !== undefined ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            j.ai_audit_score >= 80
                              ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                              : j.ai_audit_score >= 50
                              ? 'text-amber-400 bg-amber-950/40 border-amber-800/40'
                              : 'text-rose-400 bg-rose-950/40 border-rose-800/40'
                          }`}
                        >
                          {j.ai_audit_score}%
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Non audité</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                          j.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : j.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {j.status === 'APPROVED'
                          ? 'Validé'
                          : j.status === 'REJECTED'
                          ? 'Rejeté'
                          : 'En examen'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenAuditModal(j)}
                        className="px-2.5 py-1 bg-[#1e2a40] hover:bg-[#273754] text-slate-300 hover:text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Inspecter & IA</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AnimatedContent>

      {/* Audit & Inspection Modal */}
      {selectedJustif && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.14)"
            className="bg-[#121927] border border-[#223049] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedJustif(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1c273d] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#1f2c42]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FileImage className="w-5 h-5" />
              </div>
              <div>
                <ShinyText
                  text="Contrôle du Justificatif Médical"
                  speed={5}
                  className="text-sm font-bold text-white"
                />
                <div className="text-xs text-slate-400 mt-0.5">
                  Stagiaire: {selectedJustif.student_name} • Date: {selectedJustif.absence_date}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="py-3 border-b border-[#1f2c42]">
              <span className="text-[11px] text-slate-400 block font-medium">
                Motif invoqué par le stagiaire:
              </span>
              <p className="text-xs text-slate-200 mt-1 italic">
                "{selectedJustif.reason}"
              </p>
            </div>

            {/* Action to run AI Audit */}
            <div className="py-4 border-b border-[#1f2c42]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lancer l'audit optique NVIDIA NIM Vision</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Reconnaissance de texte OCR, détection du cachet et de la signature
                  </div>
                </div>

                {!auditResult && (
                  <Magnet padding={12} magnetStrength={0.2}>
                    <button
                      onClick={handleRunAiAudit}
                      disabled={isAuditing}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isAuditing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyse en cours...</span>
                        </>
                      ) : (
                        <span>Auditer le document</span>
                      )}
                    </button>
                  </Magnet>
                )}
              </div>

              {/* Audit Results Display */}
              {auditResult && (
                <div className="mt-4 p-4 rounded-xl bg-[#162133] border border-[#24334f] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      Score de conformité documentaire:
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        auditResult.validityScore >= 75
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {auditResult.validityScore}% - Recommandation: {auditResult.recommendation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#202e47]">
                    <div className="text-slate-400">
                      Établissement:{' '}
                      <span className="text-slate-200 font-medium">
                        {auditResult.clinicName}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Médecin:{' '}
                      <span className="text-slate-200 font-medium">
                        {auditResult.doctorName}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Cachet officiel:{' '}
                      <span
                        className={
                          auditResult.hasOfficialStamp
                            ? 'text-emerald-400 font-semibold'
                            : 'text-rose-400 font-semibold'
                        }
                      >
                        {auditResult.hasOfficialStamp ? 'Détecté (Conforme)' : 'Non détecté'}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Signature manuscrite:{' '}
                      <span
                        className={
                          auditResult.hasDoctorSignature
                            ? 'text-emerald-400 font-semibold'
                            : 'text-rose-400 font-semibold'
                        }
                      >
                        {auditResult.hasDoctorSignature ? 'Validée' : 'Absente'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#121927] p-2.5 rounded-lg border border-[#1e2a40] leading-relaxed">
                    {auditResult.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Decision Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setSelectedJustif(null)}
                className="px-3.5 py-1.5 bg-[#1a2436] hover:bg-[#222f46] text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <div className="flex items-center gap-2">
                <Magnet padding={10} magnetStrength={0.2}>
                  <button
                    onClick={() => handleDecision('REJECTED')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rejeter le justificatif</span>
                  </button>
                </Magnet>

                <Magnet padding={10} magnetStrength={0.2}>
                  <button
                    onClick={() => handleDecision('APPROVED')}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Valider & Justifier l'absence</span>
                  </button>
                </Magnet>
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
};
