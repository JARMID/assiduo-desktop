import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  CalendarCheck,
  FileCheck2,
  ShieldAlert,
  Printer,
  Shield,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  User,
  BookOpen,
  MessageSquare,
  Bell,
  Smartphone,
  Scan,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { Student } from '../types';
import { SpotlightCard } from './react-bits';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewStudent: () => void;
  onOpenBulkImport: () => void;
  onOpenNewClass: () => void;
  onOpenNewSession: () => void;
  onOpenSecurity: () => void;
  onOpenDownloadApps?: () => void;
  onSelectStudent: (student: Student) => void;
  students: Student[];
}

interface PaletteAction {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'ACTION' | 'STUDENT';
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewStudent,
  onOpenBulkImport,
  onOpenNewClass,
  onOpenNewSession,
  onOpenSecurity,
  onOpenDownloadApps,
  onSelectStudent,
  students,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const baseActions: PaletteAction[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Tableau de Bord Institutionnel',
        category: 'NAVIGATION',
        shortcut: 'G D',
        icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('dashboard');
          onClose();
        },
      },
      {
        id: 'nav-scanner',
        title: 'Guichet d Émargement Direct & Scan de Badges',
        category: 'NAVIGATION',
        shortcut: 'G Q',
        icon: <Scan className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('scanner');
          onClose();
        },
      },
      {
        id: 'nav-trainees',
        title: 'Registre des Stagiaires & Dossiers',
        category: 'NAVIGATION',
        shortcut: 'G S',
        icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('trainees');
          onClose();
        },
      },
      {
        id: 'nav-instructors',
        title: 'Corps Enseignant & Titulaires de Modules',
        category: 'NAVIGATION',
        shortcut: 'G E',
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('instructors');
          onClose();
        },
      },
      {
        id: 'nav-classes',
        title: 'Sections Pédagogiques & Filières BTS',
        category: 'NAVIGATION',
        shortcut: 'G C',
        icon: <School className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('classes');
          onClose();
        },
      },
      {
        id: 'nav-specialities',
        title: 'Filières & Spécialités Homologuées',
        category: 'NAVIGATION',
        shortcut: 'G F',
        icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('specialities');
          onClose();
        },
      },
      {
        id: 'nav-sessions',
        title: 'Émargement Numérique & Séances du Jour',
        category: 'NAVIGATION',
        shortcut: 'G P',
        icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('sessions');
          onClose();
        },
      },
      {
        id: 'nav-justifs',
        title: 'Justificatifs',
        category: 'NAVIGATION',
        shortcut: 'G J',
        icon: <FileCheck2 className="w-4 h-4 text-amber-400" />,
        action: () => {
          onNavigate('justifications');
          onClose();
        },
      },
      {
        id: 'nav-alerts',
        title: 'Alertes d Assiduité & Dispatches SMS',
        category: 'NAVIGATION',
        shortcut: 'G A',
        icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        action: () => {
          onNavigate('alerts');
          onClose();
        },
      },
      {
        id: 'nav-messages',
        title: 'Messagerie & Échanges Pédagogiques',
        category: 'NAVIGATION',
        shortcut: 'G M',
        icon: <MessageSquare className="w-4 h-4 text-blue-400" />,
        action: () => {
          onNavigate('messages');
          onClose();
        },
      },
      {
        id: 'nav-notifications',
        title: 'Communications & Diffusion d Annonces',
        category: 'NAVIGATION',
        shortcut: 'G N',
        icon: <Bell className="w-4 h-4 text-teal-400" />,
        action: () => {
          onNavigate('notifications');
          onClose();
        },
      },
      {
        id: 'nav-reports',
        title: 'Bilan Mensuel & Registre Pédagogique A4',
        category: 'NAVIGATION',
        shortcut: 'G R',
        icon: <Printer className="w-4 h-4 text-slate-300" />,
        action: () => {
          onNavigate('reports');
          onClose();
        },
      },
      {
        id: 'nav-analytics',
        title: 'Analytique Prédictive & Prévention du Décrochage',
        category: 'NAVIGATION',
        shortcut: 'G T',
        icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('analytics');
          onClose();
        },
      },
      {
        id: 'nav-audit',
        title: 'Journal d Audit & Traçabilité Réglementaire',
        category: 'NAVIGATION',
        shortcut: 'G U',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('audit');
          onClose();
        },
      },
      // Actions
      {
        id: 'act-new-student',
        title: 'Enrôler un Nouveau Stagiaire',
        category: 'ACTION',
        shortcut: 'N S',
        icon: <Plus className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('trainees');
          onClose();
          onOpenNewStudent();
        },
      },
      {
        id: 'act-bulk-import',
        title: 'Importation Massive CSV / Excel de Promotion',
        category: 'ACTION',
        shortcut: 'I C',
        icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('trainees');
          onClose();
          onOpenBulkImport();
        },
      },
      {
        id: 'act-new-class',
        title: 'Créer une Nouvelle Section Pédagogique',
        category: 'ACTION',
        shortcut: 'N C',
        icon: <School className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('classes');
          onClose();
          onOpenNewClass();
        },
      },
      {
        id: 'act-new-session',
        title: 'Planifier une Séance de Cours / TP',
        category: 'ACTION',
        shortcut: 'N P',
        icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('sessions');
          onClose();
          onOpenNewSession();
        },
      },
      {
        id: 'act-security',
        title: 'Politique de Mots de Passe & HaveIBeenPwned',
        category: 'ACTION',
        shortcut: 'S E',
        icon: <Shield className="w-4 h-4 text-blue-400" />,
        action: () => {
          onClose();
          onOpenSecurity();
        },
      },
      {
        id: 'act-download-apps',
        title: 'Télécharger les Applications Mobiles (QR & APK)',
        category: 'ACTION',
        shortcut: 'A M',
        icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onClose();
          onOpenDownloadApps?.();
        },
      },
    ],
    [
      onNavigate,
      onClose,
      onOpenNewStudent,
      onOpenBulkImport,
      onOpenNewClass,
      onOpenNewSession,
      onOpenSecurity,
      onOpenDownloadApps,
    ]
  );

  // Student instant search results
  const studentActions: PaletteAction[] = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return students
      .filter((s) => {
        const full = `${s.first_name} ${s.last_name}`.toLowerCase();
        return full.includes(q) || s.matricule.toLowerCase().includes(q);
      })
      .slice(0, 5)
      .map((s) => ({
        id: `student-${s.id}`,
        title: `${s.last_name.toUpperCase()} ${s.first_name} (${s.matricule}) - ${s.class_name || 'Section'}`,
        category: 'STUDENT',
        shortcut: `${(s.attendance_rate || 95).toFixed(0)}%`,
        icon: <User className="w-4 h-4 text-emerald-400" />,
        action: () => {
          onNavigate('trainees');
          onClose();
          onSelectStudent(s);
        },
      }));
  }, [query, students, onNavigate, onClose, onSelectStudent]);

  const filteredActions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return baseActions;
    const baseMatches = baseActions.filter((a) =>
      a.title.toLowerCase().includes(q)
    );
    return [...studentActions, ...baseMatches];
  }, [query, baseActions, studentActions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredActions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredActions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredActions[selectedIndex];
      if (current) current.action();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-xs p-4"
    >
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.16)"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-[#101726] border border-[#24334f] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Search Input */}
        <div className="p-3.5 border-b border-[#1f2c42] flex items-center gap-3">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une vue, action, ou stagiaire (ex: Amine, Séance, CSV)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#182338] border border-[#263756] text-[10px] font-mono text-slate-400">
            Échap
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Aucune action ou stagiaire trouvé pour "{query}".
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#18253a] text-white border border-emerald-500/40 shadow-xs'
                      : 'hover:bg-[#141d2e] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="shrink-0">{item.icon}</div>
                    <span className="truncate font-medium">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#0d131f] border border-[#1f2c42] text-slate-400">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="p-2.5 bg-[#0a0f19] border-t border-[#1f2c42] flex items-center justify-between text-[11px] text-slate-400 px-3">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-[#141d2e] px-1.5 py-0.5 rounded border border-[#1f2c42] text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="font-mono bg-[#141d2e] px-1.5 py-0.5 rounded border border-[#1f2c42] text-[10px]">
                ↓
              </kbd>{' '}
              Naviguer
            </span>
            <span>
              <kbd className="font-mono bg-[#141d2e] px-1.5 py-0.5 rounded border border-[#1f2c42] text-[10px]">
                ↵
              </kbd>{' '}
              Sélectionner
            </span>
          </div>

          <span className="text-[10px] text-emerald-400 font-mono">
            INSFP Command Palette • v1.0
          </span>
        </div>
      </SpotlightCard>
    </div>
  );
};
