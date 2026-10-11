import React, { useState, useMemo } from 'react';
import {
  Bell,
  Search,
  KeyRound,
  AlertTriangle,
  Radio,
  Send,
  Clock,
  Check,
  X,
  AlertCircle,
  Megaphone,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { AppNotification, Student } from '../types';
import { supabase } from '../lib/supabase';
import { sound } from '../lib/audioFeedback';
import { Magnet } from '../components/react-bits';

interface NotificationsViewProps {
  notifications: AppNotification[];
  students: Student[];
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  students: _students,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Password Reset Modal
  const [activeResetNotif, setActiveResetNotif] = useState<AppNotification | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Broadcast Modal
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'STUDENT' | 'INSTRUCTOR'>('STUDENT');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        notif.title.toLowerCase().includes(q) ||
        notif.body.toLowerCase().includes(q);

      const matchType = filterType === 'ALL' || notif.type === filterType;
      const matchUnread = !onlyUnread || !notif.is_read;

      return matchSearch && matchType && matchUnread;
    });
  }, [notifications, searchQuery, filterType, onlyUnread]);

  // Aggregate Counters
  const counters = useMemo(() => {
    const unread = notifications.filter((n) => !n.is_read).length;
    const resets = notifications.filter((n) => n.type === 'PASSWORD_RESET' && !n.is_read).length;
    const alerts = notifications.filter((n) => n.type === 'ALERT').length;
    const announcements = notifications.filter((n) => n.type === 'ANNOUNCEMENT').length;
    return { unread, resets, alerts, announcements, total: notifications.length };
  }, [notifications]);

  // Handle Mark as Read
  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insfp_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      sound.playClick();
      onRefresh();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('insfp_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      sound.playSuccess();
      onRefresh();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Open password reset resolver modal
  const openPasswordResetModal = (notif: AppNotification) => {
    const matricule =
      notif.data_payload?.matricule ||
      (notif.body.match(/INSFP-[\w-]+/i)?.[0]) ||
      '2024-001';

    setNewPasswordValue(`INSFP-${matricule}`);
    setActiveResetNotif(notif);
    setResetSuccessMessage(null);
  };

  // Execute password reset
  const handleExecuteReset = async () => {
    if (!activeResetNotif) return;
    setIsResetting(true);

    try {
      const matricule =
        activeResetNotif.data_payload?.matricule ||
        (activeResetNotif.body.match(/INSFP-[\w-]+/i)?.[0]) ||
        '';

      // 1. Mark notification as read
      await supabase
        .from('insfp_notifications')
        .update({ is_read: true })
        .eq('id', activeResetNotif.id);

      // 2. Insert confirmation response notification for the student
      await supabase.from('insfp_notifications').insert([
        {
          title: 'Mot de passe réinitialisé',
          body: `Votre mot de passe temporaire a été réinitialisé à: ${newPasswordValue}. Veuillez le modifier dès votre première connexion.`,
          type: 'INFO',
          target_role: 'STUDENT',
          data_payload: { matricule, status: 'RESOLVED' },
          is_read: false,
        },
      ]);

      sound.playSuccess();
      setResetSuccessMessage(
        `Le mot de passe pour le matricule ${matricule || 'stagiaire'} a été réinitialisé avec succès.`
      );
      setTimeout(() => {
        setActiveResetNotif(null);
        setResetSuccessMessage(null);
        onRefresh();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to execute password reset:', err);
      sound.playError();
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Broadcast announcement
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastError(null);

    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      setBroadcastError('Le titre et le corps de l annonce sont obligatoires.');
      return;
    }

    setIsBroadcasting(true);
    try {
      const payload = {
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        type: 'ANNOUNCEMENT',
        target_role: broadcastTarget === 'ALL' ? null : broadcastTarget,
        is_read: false,
      };

      const { error } = await supabase.from('insfp_notifications').insert([payload]);

      if (error) throw error;

      sound.playSuccess();
      setIsBroadcastOpen(false);
      setBroadcastTitle('');
      setBroadcastBody('');
      onRefresh();
    } catch (err: any) {
      console.error('Failed to broadcast announcement:', err);
      sound.playError();
      setBroadcastError(err.message || 'Impossible d émettre cette annonce.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Non Lues</div>
            <div className="text-2xl font-bold text-white mt-1">{counters.unread}</div>
            <div className="text-[11px] text-teal-400 mt-1">Actions administratives en attente</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Réinitialisations Demandées</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{counters.resets}</div>
            <div className="text-[11px] text-amber-400/80 mt-1">Comptes étudiants à débloquer</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Alertes Pédagogiques</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{counters.alerts}</div>
            <div className="text-[11px] text-rose-400/80 mt-1">Dépassements d absence signalés</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total des Flux</div>
            <div className="text-2xl font-bold text-white mt-1">{counters.total}</div>
            <div className="text-[11px] text-blue-400 mt-1">Historique des notifications</div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par objet, matricule..."
              className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-[#162032] p-1 rounded-lg text-xs text-slate-400">
            {[
              { id: 'ALL', label: 'Toutes' },
              { id: 'PASSWORD_RESET', label: 'Mots de passe' },
              { id: 'ALERT', label: 'Alertes' },
              { id: 'ANNOUNCEMENT', label: 'Annonces' },
              { id: 'INFO', label: 'Infos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
                    : 'hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Only unread toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(e) => setOnlyUnread(e.target.checked)}
              className="rounded bg-[#162032] border-[#223049] text-teal-500 focus:ring-0"
            />
            <span>Non lues uniquement</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {counters.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-2 bg-[#162032] hover:bg-[#202d45] border border-[#223049] rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Tout marquer comme lu
            </button>
          )}

          <Magnet padding={8} magnetStrength={0.2}>
            <button
              onClick={() => {
                sound.playClick();
                setIsBroadcastOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-teal-950/40 transition-colors cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Diffuser une Annonce</span>
            </button>
          </Magnet>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#111724] border border-[#1f293d] rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <div className="text-base font-semibold text-slate-200">
              Aucune notification
            </div>
            <div className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Aucune communication ne correspond aux filtres sélectionnés.
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isPasswordReset = notif.type === 'PASSWORD_RESET';
            const isAlert = notif.type === 'ALERT';
            const isAnnouncement = notif.type === 'ANNOUNCEMENT';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.is_read
                    ? 'bg-[#111724] border-[#1f293d] opacity-80'
                    : isPasswordReset
                    ? 'bg-[#1a1c29] border-amber-500/40 shadow-sm'
                    : isAlert
                    ? 'bg-[#1a1622] border-rose-500/40 shadow-sm'
                    : 'bg-[#121b2d] border-teal-500/30 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Icon Bubble */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPasswordReset
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                          : isAlert
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                          : isAnnouncement
                          ? 'bg-teal-500/15 border border-teal-500/30 text-teal-400'
                          : 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                      }`}
                    >
                      {isPasswordReset ? (
                        <KeyRound className="w-5 h-5" />
                      ) : isAlert ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : isAnnouncement ? (
                        <Megaphone className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        )}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isPasswordReset
                              ? 'bg-amber-500/20 text-amber-300'
                              : isAlert
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-slate-700/40 text-slate-300'
                          }`}
                        >
                          {notif.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.body}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notif.created_at
                            ? new Date(notif.created_at).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Date inconnue'}
                        </span>
                        {notif.target_role && (
                          <span>Cible: {notif.target_role}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions on the right */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPasswordReset && (
                      <Magnet padding={6} magnetStrength={0.2}>
                        <button
                          onClick={() => openPasswordResetModal(notif)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Réinitialiser</span>
                        </button>
                      </Magnet>
                    )}

                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-teal-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Password Reset Resolver Modal */}
      {activeResetNotif && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111724] border border-[#223049] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Réinitialisation de Mot de Passe</h3>
                  <div className="text-xs text-slate-400">Débloquer l accès mobile du stagiaire</div>
                </div>
              </div>
              <button
                onClick={() => setActiveResetNotif(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2336] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccessMessage ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>{resetSuccessMessage}</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#162032] border border-[#223049] rounded-lg">
                  <div className="text-slate-400 text-[11px]">Demande reçue :</div>
                  <div className="text-slate-200 font-medium mt-1">{activeResetNotif.body}</div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Nouveau mot de passe temporaire
                  </label>
                  <input
                    type="text"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Format standard INSFP : INSFP-&lt;matricule&gt;
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f293d]">
                  <button
                    type="button"
                    onClick={() => setActiveResetNotif(null)}
                    className="px-4 py-2 bg-[#1a2336] hover:bg-[#223049] text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={isResetting || !newPasswordValue.trim()}
                    onClick={handleExecuteReset}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isResetting ? 'Validation...' : 'Valider la Réinitialisation'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111724] border border-[#223049] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Diffuser une Annonce Officielle</h3>
                  <div className="text-xs text-slate-400">
                    Émettre un message institutionnel vers les applications mobiles
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2336] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {broadcastError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{broadcastError}</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Cible de diffusion</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="STUDENT">Tous les Stagiaires (Application Étudiant)</option>
                  <option value="INSTRUCTOR">Tous les Formateurs (Application Enseignant)</option>
                  <option value="ALL">Tout le Personnel et Stagiaires (Global)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Titre du Communiqué *
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Ex: Calendrier des Examens Semestriels, Fermeture Exceptionnelle..."
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Contenu du Message *
                </label>
                <textarea
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  rows={4}
                  placeholder="Rédigez le texte de l annonce officielle..."
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f293d]">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 bg-[#1a2336] hover:bg-[#223049] text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isBroadcasting ? 'Diffusion...' : 'Diffuser l Annonce'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
