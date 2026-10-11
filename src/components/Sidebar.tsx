import React, { useState, useEffect } from 'react';
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
  Scan,
  TrendingUp,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { InsfpUser } from '../types';
import { ShinyText, Magnet } from './react-bits';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

export type NavigationTab =
  | 'dashboard'
  | 'scanner'
  | 'trainees'
  | 'instructors'
  | 'classes'
  | 'specialities'
  | 'sessions'
  | 'justifications'
  | 'alerts'
  | 'analytics'
  | 'messages'
  | 'notifications'
  | 'reports'
  | 'audit';

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
  const { language, t } = useThemeLanguage();
  const [showOptionalModules, setShowOptionalModules] = useState<boolean>(() => {
    try {
      return localStorage.getItem('assiduo_show_optional_modules') !== 'false';
    } catch {
      return true;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('assiduo_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleSettingsChange = () => {
      try {
        setShowOptionalModules(localStorage.getItem('assiduo_show_optional_modules') !== 'false');
        setIsCollapsed(localStorage.getItem('assiduo_sidebar_collapsed') === 'true');
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('assiduo_settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('assiduo_settings_changed', handleSettingsChange);
    };
  }, []);

  const toggleOptionalModules = () => {
    const nextState = !showOptionalModules;
    setShowOptionalModules(nextState);
    try {
      localStorage.setItem('assiduo_show_optional_modules', String(nextState));
      window.dispatchEvent(new Event('assiduo_settings_changed'));
    } catch {
      // ignore
    }
    if (!nextState && (currentTab === 'scanner' || currentTab === 'analytics' || currentTab === 'audit')) {
      onSelectTab('dashboard');
    }
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('assiduo_sidebar_collapsed', String(next));
      window.dispatchEvent(new Event('assiduo_settings_changed'));
    } catch {
      // ignore
    }
  };

  const coreNavItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: t('navDashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'trainees' as NavigationTab,
      label: language === 'ar' ? 'المتربصون' : language === 'en' ? 'Students' : 'Stagiaires',
      icon: GraduationCap,
    },
    {
      id: 'instructors' as NavigationTab,
      label: language === 'ar' ? 'الأساتذة' : language === 'en' ? 'Instructors' : 'Formateurs',
      icon: Users,
    },
    {
      id: 'classes' as NavigationTab,
      label: language === 'ar' ? 'الأقسام' : language === 'en' ? 'Classes' : 'Classes & Sections',
      icon: School,
    },
    {
      id: 'specialities' as NavigationTab,
      label: language === 'ar' ? 'الشعب والتخصصات' : language === 'en' ? 'Specialties' : 'Filières & Spécialités',
      icon: BookOpen,
    },
    {
      id: 'sessions' as NavigationTab,
      label: language === 'ar' ? 'الحصص والإمضاء' : language === 'en' ? 'Sessions' : 'Séances & Émargement',
      icon: Clock,
    },
    {
      id: 'justifications' as NavigationTab,
      label: language === 'ar' ? 'المبررات' : language === 'en' ? 'Justifications' : 'Justificatifs',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'alerts' as NavigationTab,
      label: language === 'ar' ? 'تنبيهات الغياب' : language === 'en' ? 'Attendance Alerts' : 'Alertes Absence',
      icon: AlertTriangle,
      badge: alertCount > 0 ? alertCount : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/30',
    },
    {
      id: 'messages' as NavigationTab,
      label: language === 'ar' ? 'الرسائل' : language === 'en' ? 'Messages' : 'Messagerie',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'notifications' as NavigationTab,
      label: language === 'ar' ? 'الإعلانات' : language === 'en' ? 'Announcements' : 'Communications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    },
    {
      id: 'reports' as NavigationTab,
      label: language === 'ar' ? 'السجلات الرسمية' : language === 'en' ? 'Registers & Export' : 'Registres & Export',
      icon: FileText,
    },
  ];

  const optionalNavItems = [
    {
      id: 'scanner' as NavigationTab,
      label: language === 'ar' ? 'شباك التأشير' : language === 'en' ? 'Check-in Desk' : 'Guichet Émargement',
      icon: Scan,
      badge: language === 'ar' ? 'إضافي' : language === 'en' ? 'Optional' : 'Optionnel',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px]',
    },
    {
      id: 'analytics' as NavigationTab,
      label: language === 'ar' ? 'التحليلات وخطر الانقطاع' : language === 'en' ? 'Analytics & Risk' : 'Analytique & Risque',
      icon: TrendingUp,
      badge: language === 'ar' ? 'إضافي' : language === 'en' ? 'Optional' : 'Optionnel',
      badgeColor: 'bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px]',
    },
    {
      id: 'audit' as NavigationTab,
      label: language === 'ar' ? 'سجل التدقيق' : language === 'en' ? 'Audit Log' : "Journal d'Audit",
      icon: ShieldCheck,
      badge: language === 'ar' ? 'إضافي' : language === 'en' ? 'Optional' : 'Optionnel',
      badgeColor: 'bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[9px]',
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#111724] border-r border-[#1f293d] flex flex-col justify-between select-none h-screen transition-all duration-300 shrink-0`}
    >
      {/* Top Section */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div className="px-4 py-4 border-b border-[#1f293d] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-[#223049] bg-[#0A0E17] flex items-center justify-center p-1 shrink-0">
              <img src="/logos/assiduo-icon.png" alt="Assiduo" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <ShinyText
                  text="ASSIDUO"
                  speed={6}
                  className="text-sm font-bold tracking-wider text-white truncate"
                />
                <div className="text-[10px] font-medium text-slate-400 truncate">
                  INSFP Ouled Fayet
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1a253a] rounded-lg transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Database Status Tag */}
        {!isCollapsed && (
          <div className="px-4 py-2 mx-3 mt-3 bg-[#162032] border border-[#223049] rounded-lg flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Supabase Live
            </span>
            <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              afwqtjmw
            </span>
          </div>
        )}

        {/* Mode Alternator Switch */}
        {!isCollapsed && (
          <div className="flex items-center justify-between px-3 py-1.5 mx-3 mt-2 bg-[#141d2e] border border-[#1f2c42] rounded-lg text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {showOptionalModules
                  ? language === 'ar'
                    ? 'وضع الحرم الجامعي'
                    : language === 'en'
                    ? 'Campus Mode'
                    : 'Mode Campus Avancé'
                  : language === 'ar'
                  ? 'الوضع القياسي'
                  : language === 'en'
                  ? 'Standard Mode'
                  : 'Mode Standard'}
              </span>
            </div>
            <button
              onClick={toggleOptionalModules}
              title={
                showOptionalModules
                  ? language === 'ar'
                    ? 'إخفاء الوحدات الإضافية'
                    : language === 'en'
                    ? 'Hide optional modules'
                    : 'Masquer les modules optionnels'
                  : language === 'ar'
                  ? 'إظهار الوحدات الإضافية'
                  : language === 'en'
                  ? 'Show optional modules'
                  : 'Afficher les modules optionnels'
              }
              className="px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30"
            >
              {showOptionalModules ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>
                {showOptionalModules
                  ? language === 'ar'
                    ? 'إخفاء'
                    : language === 'en'
                    ? 'Hide'
                    : 'Masquer'
                  : language === 'ar'
                  ? 'إظهار'
                  : language === 'en'
                  ? 'Show'
                  : 'Afficher'}
              </span>
            </button>
          </div>
        )}

        {/* Navigation Links Area */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 mt-1 custom-scrollbar">
          {/* Core Modules */}
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {language === 'ar'
                ? 'التسيير البيداغوجي'
                : language === 'en'
                ? 'Academic Management'
                : 'Gestion Pédagogique'}
            </div>
          )}

          {coreNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                } rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#182235]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge !== undefined && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-2 right-2" />
                )}
              </button>
            );
          })}

          {/* Optional Campus Modules Header & Items */}
          <div className="pt-3">
            {!isCollapsed ? (
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>
                  {language === 'ar'
                    ? 'وحدات إضافية'
                    : language === 'en'
                    ? 'Optional Modules'
                    : 'Modules Campus (Optionnels)'}
                </span>
                <button
                  onClick={toggleOptionalModules}
                  className="p-1 hover:text-white text-slate-400 rounded transition-colors cursor-pointer"
                  title={
                    showOptionalModules
                      ? language === 'ar'
                        ? 'إخفاء الوحدات الإضافية'
                        : language === 'en'
                        ? 'Hide optional modules'
                        : 'Masquer les modules optionnels'
                      : language === 'ar'
                      ? 'إظهار الوحدات الإضافية'
                      : language === 'en'
                      ? 'Show optional modules'
                      : 'Afficher les modules optionnels'
                  }
                >
                  {showOptionalModules ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="my-2 border-t border-[#1f293d]" />
            )}

            {showOptionalModules ? (
              optionalNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                    } rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#182235]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-400' : 'text-slate-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className={`px-1.5 py-0.2 rounded font-mono ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              !isCollapsed && (
                <div className="px-3 py-2 rounded-lg bg-[#141d2e]/60 border border-dashed border-[#23314a] flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {language === 'ar'
                      ? '3 وحدات مخفية'
                      : language === 'en'
                      ? '3 modules hidden'
                      : '3 modules masqués'}
                  </span>
                  <button
                    onClick={toggleOptionalModules}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold text-[10px] cursor-pointer"
                  >
                    {language === 'ar' ? 'إظهار' : language === 'en' ? 'Show' : 'Afficher'}
                  </button>
                </div>
              )
            )}
          </div>
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#1f293d] bg-[#0e1420]">
        {!isCollapsed ? (
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
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold font-mono">
              {currentUser?.first_name?.[0] || 'A'}
            </div>
            <button
              onClick={onLogout}
              title="Déconnexion"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
