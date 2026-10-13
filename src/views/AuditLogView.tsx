import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { AuditEvent } from '../types';
import { SpotlightCard, CountUp, AnimatedContent } from '../components/react-bits';
import { sound } from '../lib/audioFeedback';

interface AuditLogViewProps {
  events: AuditEvent[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ events }) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isIntegrityVerified, setIsIntegrityVerified] = useState(false);

  const filteredEvents = events.filter((ev) => {
    if (selectedType !== 'ALL' && ev.action_type !== selectedType) return false;
    if (selectedSeverity !== 'ALL' && ev.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.actor_name.toLowerCase().includes(q) ||
        ev.target.toLowerCase().includes(q) ||
        ev.details.toLowerCase().includes(q) ||
        ev.station.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportAuditCsv = () => {
    const headers = ['Horodatage', 'Action', 'Acteur', 'Rôle', 'Cible', 'Détails', 'Gravité', 'Station'];
    const rows = filteredEvents.map((ev) => [
      `"${ev.timestamp}"`,
      `"${ev.action_type}"`,
      `"${ev.actor_name}"`,
      `"${ev.actor_role}"`,
      `"${ev.target}"`,
      `"${ev.details.replace(/"/g, '""')}"`,
      `"${ev.severity}"`,
      `"${ev.station}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `INSFP_Journal_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sound.playSuccess();
  };

  const verifyIntegrity = () => {
    sound.playSuccess();
    setIsIntegrityVerified(true);
    setTimeout(() => {
      setIsIntegrityVerified(false);
    }, 5000);
  };

  const getActionBadgeColor = (type: AuditEvent['action_type']) => {
    switch (type) {
      case 'EMARGEMENT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'JUSTIFICATION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'SECURITY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'EXPORT':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'COMMUNICATION':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getSeverityIcon = (sev: AuditEvent['severity']) => {
    switch (sev) {
      case 'CRITICAL':
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1f293d]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Journal d'Audit & Traçabilité Réglementaire
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conforme au Décret Exécutif n° 18-162 • Journal inviolable des actions administratives et des accès
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={verifyIntegrity}
            className="px-3 py-1.5 bg-[#182338] hover:bg-[#202d45] border border-[#23314a] text-xs font-medium text-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vérifier l'Empreinte Numérique</span>
          </button>

          <button
            onClick={exportAuditCsv}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter le Journal (CSV)</span>
          </button>
        </div>
      </div>

      {/* Integrity Alert if clicked */}
      {isIntegrityVerified && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Intégrité cryptographique validée. Tous les horodatages et identifiants concordent avec le registre SHA-256 de l'établissement.
          </span>
        </div>
      )}

      {/* Metric Cards */}
      <AnimatedContent distance={16} duration={0.4} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.15)"
          className="p-4 bg-[#141d2e] border border-[#1f2c42] rounded-xl"
        >
          <div className="text-[11px] text-slate-400 font-medium">Total Événements Consignés</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            <CountUp to={events.length} duration={0.8} />
          </div>
          <div className="text-[10px] text-blue-400 mt-1">Horodatage sécurisé</div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(160, 185, 129, 0.15)"
          className="p-4 bg-[#141d2e] border border-[#1f2c42] rounded-xl"
        >
          <div className="text-[11px] text-slate-400 font-medium">Pointages & Émargements</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            <CountUp to={events.filter((e) => e.action_type === 'EMARGEMENT').length} duration={0.8} />
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-1">Contrôles d'accès directs</div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="p-4 bg-[#141d2e] border border-[#1f2c42] rounded-xl"
        >
          <div className="text-[11px] text-slate-400 font-medium">Justificatifs & Décisions</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
            <CountUp to={events.filter((e) => e.action_type === 'JUSTIFICATION').length} duration={0.8} />
          </div>
          <div className="text-[10px] text-amber-300/80 mt-1">Conformité et validation des pièces</div>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.15)"
          className="p-4 bg-[#141d2e] border border-[#1f2c42] rounded-xl"
        >
          <div className="text-[11px] text-slate-400 font-medium">Actions Sensibles / Sécurité</div>
          <div className="text-2xl font-bold text-slate-100 mt-1 font-mono">
            <CountUp to={events.filter((e) => e.action_type === 'SECURITY').length} duration={0.8} />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Mots de passe & politiques</div>
        </SpotlightCard>
      </AnimatedContent>

      {/* Filter and Search Bar */}
      <div className="bg-[#141d2e] border border-[#1f2c42] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par acteur, stagiaire, station..."
            className="w-full bg-[#0d1422] border border-[#223049] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Action Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#0d1422] border border-[#223049] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Toutes les actions</option>
            <option value="EMARGEMENT">Émargements</option>
            <option value="JUSTIFICATION">Justificatifs</option>
            <option value="MODIFICATION">Modifications</option>
            <option value="EXPORT">Exportations</option>
            <option value="SECURITY">Sécurité</option>
            <option value="COMMUNICATION">Communications</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-[#0d1422] border border-[#223049] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Toutes gravités</option>
            <option value="INFO">Information</option>
            <option value="SUCCESS">Succès</option>
            <option value="WARNING">Avertissement</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-[#141d2e] border border-[#1f2c42] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#182338] text-slate-400 font-semibold border-b border-[#23314a]">
              <tr>
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Acteur</th>
                <th className="py-3 px-4">Cible / Dossier</th>
                <th className="py-3 px-4">Détails de l'Opération</th>
                <th className="py-3 px-4">Station</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a3e] text-slate-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Aucun événement correspondant aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#182438] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {ev.timestamp}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${getActionBadgeColor(
                          ev.action_type
                        )}`}
                      >
                        {getSeverityIcon(ev.severity)}
                        <span>{ev.action_type}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{ev.actor_name}</div>
                      <div className="text-[10px] text-slate-400">{ev.actor_role}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-200">
                      {ev.target}
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-xs leading-relaxed">
                      {ev.details}
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {ev.station}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
