import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Printer,
  CheckCircle,
  ShieldAlert,
  MessageSquare,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import { AbsenceAlert } from '../types';
import { sendAbsenceAlertSMS } from '../services/smsService';
import { SpotlightCard, CountUp, Magnet, ShinyText, BlurText, AnimatedContent } from '../components/react-bits';

interface AlertsViewProps {
  alerts: AbsenceAlert[];
  onRefresh?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts }) => {
  const [selectedAlertForPrint, setSelectedAlertForPrint] =
    useState<AbsenceAlert | null>(null);
  const [selectedAlertForSms, setSelectedAlertForSms] =
    useState<AbsenceAlert | null>(null);
  const [smsPhone, setSmsPhone] = useState('0555123456');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // oxlint-disable-next-line react/purity
  const todayFormatted = useMemo(() => new Date().toLocaleDateString('fr-DZ'), []);

  const getAlertBadge = (level: AbsenceAlert['alert_level']) => {
    switch (level) {
      case 'WARNING_3_DAYS':
        return {
          label: 'Avertissement 3 Séances',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'CRITICAL_10_DAYS':
        return {
          label: 'Mise en Demeure (10 Heures)',
          color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        };
      case 'EXCLUSION_THRESHOLD':
        return {
          label: 'Seuil 25% (Exclusion)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      default:
        return {
          label: 'Alerte',
          color: 'bg-slate-700 text-slate-300 border-slate-600',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <SpotlightCard
        spotlightColor="rgba(244, 63, 94, 0.16)"
        className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <BlurText
              text="Gestion des Seuils d'Assiduité Réglementaire"
              className="text-xs font-bold text-white"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Convocations administratives et mise en conformité des dossiers d'assiduité
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rose-400 font-semibold font-mono">
            <CountUp
              to={alerts.filter((a) => !a.is_resolved).length}
              duration={0.8}
            />{' '}
            dossier(s) critique(s)
          </span>
        </div>
      </SpotlightCard>

      {/* Alerts Table */}
      <AnimatedContent distance={16} duration={0.4} className="bg-[#141d2e] border border-[#1f2c42] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101726] border-b border-[#1f2c42] text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Stagiaire</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Niveau d'Alerte</th>
                <th className="py-3 px-4 text-center">Volume Non Justifié</th>
                <th className="py-3 px-4 text-center">Taux Absence</th>
                <th className="py-3 px-4 text-right">Actions Réglementaires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b263b] text-slate-200">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    Aucune alerte d'absence critique pour l'instant.
                  </td>
                </tr>
              ) : (
                alerts.map((alt) => {
                  const badge = getAlertBadge(alt.alert_level);
                  return (
                    <tr
                      key={alt.id}
                      className="hover:bg-[#182338]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {alt.student_name || 'Stagiaire en alerte'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {alt.matricule || '2024-001'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {alt.class_name || 'Promotion BTS'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-rose-400 font-bold">
                        {alt.total_unjustified_hours} h
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-300">
                        {alt.absence_percentage.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAlertForSms(alt);
                              setSmsFeedback(null);
                            }}
                            className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 border border-blue-500/20 rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3 text-blue-400" />
                            <span>SMS</span>
                          </button>
                          <button
                            onClick={() => setSelectedAlertForPrint(alt)}
                            className="px-2.5 py-1 bg-[#1e2a40] hover:bg-[#273754] text-slate-300 hover:text-white rounded-md text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-slate-400" />
                            <span>Convocation</span>
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

      {/* Official Convocation Letter Modal (Printable) */}
      {selectedAlertForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[95vh] overflow-y-auto print:p-0 print:shadow-none print:border-none">
            {/* Header Ministère */}
            <div className="text-center border-b border-slate-300 pb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                République Algérienne Démocratique et Populaire
              </div>
              <div className="text-[10px] font-medium text-slate-600 mt-0.5">
                Ministère de la Formation et de l'Enseignement Professionnels
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                Institut National Spécialisé de Formation Professionnelle (INSFP)
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Direction des Études et des Stages • Service de la Scolarité
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900 underline decoration-slate-400">
                MISE EN DEMEURE POUR ABSENCES RÉPÉTÉES
              </h2>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">
                Réf: INSFP/DE/2026/N°_{selectedAlertForPrint.matricule}
              </div>
            </div>

            {/* Trainee Details */}
            <div className="bg-slate-100 p-4 rounded-xl text-xs space-y-1 mb-6 border border-slate-200">
              <div>
                <span className="font-bold">Destinataire:</span> Aux parents / tuteur légal du stagiaire
              </div>
              <div>
                <span className="font-bold">Nom et Prénom du stagiaire:</span>{' '}
                {selectedAlertForPrint.student_name}
              </div>
              <div>
                <span className="font-bold">Matricule:</span> {selectedAlertForPrint.matricule}
              </div>
              <div>
                <span className="font-bold">Section / Spécialité:</span>{' '}
                {selectedAlertForPrint.class_name}
              </div>
            </div>

            {/* Official Legal Text */}
            <div className="text-xs text-slate-800 space-y-3 leading-relaxed">
              <p>
                Il a été constaté par la direction pédagogique que le stagiaire susnommé a accumulé un
                volume de{' '}
                <span className="font-bold text-rose-700">
                  {selectedAlertForPrint.total_unjustified_hours} heures d'absence non justifiées
                </span>
                , représentant un taux d'absence de{' '}
                <span className="font-bold text-rose-700">
                  {selectedAlertForPrint.absence_percentage.toFixed(1)}%
                </span>
                .
              </p>
              <p>
                Conformément aux dispositions du règlement intérieur des établissements de formation
                professionnelle, vous êtes prié de vous présenter d'urgence auprès de l'administration
                muni des pièces justificatives sous un délai impératif de 48 heures ouvrables.
              </p>
              <p className="font-medium text-slate-900">
                Passé ce délai, le dossier sera transmis à la commission de discipline pour
                prononciation de l'exclusion définitive.
              </p>
            </div>

            {/* Signatures */}
            <div className="mt-10 pt-4 flex justify-between text-xs text-slate-800">
              <div>
                <div>Fait le: {todayFormatted}</div>
                <div className="mt-1 font-semibold">Le Chef de Service Scolarité</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">Le Directeur des Études</div>
                <div className="mt-12 text-[10px] text-slate-400 italic">Cachet & Signature</div>
              </div>
            </div>

            {/* Action Bar (Hidden on print) */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between print:hidden">
              <button
                onClick={() => setSelectedAlertForPrint(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Convocation Officielle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Dispatch Modal */}
      {selectedAlertForSms && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <SpotlightCard
            spotlightColor="rgba(59, 130, 246, 0.16)"
            className="bg-[#141d2e] border border-[#223049] text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#223049]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <ShinyText
                    text="Envoi SMS d'Alerte Direct"
                    speed={5}
                    className="font-semibold text-sm text-slate-100"
                  />
                  <p className="text-[11px] text-slate-400">
                    Passerelle Twilio • {selectedAlertForSms.student_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertForSms(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {smsFeedback && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    smsFeedback.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {smsFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{smsFeedback.text}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Numéro de téléphone mobile (Parent ou Stagiaire)
                </label>
                <input
                  type="text"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="0555123456 ou +213..."
                  className="w-full bg-[#182235] border border-[#223049] rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Format local algérien (05/06/07) automatiquement converti en +213.
                </span>
              </div>

              <div className="bg-[#101726] p-3 rounded-xl border border-[#1b263b] space-y-1">
                <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider block">
                  Aperçu du SMS transmis
                </span>
                <p className="text-slate-300 italic text-[11px] leading-relaxed">
                  "INSFP Ouled Fayet: Avis d'absence pour le stagiaire {selectedAlertForSms.student_name}. {selectedAlertForSms.total_unjustified_hours}h non justifiées ({selectedAlertForSms.absence_percentage.toFixed(1)}%). Veuillez contacter le service scolarité."
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#223049] flex gap-3">
              <button
                onClick={() => setSelectedAlertForSms(null)}
                className="flex-1 py-2 bg-[#182235] hover:bg-[#202d45] border border-[#223049] rounded-xl text-slate-300 text-xs font-medium transition-colors"
              >
                Annuler
              </button>
              <Magnet padding={10} magnetStrength={0.2} className="flex-1">
                <button
                  disabled={isSendingSms || !smsPhone}
                  onClick={async () => {
                    setIsSendingSms(true);
                    setSmsFeedback(null);
                    const res = await sendAbsenceAlertSMS(
                      smsPhone,
                      selectedAlertForSms.student_name || 'Stagiaire',
                      selectedAlertForSms.alert_level
                    );
                    setIsSendingSms(false);
                    if (res.success) {
                      setSmsFeedback({
                        type: 'success',
                        text: `SMS transmis avec succès via Twilio (SID: ${res.sid?.slice(0, 10)}...)`,
                      });
                    } else {
                      setSmsFeedback({
                        type: 'error',
                        text: res.error || "Échec de l'envoi du SMS.",
                      });
                    }
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
                >
                  {isSendingSms ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer SMS</span>
                    </>
                  )}
                </button>
              </Magnet>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
};
