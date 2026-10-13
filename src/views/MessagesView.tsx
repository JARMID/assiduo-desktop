import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Conversation, Message, Student, InsfpUser } from '../types';
import { supabase } from '../lib/supabase';
import { sound } from '../lib/audioFeedback';
import { Magnet } from '../components/react-bits';

interface MessagesViewProps {
  conversations: Conversation[];
  students: Student[];
  currentUser: InsfpUser | null;
  onRefreshConversations: () => void;
  initialSelectedStudentId?: string | null;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  students,
  currentUser,
  onRefreshConversations,
  initialSelectedStudentId,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Conversation Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMessage, setNewInitialMessage] = useState('');
  const [isCreatingConv, setIsCreatingConv] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation or handle initialSelectedStudentId
  useEffect(() => {
    if (initialSelectedStudentId) {
      const existing = conversations.find((c) => c.student_id === initialSelectedStudentId);
      if (existing) {
        // oxlint-disable-next-line react/set-state-in-effect
        setSelectedConvId(existing.id);
      } else {
        // oxlint-disable-next-line react/set-state-in-effect
        setSelectedStudentId(initialSelectedStudentId);
        // oxlint-disable-next-line react/set-state-in-effect
        setIsNewModalOpen(true);
      }
    } else if (!selectedConvId && conversations.length > 0) {
      // oxlint-disable-next-line react/set-state-in-effect
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, initialSelectedStudentId, selectedConvId]);

  // Load messages whenever selected conversation changes
  useEffect(() => {
    if (!selectedConvId) {
      // oxlint-disable-next-line react/set-state-in-effect
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from('insfp_messages')
          .select('*')
          .eq('conversation_id', selectedConvId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages((data as Message[]) || []);
      } catch (err) {
        console.warn('Failed to load conversation messages:', err);
        // Fallback demo message
        setMessages([
          {
            id: 'demo-msg-1',
            conversation_id: selectedConvId,
            sender_id: 'student',
            sender_role: 'STUDENT',
            sender_name: 'Stagiaire INSFP',
            body: 'Bonjour Monsieur le Directeur, je souhaiterais savoir si mon justificatif d absence du 02 mai a bien été réceptionné par le service de scolarité.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages for this specific conversation
    const channel = supabase
      .channel(`conv-${selectedConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'insfp_messages',
          filter: `conversation_id=eq.${selectedConvId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          sound.playNotification();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || null;
  }, [conversations, selectedConvId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        conv.subject.toLowerCase().includes(q) ||
        (conv.student_name && conv.student_name.toLowerCase().includes(q)) ||
        (conv.matricule && conv.matricule.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || conv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [conversations, searchQuery, statusFilter]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMessageText).trim();
    if (!text || !selectedConvId) return;

    setIsSending(true);
    setNewMessageText('');

    try {
      const adminName = currentUser
        ? `${currentUser.first_name} ${currentUser.last_name}`
        : 'Direction Pédagogique';

      const payload = {
        conversation_id: selectedConvId,
        sender_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        sender_role: 'ADMINISTRATION',
        sender_name: adminName,
        body: text,
      };

      const { data, error } = await supabase
        .from('insfp_messages')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => [...prev, data as Message]);
      }

      // Update conversation timestamp
      // oxlint-disable-next-line react/purity
      const nowIso = new Date().toISOString();
      await supabase
        .from('insfp_conversations')
        .update({ updated_at: nowIso })
        .eq('id', selectedConvId);

      sound.playSuccess();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      sound.playError();
      // Optimistic local fallback for demonstration
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          conversation_id: selectedConvId,
          sender_id: currentUser?.id || 'admin',
          sender_role: 'ADMINISTRATION',
          sender_name: currentUser
            ? `${currentUser.first_name} ${currentUser.last_name}`
            : 'Direction Pédagogique',
          body: text,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: 'OPEN' | 'RESOLVED' | 'CLOSED') => {
    if (!selectedConvId) return;
    try {
      await supabase
        .from('insfp_conversations')
        .update({ status: newStatus })
        .eq('id', selectedConvId);

      sound.playClick();
      onRefreshConversations();
    } catch (err) {
      console.error('Failed to update conversation status:', err);
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
  if (!selectedStudentId) {
      setModalError('Veuillez sélectionner un stagiaire destinataire.');
      return;
    }
    if (!newSubject.trim()) {
      setModalError('Veuillez indiquer un sujet.');
      return;
    }

    setIsCreatingConv(true);
    try {
      const convPayload = {
        student_id: selectedStudentId,
        subject: newSubject.trim(),
        status: 'OPEN',
      };

      const { data: convData, error: convError } = await supabase
        .from('insfp_conversations')
        .insert([convPayload])
        .select()
        .single();

      if (convError) throw convError;

      if (convData && newInitialMessage.trim()) {
        const adminName = currentUser
          ? `${currentUser.first_name} ${currentUser.last_name}`
          : 'Direction Pédagogique';

        await supabase.from('insfp_messages').insert([
          {
            conversation_id: convData.id,
            sender_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
            sender_role: 'ADMINISTRATION',
            sender_name: adminName,
            body: newInitialMessage.trim(),
          },
        ]);
      }

      sound.playSuccess();
      setIsNewModalOpen(false);
      setNewSubject('');
      setNewInitialMessage('');
      onRefreshConversations();
      if (convData) {
        setSelectedConvId(convData.id);
      }
    } catch (err: any) {
      console.error('Failed to create conversation:', err);
      sound.playError();
      setModalError(err.message || 'Impossible de démarrer la discussion.');
    } finally {
      setIsCreatingConv(false);
    }
  };

  const quickReplies = [
    'Justificatif bien reçu et validé par l administration.',
    'Veuillez vous présenter au bureau de scolarité muni de votre carte.',
    'Votre demande de rattrapage a été transmise à votre formateur.',
    'Rappel : Le seuil réglementaire d absences non justifiées est atteint.',
  ];

  return (
    <div className="h-[calc(100vh-130px)] flex bg-[#111724] border border-[#1f293d] rounded-2xl overflow-hidden select-none">
      {/* Left Column: Conversation Directory */}
      <div className="w-80 md:w-96 border-r border-[#1f293d] flex flex-col bg-[#0e1420]">
        {/* Header and New Conversation Action */}
        <div className="p-4 border-b border-[#1f293d] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">Discussions Pédagogiques</span>
            </div>
            <Magnet padding={6} magnetStrength={0.2}>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsNewModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                title="Démarrer une nouvelle discussion"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau</span>
              </button>
            </Magnet>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher stagiaire, sujet..."
              className="w-full bg-[#162032] border border-[#223049] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#141c2c] p-1 rounded-lg text-[11px] text-slate-400">
            {(
              [
                { id: 'ALL', label: 'Toutes' },
                { id: 'OPEN', label: 'Ouvertes' },
                { id: 'RESOLVED', label: 'Résolues' },
                { id: 'CLOSED', label: 'Fermées' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 py-1 rounded font-medium text-center transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1a2436]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucune discussion ne correspond à vos filtres.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const student = students.find((s) => s.id === conv.student_id);
              const displayName =
                conv.student_name ||
                (student ? `${student.first_name} ${student.last_name}` : 'Stagiaire INSFP');

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedConvId(conv.id);
                  }}
                  className={`p-3.5 transition-colors cursor-pointer rounded-lg mx-2 ${
                    isSelected
                      ? 'bg-[#182338] text-white shadow-sm ring-1 ring-blue-500/25'
                      : 'hover:bg-[#131b2a]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-white truncate">
                      {displayName}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        conv.status === 'OPEN'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : conv.status === 'RESOLVED'
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      {conv.status === 'OPEN'
                        ? 'Ouvert'
                        : conv.status === 'RESOLVED'
                        ? 'Résolu'
                        : 'Fermé'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium truncate mt-1">
                    {conv.subject}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span className="font-mono">{student?.matricule || conv.matricule || 'INSFP'}</span>
                    <span>
                      {conv.created_at
                        ? new Date(conv.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Récent'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation Thread */}
      <div className="flex-1 flex flex-col bg-[#111724]">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="px-6 py-4 border-b border-[#1f293d] bg-[#141d2e] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">{selectedConversation.subject}</h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedConversation.status === 'OPEN'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : selectedConversation.status === 'RESOLVED'
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {selectedConversation.status === 'OPEN'
                      ? 'En cours'
                      : selectedConversation.status === 'RESOLVED'
                      ? 'Résolu'
                      : 'Clôturé'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>
                    Stagiaire :{' '}
                    <strong className="text-slate-200">
                      {selectedConversation.student_name || 'Stagiaire INSFP'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-emerald-400">
                    {selectedConversation.matricule || 'Section BTS'}
                  </span>
                </div>
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Statut :</span>
                <select
                  value={selectedConversation.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="bg-[#182338] border border-[#23354e] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="OPEN">Ouvert (En cours)</option>
                  <option value="RESOLVED">Résolu (Validé)</option>
                  <option value="CLOSED">Fermé (Archivé)</option>
                </select>
              </div>
            </div>

            {/* Messages Timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-400" />
                  Chargement des messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  Aucun message échangé dans cette discussion.
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin =
                    msg.sender_role === 'ADMINISTRATION' || (msg.sender_role as string) === 'ADMIN';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300">{msg.sender_name}</span>
                        <span>•</span>
                        <span>
                          {msg.created_at
                            ? new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <div
                        className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-950/40'
                            : 'bg-[#182235] text-slate-100 border border-[#223049] rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>

                        {msg.attachment_url && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <a
                              href={msg.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] underline flex items-center gap-1 hover:opacity-80"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>Consulter la pièce jointe</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Strip */}
            <div className="px-6 py-2 bg-[#121927] border-t border-[#1a2336] flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">
                Réponses Rapides :
              </span>
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qr)}
                  className="px-2.5 py-1 bg-[#182338] hover:bg-[#202f4a] border border-[#23354e] rounded-full text-[11px] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Message Composer */}
            <div className="p-4 border-t border-[#1f293d] bg-[#141d2e]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <textarea
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="Rédiger une réponse officielle de l administration... (Entrée pour envoyer)"
                  className="flex-1 bg-[#162032] border border-[#223049] rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />

                <Magnet padding={8} magnetStrength={0.25}>
                  <button
                    type="submit"
                    disabled={isSending || !newMessageText.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-950/50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Envoyer la réponse"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </Magnet>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
            <div className="text-sm font-semibold text-slate-400">
              Sélectionnez une discussion
            </div>
            <div className="text-xs text-slate-500 max-w-sm mt-1">
              Choisissez un échange dans le panneau de gauche ou cliquez sur "Nouveau" pour initier une communication avec un stagiaire.
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111724] border border-[#223049] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Nouvelle Discussion</h3>
                  <div className="text-xs text-slate-400">
                    Ouvrir un fil de communication officiel avec un stagiaire
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

            {modalError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateConversation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Stagiaire Destinataire *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un stagiaire...</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.first_name} {st.last_name} ({st.matricule}) - {st.class_name || 'Section'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Objet de la Discussion *
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Convocation commission d assiduité, Justificatif médical..."
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Premier Message
                </label>
                <textarea
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  rows={4}
                  placeholder="Rédigez les détails du message adressé au stagiaire..."
                  className="w-full bg-[#162032] border border-[#223049] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
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
                  disabled={isCreatingConv}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isCreatingConv ? 'Création...' : 'Ouvrir la Discussion'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
