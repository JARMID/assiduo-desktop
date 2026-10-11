import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Clock,
  FileCheck2,
  AlertTriangle,
  FileText,
  LogOut,
  Radio,
  MessageSquare,
  Bell,
  BookOpen,
} from 'lucide-react';
import { InsfpUser } from '../types';
import { ShinyText, Magnet } from './react-bits';

export type NavigationTab =
  | 'dashboard'
  | 'trainees'
  | 'instructors'
  | 'classes'
  | 'specialities'
  | 'sessions'
  | 'justifications'
  | 'alerts'
  | 'messages'
  | 'notifications'
  | 'reports';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: InsfpUser | null;
  onLogout: () => void;
  pendingCount?: number;
  alertCount?: number;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  pendingCount = 0,
  alertCount = 0,
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'trainees' as NavigationTab,
      label: 'Stagiaires',
      icon: GraduationCap,
    },
    {
      id: 'instructors' as NavigationTab,
      label: 'Formateurs',
      icon: Users,
    },
    {
      id: 'classes' as NavigationTab,
      label: 'Classes & Sections',
      icon: School,
    },
    {
      id: 'specialities' as NavigationTab,
      label: 'Filières & Spécialités',
      icon: BookOpen,
    },
    {
      id: 'sessions' as NavigationTab,
      label: 'Séances & Émargement',
      icon: Clock,
    },
    {
      id: 'justifications' as NavigationTab,
      label: 'Justificatifs & IA',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'alerts' as NavigationTab,
      label: 'Alertes Absence',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/30',
    },
    {
      id: 'messages' as NavigationTab,
      label: 'Messagerie',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'notifications' as NavigationTab,
      label: 'Communications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Registres & Export',
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-[#111724] border-r border-[#1f293d] flex flex-col justify-between select-none h-screen">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-5 border-b border-[#1f293d] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-[#223049] bg-[#0A0E17] flex items-center justify-center p-1 shrink-0">
            <img src="/logos/assiduo-icon.png" alt="Assiduo" className="w-full h-full object-contain" />
          </div>
          <div>
            <ShinyText
              text="ASSIDUO"
              speed={6}
              className="text-sm font-bold tracking-wider text-white"
            />
            <div className="text-[10px] font-medium text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              INSFP Ouled Fayet
            </div>
          </div>
        </div>

        {/* Database Status Tag */}
        <div className="px-4 py-2.5 mx-3 mt-3 bg-[#162032] border border-[#223049] rounded-lg flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            Supabase Live
          </span>
          <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            afwqtjmw
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#182235]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#1f293d] bg-[#0e1420]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#141d2e] border border-[#1f2c42]">
          <div className="truncate pr-2">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {currentUser
                ? `${currentUser.first_name} ${currentUser.last_name}`
                : 'Direction Pédagogique'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {currentUser?.email || 'admin@insfp.dz'}
            </div>
          </div>
          <Magnet padding={8} magnetStrength={0.25}>
            <button
              onClick={onLogout}
              title="Déconnexion"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Magnet>
        </div>
      </div>
    </aside>
  );
};
