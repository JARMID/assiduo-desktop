import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Printer,
  Shield,
  Smartphone,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { ShinyText, Magnet, BlurText } from './react-bits';
import { sound } from '../lib/audioFeedback';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface HeaderProps {
  currentTab: NavigationTab;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onOpenSecurity?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenDownloadApps?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onRefresh,
  isRefreshing = false,
  onOpenSecurity,
  onOpenCommandPalette,
  onOpenDownloadApps,
}) => {
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR';
      setTimeString(
        now.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateString(
        now.toLocaleDateString(locale, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: language === 'ar' ? 'لوحة القيادة العامة' : language === 'en' ? 'General Dashboard' : 'Tableau de Bord Général',
          subtitle: language === 'ar' ? 'متابعة مباشرة لنسب الحضور ومجريات التكوين' : language === 'en' ? 'Live supervision of attendance rates and academic progress' : 'Supervision en direct de l\'assiduité et des flux de formation',
        };
      case 'trainees':
        return {
          title: language === 'ar' ? 'دليل وسجل المتربصين' : language === 'en' ? 'Trainees Directory' : 'Répertoire des Stagiaires',
          subtitle: language === 'ar' ? 'الملفات الإدارية وأرقام التسجيل ومتابعة الغيابات الفردية' : language === 'en' ? 'Administrative records, registration numbers and attendance tracking' : 'Fiches administratives, matricules et suivi de présence individuelle',
        };
      case 'instructors':
        return {
          title: language === 'ar' ? 'هيئة التدريس والمكونون' : language === 'en' ? 'Faculty & Instructors' : 'Corps Enseignant',
          subtitle: language === 'ar' ? 'الأساتذة وتوزيع المواد ومتابعة الحصص المؤداة' : language === 'en' ? 'Instructors, modular assignments and session tracking' : 'Formateurs, affectations modulaires et suivi des vacations',
        };
      case 'classes':
        return {
          title: language === 'ar' ? 'الدفعات والأقسام' : language === 'en' ? 'Classes & Cohorts' : 'Promotions et Sections',
          subtitle: language === 'ar' ? 'تنظيم الشعب والسداسيات وتعداد المسجلين' : language === 'en' ? 'Organization of fields, semesters and registered headcount' : 'Organisation des filières, semestres et effectifs inscrits',
        };
      case 'specialities':
        return {
          title: language === 'ar' ? 'الشعب والتخصصات التكوينية' : language === 'en' ? 'Educational Specialties' : 'Filières et Spécialités Pédagogiques',
          subtitle: language === 'ar' ? 'البرامج الرسمية الوزارية والشهادات وطاقات الاستيعاب' : language === 'en' ? 'Official ministry programs, national diplomas and intake capacity' : 'Programmes officiels du ministère, diplômes d État et capacités d accueil',
        };
      case 'sessions':
        return {
          title: language === 'ar' ? 'الحصص وقوائم الإمضاء' : language === 'en' ? 'Sessions & Attendance Lists' : 'Séances et Feuilles d Émargement',
          subtitle: language === 'ar' ? 'الفترات الزمنية الرسمية ومراقبة الحضور الحيني' : language === 'en' ? 'Official schedule slots and real-time attendance tracking' : 'Créneaux horaires officiels et contrôle de présence en temps réel',
        };
      case 'justifications':
        return {
          title: language === 'ar' ? 'المبررات' : language === 'en' ? 'Justifications' : 'Justificatifs',
          subtitle: language === 'ar' ? 'فحص وتأكيد الشهادات والوثائق التبريرية' : language === 'en' ? 'Review and validation of certificates and excuse documents' : 'Contrôle et validation des certificats et pièces justificatives',
        };
      case 'alerts':
        return {
          title: language === 'ar' ? 'التنبيهات القانونية وخطر الانقطاع' : language === 'en' ? 'Regulatory Alerts & Risk' : 'Alertes Réglementaires et Risque d Abandon',
          subtitle: language === 'ar' ? 'عتبات 3 حصص و 10 ساعات وسقف 25% للإقصاء' : language === 'en' ? '3-session, 10-hour thresholds and the 25% exclusion ceiling' : 'Seuils des 3 séances, 10 heures et palier des 25% d exclusion',
        };
      case 'messages':
        return {
          title: language === 'ar' ? 'المراسلات والتوجيهات البيداغوجية' : language === 'en' ? 'Pedagogical Messaging' : 'Messagerie et Échanges Pédagogiques',
          subtitle: language === 'ar' ? 'التواصل الرسمي المباشر مع المتربصين والأساتذة' : language === 'en' ? 'Direct official communications with trainees and instructors' : 'Communications officielles directes avec les stagiaires et formateurs',
        };
      case 'notifications':
        return {
          title: language === 'ar' ? 'الإعلانات وتنبيهات النظام' : language === 'en' ? 'Announcements & Alerts' : 'Communications et Alertes Système',
          subtitle: language === 'ar' ? 'نشر الإعلانات المؤسساتية ومعالجة كلمات المرور' : language === 'en' ? 'Institutional announcement broadcasts and password assistance' : 'Diffusion d annonces institutionnelles et traitement des mots de passe',
        };
      case 'reports':
        return {
          title: language === 'ar' ? 'السجلات البيداغوجية ومحاضر الامتحانات' : language === 'en' ? 'Pedagogical Registers & Exams' : 'Registres Pédagogiques et Feuilles d Examen',
          subtitle: language === 'ar' ? 'توليد وطباعة الوثائق الرسمية المطابقة للوزارة' : language === 'en' ? 'Generation and printing of ministry-compliant official records' : 'Génération et impression des états officiels conformes au ministère',
        };
      case 'scanner':
        return {
          title: language === 'ar' ? 'شباك التأشير الفوري وقراءة البطاقات' : language === 'en' ? 'Direct Check-in & Badge Scanner' : 'Guichet d\'Émargement Direct & Scan de Badges',
          subtitle: language === 'ar' ? 'التأشير بقارئ الباركود أو الكاميرا وتسجيل الحضور الفوري' : language === 'en' ? 'Physical badge scanning via USB reader, webcam and instant check-in' : 'Pointage physique par douchette USB, webcam et émargement instantané au guichet',
        };
      case 'analytics':
        return {
          title: language === 'ar' ? 'التحليلات التنبؤية والوقاية من التسرب' : language === 'en' ? 'Predictive Analytics' : 'Analytique Prédictive & Prévention du Décrochage',
          subtitle: language === 'ar' ? 'الملفات الأسبوعية والفترات الحساسة والفئات المعرضة للخطر' : language === 'en' ? 'Weekly profiles (Sun-Thu), vulnerable slots and cohorts at risk' : 'Profils hebdomadaires (Dimanche-Jeudi), créneaux sensibles et cohortes à risque',
        };
      case 'audit':
        return {
          title: language === 'ar' ? 'سجل التدقيق والتتبع القانوني' : language === 'en' ? 'Audit Log & Traceability' : 'Journal d\'Audit & Traçabilité Réglementaire',
          subtitle: language === 'ar' ? 'سجل أمني مشفر وموثق مطابق للمرسوم التنفيذي 18-162' : language === 'en' ? 'Tamper-proof cryptographic log compliant with executive decree 18-162' : 'Registre cryptographique infalsifiable conforme au décret exécutif 18-162 et ISO 27001',
        };
      default:
        return {
          title: language === 'ar' ? 'إدارة المعهد INSFP' : language === 'en' ? 'INSFP Administration' : 'Administration INSFP',
          subtitle: language === 'ar' ? 'بوابة التسيير' : language === 'en' ? 'Management Portal' : 'Portail de gestion',
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="h-18 bg-[#111724] border-b border-[#1f293d] px-6 flex items-center justify-between select-none">
      {/* Title & Context */}
      <div>
        <ShinyText
          text={title}
          speed={6}
          className="text-base font-bold text-white tracking-tight"
        />
        <BlurText
          key={`${currentTab}-${language}`}
          text={subtitle}
          className="text-xs text-slate-400 mt-0.5"
          delay={25}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sync Status Badge (Static calm checkmark, zero pulsating dots) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#141d2e] border border-[#202d45] rounded-lg text-[10px] text-emerald-400 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{t('syncStatus')}</span>
        </div>

        {/* Command Palette Trigger */}
        <Magnet padding={15} magnetStrength={0.15}>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCommandPalette?.();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#182235] hover:bg-[#202d45] border border-[#223049] hover:border-slate-500 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer w-56 justify-between"
            title="Ouvrir la palette de commandes (Ctrl + K)"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {language === 'ar' ? 'بحث سريع...' : language === 'en' ? 'Quick search...' : 'Recherche rapide...'}
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#101726] border border-[#263756] text-[10px] font-mono text-emerald-400 shrink-0">
              Ctrl K
            </kbd>
          </button>
        </Magnet>

        {/* Language Switcher Pill (FR / AR / EN) */}
        <div className="flex items-center bg-[#141d2e] border border-[#202d45] rounded-lg p-0.5 text-xs font-semibold">
          <button
            onClick={() => {
              sound.playClick();
              setLanguage('fr');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              language === 'fr'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Français"
          >
            FR
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setLanguage('ar');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              language === 'ar'
                ? 'bg-blue-600 text-white shadow-sm font-sans'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="العربية"
          >
            العربية
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setLanguage('en');
            }}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="English"
          >
            EN
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <Magnet padding={10} magnetStrength={0.25}>
          <button
            onClick={() => {
              sound.playClick();
              toggleTheme();
            }}
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
            className="p-2 bg-[#182235] hover:bg-[#202d45] border border-[#223049] rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>
        </Magnet>

        {/* Live Clock Ticker */}
        <div className="px-3 py-1 bg-[#141d2e] border border-[#202d45] rounded-lg text-right font-mono">
          <div className="text-xs font-semibold text-emerald-400 tracking-wider">
            {timeString}
          </div>
          <div className="text-[10px] text-slate-400 capitalize">{dateString}</div>
        </div>

        {/* Refresh Button */}
        <Magnet padding={10} magnetStrength={0.25}>
          <button
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            disabled={isRefreshing}
            title="Actualiser les données (F5 ou Ctrl+R)"
            className="p-2 bg-[#182235] hover:bg-[#202d45] border border-[#223049] rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
            />
          </button>
        </Magnet>

        {/* Security & Password Button */}
        {onOpenSecurity && (
          <Magnet padding={10} magnetStrength={0.25}>
            <button
              onClick={() => {
                sound.playClick();
                onOpenSecurity();
              }}
              title="Paramètres de sécurité & mot de passe"
              className="p-2 bg-[#182235] hover:bg-[#202d45] border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4" />
            </button>
          </Magnet>
        )}

        {/* Download Apps Button */}
        {onOpenDownloadApps && (
          <Magnet padding={10} magnetStrength={0.25}>
            <button
              onClick={() => {
                sound.playClick();
                onOpenDownloadApps();
              }}
              title="Télécharger les applications mobiles (QR & APK)"
              className="p-2 bg-[#182235] hover:bg-[#202d45] border border-emerald-500/30 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </Magnet>
        )}

        {/* Print Button */}
        <Magnet padding={10} magnetStrength={0.25}>
          <button
            onClick={() => {
              sound.playClick();
              window.print();
            }}
            title="Imprimer cette vue"
            className="p-2 bg-[#182235] hover:bg-[#202d45] border border-[#223049] rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer no-print"
          >
            <Printer className="w-4 h-4" />
          </button>
        </Magnet>
      </div>
    </header>
  );
};

