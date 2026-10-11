import React from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertTriangle,
  Radio,
  Clock,
  ArrowUpRight,
  School,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, Session } from '../types';
import { SpotlightCard, CountUp, Magnet, BlurText, AnimatedContent } from '../components/react-bits';
import { useGsapStagger } from '../hooks/useGsapStagger';

interface DashboardViewProps {
  stats: DashboardStats;
  activeSessions: Session[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  activeSessions,
  onNavigateTab,
}) => {
  const containerRef = useGsapStagger<HTMLDivElement>(
    {
      selector: '.gsap-card',
      y: 18,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.05,
    },
    [stats]
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Metric Cards with Spotlight, CountUp, and AnimatedContent */}
      <AnimatedContent distance={16} duration={0.5} stagger={0.06} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trainees */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.16)"
          className="gsap-card p-4.5 flex items-center justify-between border-[#1f2c42] bg-[#141d2e]"
        >
          <div>
            <div className="text-[11px] font-medium text-slate-400">Effectif Stagiaires</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              <CountUp to={stats.totalStudents} duration={1.1} />
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>96.4% inscrits réguliers</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </SpotlightCard>

        {/* Present Today */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.18)"
          className="gsap-card p-4.5 flex items-center justify-between border-[#1f2c42] bg-[#141d2e]"
        >
          <div>
            <div className="text-[11px] font-medium text-slate-400">Présents Aujourd'hui</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
              <CountUp to={stats.presentToday} duration={1.1} />
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1 font-mono">
              Taux global: <CountUp to={stats.overallAttendanceRate} decimals={1} suffix="%" duration={1.1} />
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </SpotlightCard>

        {/* Absences */}
        <SpotlightCard
          spotlightColor="rgba(244, 63, 94, 0.16)"
          className="gsap-card p-4.5 flex items-center justify-between border-[#1f2c42] bg-[#141d2e]"
        >
          <div>
            <div className="text-[11px] font-medium text-slate-400">Absences Constatées</div>
            <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
              <CountUp to={stats.absencesToday} duration={1.1} />
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1 font-mono">
              Dont <CountUp to={Math.round(stats.absencesToday * 0.4)} duration={1.1} /> non justifiées
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
        </SpotlightCard>

        {/* Justifications Pending */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.16)"
          className="gsap-card p-4.5 flex items-center justify-between border-[#1f2c42] bg-[#141d2e]"
        >
          <div>
            <div className="text-[11px] font-medium text-slate-400">Justificatifs en Attente</div>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
              <CountUp to={stats.pendingJustifications} duration={1.1} />
            </div>
            <div className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Contrôle documentaire prêt</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </SpotlightCard>
      </AnimatedContent>

      {/* Main Grid: Active Sessions & Alert Digest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions Panel (2 Cols) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.08)"
          className="gsap-card lg:col-span-2 bg-[#141d2e] border border-[#1f2c42] rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <BlurText text="Séances Pédagogiques en Cours" className="text-sm font-bold text-white" />
            </div>
            <Magnet padding={15} magnetStrength={0.2}>
              <button
                onClick={() => onNavigateTab('sessions')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-emerald-500/10 transition-colors"
              >
                <span>Toutes les séances</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Magnet>
          </div>

          {activeSessions.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              Aucune séance active sur ce créneau horaire.
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-[#182338] border border-[#22314a] rounded-lg p-3.5 flex items-center justify-between hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{session.class_name || 'Section BTS'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202d45] text-slate-300 font-mono">
                          {session.session_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {session.module_name || 'Module Informatique'} • Salle {session.room || 'Lab 02'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Formateur: {session.instructor_name || 'Enseignant principal'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-emerald-300 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                      </span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      Émargement Ouvert
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>

        {/* Regulatory Alert Summary Panel (1 Col) */}
        <SpotlightCard
          spotlightColor="rgba(244, 63, 94, 0.1)"
          className="gsap-card bg-[#141d2e] border border-[#1f2c42] rounded-xl p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <BlurText text="Surveillance Réglementaire" className="text-sm font-bold text-white" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                <CountUp to={stats.criticalAlertsCount} suffix=" Cas" duration={0.8} />
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Application stricte du règlement intérieur de l'INSFP:
            </p>

            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-lg bg-[#182338] border border-[#23314a]">
                <div className="text-xs font-semibold text-rose-300">
                  Palier 3 absences sans motif
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  1er avertissement écrit transmis aux représentants légaux.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#182338] border border-[#23314a]">
                <div className="text-xs font-semibold text-amber-300">
                  Palier 10 heures d'absence
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Mise en demeure préalable avant commission de discipline.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#182338] border border-[#23314a]">
                <div className="text-xs font-semibold text-rose-400">
                  Palier 25% du volume horaire
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Exclusion automatique de la session d'évaluation finale.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Magnet padding={20} magnetStrength={0.15} className="w-full">
              <button
                onClick={() => onNavigateTab('alerts')}
                className="w-full py-2 px-3 bg-[#1c273d] hover:bg-[#223049] border border-[#283752] rounded-lg text-xs font-semibold text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Traiter les convocations</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </Magnet>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};
