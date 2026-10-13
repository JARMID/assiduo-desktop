import React, { useState, useMemo } from 'react';
import {
  Shield,
  X,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Scan,
  TrendingUp,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Globe,
  BookOpen,
  Search,
  Printer,
  Info,
} from 'lucide-react';
import {
  evaluatePasswordPolicy,
  validatePasswordFull,
} from '../lib/passwordPolicy';
import { supabase } from '../lib/supabase';
import { SpotlightCard, ShinyText, Magnet } from './react-bits';
import { sound } from '../lib/audioFeedback';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  initialTab?: 'SECURITY' | 'MODULES' | 'GUIDE';
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  initialTab = 'SECURITY',
}) => {
  const { theme, setTheme, language, setLanguage, t } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'MODULES' | 'GUIDE'>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && (!prevIsOpen || initialTab !== prevInitialTab)) {
    setPrevIsOpen(isOpen);
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const [guideSearchQuery, setGuideSearchQuery] = useState('');
  const [selectedGuideCategory, setSelectedGuideCategory] = useState<string>('ALL');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [showOptionalModules, setShowOptionalModules] = useState<boolean>(() => {
    try {
      return localStorage.getItem('assiduo_show_optional_modules') !== 'false';
    } catch {
      return true;
    }
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('assiduo_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isAudioEnabled, setIsAudioEnabled] = useState(sound.getEnabled());

  const guideTopics = useMemo(
    () => [
      {
        id: 'roles',
        category: 'ARCHITECTURE',
        title:
          language === 'ar'
            ? '1. الأدوار والمنصات الثلاث'
            : language === 'en'
            ? '1. Ecosystem Roles & Three Surfaces'
            : '1. Architecture & Rôles des Trois Plateformes',
        subtitle:
          language === 'ar'
            ? 'توزيع المهام بين الحاسوب، هاتف المتربص وهاتف الأستاذ'
            : language === 'en'
            ? 'Responsibilities across Desktop, Trainee App, and Instructor Client'
            : 'Répartition des flux entre Bureau, Application Stagiaire et Client Formateur',
        content:
          language === 'ar'
            ? [
                'بوابة الإدارة المركزية (Desktop Tauri): مخصصة للمدير البيداغوجي ومصالح المراقبة، تتيح إدارة الأفواج، الأساتذة، متابعة الغيابات وطباعة الكشوف الرسمية.',
                'تطبيق المتربص (Mobile Flutter): مخصص للطلبة لمسح رمز QR للحصة، متابعة نسبة الحضور الشخصية وتقديم التبريرات الطبية.',
                'تطبيق الأستاذ (Mobile Presence): يتيح للأستاذ توليد رمز QR ديناميكي، تسجيل الحضور اليدوي وتصدير السجلات الموقعة.',
              ]
            : language === 'en'
            ? [
                'Central Administration Portal (Desktop Tauri): Intended for the pedagogical director and supervisory staff to manage cohorts, instructors, absence thresholds, and certified printouts.',
                'Trainee Client (Mobile Flutter): Used by trainees to scan session QR tokens, track real-time attendance rates, and submit absence justifications.',
                'Instructor Client (Mobile Presence): Used in classrooms to broadcast dynamic QR codes, record manual roll calls, and export signed registers.',
              ]
            : [
                'Portail Administratif Central (Desktop Tauri) : Réservé à la Direction Pédagogique et au service scolarité pour le pilotage des promotions, l’affectation des formateurs, le suivi des seuils réglementaires et l’édition des registres officiels.',
                'Application Stagiaire (Mobile Flutter) : Installée sur smartphone pour scanner le jeton QR en début de cours, surveiller son taux d’assiduité en direct et téléverser les arrêts maladie.',
                'Client Formateur (Mobile Presence) : Utilisé en salle pour projeter le QR code tournant, valider les présences manuelles et émarger les fiches de cours.',
              ],
      },
      {
        id: 'qr-flow',
        category: 'POINTAGE',
        title:
          language === 'ar'
            ? '2. نظام تسجيل الحضور برمز QR الديناميكي'
            : language === 'en'
            ? '2. Dynamic QR Roll Call Protocol'
            : '2. Protocole de Pointage par QR Code Dynamique',
        subtitle:
          language === 'ar'
            ? 'تحديث تلقائي كل 15 ثانية لمنع الاحتيال والمشاركة'
            : language === 'en'
            ? '15-second rotating cryptographic tokens preventing proxy scans'
            : 'Jeton cryptographique renouvelé toutes les 15 secondes contre la fraude',
        content:
          language === 'ar'
            ? [
                'توليد ديناميكي: يعرض جهاز الأستاذ رمز QR يتجدد تلقائياً كل 15 ثانية مشفراً بمعرف الجلسة والوقت الحالي لمنع تصوير الشاشة وتداولها.',
                'المسح والمطابقة: يمسح المتربص الرمز بهاتفه، فيقوم الخادم بالتحقق من الفارق الزمني وتسجيل الحضور فوراً.',
                'بديل الطوارئ: في حال تعذر تشغيل الكاميرا، يمكن للمتربص كتابة الرمز الرقمي المكون من 8 أحرف المعروض أسفل الرمز، أو قيام الأستاذ بالتأشير اليدوي.',
              ]
            : language === 'en'
            ? [
                'Dynamic Refresh: The instructor screen projects a QR code regenerating every 15 seconds with timestamp verification to prevent screenshot sharing.',
                'Instant Validation: Trainee scan matches the token against the active session window with server-side grace limits.',
                'Emergency Fallback: If camera hardware fails, trainees can manually enter the 8-character token displayed below the projector, or instructors can use manual roll call.',
              ]
            : [
                'Renouvellement Automatique : Le vidéoprojecteur affiche un QR code cryptographique régénéré toutes les 15 secondes avec estampille temporelle pour empêcher l’échange de captures d’écran.',
                'Validation Instantanée : Le scan du stagiaire est vérifié par rapport à la fenêtre active de la séance avec inscription immédiate au grand livre des présences.',
                'Secours Optique : En cas de défaillance de caméra, le stagiaire peut saisir le code alphanumérique à 8 caractères affiché sous le QR, ou l’enseignant peut valider l’émargement manuel.',
              ],
      },
      {
        id: 'regulations',
        category: 'REGLEMENTATION',
        title:
          language === 'ar'
            ? '3. السلم القانوني للغيابات وعتبة الإقصاء'
            : language === 'en'
            ? '3. Regulatory Absence Sanctions & Exclusion Thresholds'
            : '3. Barème Réglementaire des Absences & Exclusion (Norme INSFP)',
        subtitle:
          language === 'ar'
            ? 'تطبيق المراسيم المنظمة لقطاع التكوين والتعليم المهنيين'
            : language === 'en'
            ? 'Algerian vocational training regulatory absence framework'
            : 'Application des dispositions réglementaires du Ministère de la Formation Professionnelle',
        content:
          language === 'ar'
            ? [
                'الإشعار الأول (3 أيام / 6 حصص): غياب متواصل غير مبرر يولد تنبيهاً بيداغوجياً أولياً في ملف المتربص.',
                'الإعذار والموجّه للولي (5 أيام / 10 حصص): إرسال إعذار رسمي كتابي وإشعار لولي الأمر عبر الرسائل القصيرة SMS مع مهلة 48 ساعة للتبرير.',
                'عتبة الإقصاء القانونية (25% من الحجم الساعي): بمجرد وصول غيابات المتربص إلى 25% من ساعات المقياس، يُقصى تلقائياً من اجتياز الامتحان الاستدراكي والرسمي لهذا المقياس.',
              ]
            : language === 'en'
            ? [
                '1st Warning (3 consecutive days / 6 sessions): Unjustified absence triggers an automated initial pedagogical warning.',
                'Formal Notice (5 consecutive days / 10 sessions): Official written notice dispatched to legal guardians via SMS with a 48-hour compliance window.',
                'Statutory Exclusion (25% of module volume): Once cumulative absences reach 25% of total module class hours, the student is legally excluded from module examinations.',
              ]
            : [
                '1er Avertissement (3 jours consécutifs / 6 séances) : Toute absence non justifiée déclenche un premier rappel à l’ordre consigné dans le dossier pédagogique.',
                'Mise en Demeure (5 jours consécutifs / 10 séances) : Notification formelle adressée aux parents par SMS avec un délai de 48 heures pour présenter les pièces justificatives.',
                'Seuil Critique d’Exclusion (25% du volume horaire) : Dès que le cumul d’absences atteint 25% du volume horaire total du module, le stagiaire est exclu de plein droit des évaluations de la session.',
              ],
      },
      {
        id: 'justifications',
        category: 'JUSTIFICATIFS',
        title:
          language === 'ar'
            ? '4. مسار إيداع ومراجعة التبريرات الطبية'
            : language === 'en'
            ? '4. Medical Certificate Workflow & Optical Audit'
            : '4. Dépôt & Audit des Justificatifs Médicaux',
        subtitle:
          language === 'ar'
            ? 'مهلة 48 ساعة مع التدقيق في الأختام والتواريخ'
            : language === 'en'
            ? '48-hour submission deadline with doctor stamp and date validation'
            : 'Délai d’introduction de 48h et vérification de conformité des cachets',
        content:
          language === 'ar'
            ? [
                'أجل الإيداع: يجب تقديم الشهادة الطبية أو المبرر الرسمي في أجل أقصاه 48 ساعة بعد استئناف الدراسة.',
                'التدقيق البصري: يقوم النظام بتحليل الوثيقة للتأكد من وجود خاتم الطبيب، رقم الاعتماد وتطابق تواريخ فترة الراحة المرضية.',
                'الاعتماد والتحيين: عند قبول التبرير من قبل الإدارة البيداغوجية، يتم خصم الساعات من مجموع الغيابات غير المبررة وتحديث نسبة الحضور تلقائياً.',
              ]
            : language === 'en'
            ? [
                'Submission Period: Medical certificates or administrative summons must be submitted within 48 business hours of return.',
                'Optical Audit: Automated OCR checks verify physician stamp presence, registration number, and clinic date ranges.',
                'Pedagogical Validation: Upon administrative approval, excused absences are converted in the ledger and excluded from sanction thresholds.',
              ]
            : [
                'Délai de Dépôt : Le certificat médical ou la convocation officielle doit être déposé dans les 48 heures ouvrables suivant la reprise des cours.',
                'Audit Optique : Analyse des éléments réglementaires (cachet du médecin, lisibilité des dates de repos, cohérence de la durée).',
                'Validation Pédagogique : L’approbation par la Direction des Études transforme l’absence en absence justifiée et recalcule immédiatement le taux d’assiduité.',
              ],
      },
      {
        id: 'badges-print',
        category: 'EDITION',
        title:
          language === 'ar'
            ? '5. طباعة بطاقات المتربصين والسجلات الرسمية'
            : language === 'en'
            ? '5. Student ID Badges & Official A4 Attendance Registers'
            : '5. Impression des Badges Stagiaires & Registres A4',
        subtitle:
          language === 'ar'
            ? 'بطاقات قياسية برمز مشفر وكشوف شهرية قانونية'
            : language === 'en'
            ? 'ISO 7810 ID-1 standard badges and printable attendance sheets'
            : 'Cartes format ISO 7810 et registres mensuels d’émargement certifiés',
        content:
          language === 'ar'
            ? [
                'بطاقات المتربصين: تتيح الإدارة طباعة بطاقات بالمعيار الدولي ISO ID-1 تحتوي على الرقم الوطني للمتربص، الشعبة والرمز الشريطي الدائم.',
                'سجلات الإمضاء A4: استخراج جداول الإمضاء الرسمية المعتمدة من الوزارة جاهزة للطباعة والتوقيع الشهري من طرف الأساتذة.',
                'الطباعة المباشرة: يمكن تصدير واستخراج بطاقة أي متربص بنقرة واحدة من جدول المتربصين.',
              ]
            : language === 'en'
            ? [
                'Student ID Badges: Instant generation of ISO 7810 ID-1 compliant badges with national matricule, cohort section, and permanent identifier barcode.',
                'A4 Monthly Sheets: Export of standardized Algerian Ministry attendance registers ready for instructor physical signatures.',
                'One-Click Export: Print individual student badges directly from the Trainees table.',
              ]
            : [
                'Badges Stagiaires : Génération instantanée au standard ISO 7810 ID-1 avec matricule national, spécialité et code QR permanent d’identification.',
                'Registres Mensuels A4 : Édition des fiches d’émargement officielles conformes aux exigences d’archivage du Ministère de la Formation Professionnelle.',
                'Impression Directe : Accessible en un clic depuis le profil de chaque stagiaire dans l’annuaire des promotions.',
              ],
      },
      {
        id: 'offline-sync',
        category: 'HORS_LIGNE',
        title:
          language === 'ar'
            ? '6. العمل دون إنترنت والمزامنة التلقائية'
            : language === 'en'
            ? '6. Offline Resilience & SQLite Sync Engine'
            : '6. Résilience Hors-Ligne & Moteur SQLite',
        subtitle:
          language === 'ar'
            ? 'استمرارية العمل في القاعات المعزولة دون فقدان أي بيانات'
            : language === 'en'
            ? 'Continuous classroom roll calls in dead zones with atomic sync'
            : 'Continuité pédagogique en zone blanche avec réconciliation automatique',
        content:
          language === 'ar'
            ? [
                'قاعدة بيانات SQLite محلية: في حال انقطاع الشبكة، تسجل الهواتف وحواسيب الإدارة الحضور محلياً دون أي توقف أو رسائل خطأ.',
                'رتل المزامنة الآمن (sync_queue): تُحفظ العمليات في طابور محمي من التلف حتى عودة الاتصال.',
                'المزامنة التلقائية: بمجرد التقاط إشارة Wi-Fi أو بيانات الهاتف، يرسل التطبيق السجلات دفعة واحدة لقاعدة البيانات السحابية المركزية.',
              ]
            : language === 'en'
            ? [
                'Local SQLite Storage: When internet connectivity drops, mobile and desktop clients record attendance locally without disruption.',
                'Transactional Queue: Mutations are validated and stored in SQLite sync_queue tables preventing database lockouts.',
                'Automatic Reconnection: Once connectivity is restored, records stream to Supabase with zero duplicate entries.',
              ]
            : [
                'Base Locale SQLite : En cas de coupure réseau dans les ateliers ou amphithéâtres, l’application continue d’enregistrer les présences sans interruption.',
                'File de Synchronisation Sécurisée : Les pointages sont empilés dans une table transactionnelle locale (sync_queue) avec horodatage immuable.',
                'Réconciliation Automatique : Dès le retour de la connexion Wi-Fi ou 4G, les données sont envoyées par lots vers la base Supabase centrale.',
              ],
      },
      {
        id: 'shortcuts',
        category: 'ERGONOMIE',
        title:
          language === 'ar'
            ? '7. اختصارات لوحة المفاتيح واللغات'
            : language === 'en'
            ? '7. Keyboard Shortcuts & Trilingual Layout'
            : '7. Raccourcis Clavier & Ergonomie Trilingue',
        subtitle:
          language === 'ar'
            ? 'سرعة التنقل ودعم كامل للعربية والفرنسية والإنجليزية'
            : language === 'en'
            ? 'Fast navigation shortcuts with full Arabic RTL support'
            : 'Navigation rapide et interface native en Français, Arabe et Anglais',
        content:
          language === 'ar'
            ? [
                'Ctrl + K: فتح لوحة الأوامر السريعة للبحث الفوري عن متربص، حصة، أو فتح شاشة جديدة.',
                'F1: فتح هذا الدليل الإرشادي في أي وقت ومن أي شاشة.',
                'الوضع الفاتح / الداكن: زر التبديل السريع بأعلى الشاشة يتيح اختيار النمط المريح للعين.',
                'دعم اللغة العربية: واجهة كاملة من اليمين إلى اليسار (RTL) متوافقة مع المصطلحات الإدارية الرسمية.',
              ]
            : language === 'en'
            ? [
                'Ctrl + K: Universal command palette for rapid searches across students, sessions, or actions.',
                'F1: Open this System Guide and User Manual instantly from any screen.',
                'Theme Toggle: One-click switcher between High-Contrast Dark Mode and Administrative Light Mode.',
                'Arabic RTL: Complete native right-to-left layout adhering to Algerian official administrative standards.',
              ]
            : [
                'Ctrl + K : Palette de commandes universelle pour rechercher instantanément un stagiaire, une section ou une action.',
                'F1 : Consulter le présent guide et manuel d’utilisation à tout moment.',
                'Bascule Thème Sombre / Clair : Adapté aux conditions d’éclairage des bureaux et salles de serveurs.',
                'Trilingue & RTL : Support complet du Français, de l’Arabe (alignement RTL intégral) et de l’Anglais.',
              ],
      },
      {
        id: 'credentials',
        category: 'SUPPORT',
        title:
          language === 'ar'
            ? '8. الحسابات الافتراضية والدعم التقني'
            : language === 'en'
            ? '8. Default Credentials & Technical Support'
            : '8. Identifiants de Connexion & Support Pédagogique',
        subtitle:
          language === 'ar'
            ? 'بيانات الدخول التجريبية والتواصل مع مصلحة التمدرس'
            : language === 'en'
            ? 'Default accounts and academic registry contacts'
            : 'Comptes de test préconfigurés et contacts scolarité',
        content:
          language === 'ar'
            ? [
                'حساب الإدارة: admin@insfp.dz / كلمة المرور: Password123!',
                'حساب متربص تجريبي 1: etudiant1@insfp.dz / كلمة المرور: Password123! (رقم القيد: 2024-DEV-001)',
                'حساب أستاذ تجريبي: enseignant@insfp.dz / كلمة المرور: Password123!',
                'المكتب الميداني: مصلحة التمدرس والتكوين المتواصل، المعهد الوطني المتخصص أولاد فايت، الجزائر.',
              ]
            : language === 'en'
            ? [
                'Administration Portal: admin@insfp.dz / Password: Password123!',
                'Demo Trainee Account 1: etudiant1@insfp.dz / Password: Password123! (Matricule: 2024-DEV-001)',
                'Demo Instructor Account: enseignant@insfp.dz / Password: Password123!',
                'Campus Support: Direction des Études et Scolarité, INSFP Ouled Fayet, Algiers.',
              ]
            : [
                'Portail Administration : admin@insfp.dz / Mot de passe : Password123!',
                'Compte Stagiaire Test 1 : etudiant1@insfp.dz / Mot de passe : Password123! (Matricule : 2024-DEV-001)',
                'Compte Formateur Test : enseignant@insfp.dz / Mot de passe : Password123!',
                'Support Pédagogique : Direction des Études & Bureau de l’Assiduité, INSFP Ouled Fayet, Alger.',
              ],
      },
    ],
    [language]
  );

  const filteredGuideTopics = useMemo(() => {
    return guideTopics.filter((topic) => {
      const matchesCategory =
        selectedGuideCategory === 'ALL' || topic.category === selectedGuideCategory;
      const q = guideSearchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;
      const matchesQuery =
        topic.title.toLowerCase().includes(q) ||
        topic.subtitle.toLowerCase().includes(q) ||
        topic.content.some((c) => c.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [guideTopics, selectedGuideCategory, guideSearchQuery]);

  if (!isOpen) return null;

  const policy = evaluatePasswordPolicy(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const toggleOptionalModules = (val: boolean) => {
    setShowOptionalModules(val);
    try {
      localStorage.setItem('assiduo_show_optional_modules', String(val));
      window.dispatchEvent(new Event('assiduo_settings_changed'));
    } catch {
      // ignore
    }
  };

  const toggleSidebarCollapsed = (val: boolean) => {
    setIsSidebarCollapsed(val);
    try {
      localStorage.setItem('assiduo_sidebar_collapsed', String(val));
      window.dispatchEvent(new Event('assiduo_settings_changed'));
    } catch {
      // ignore
    }
  };

  const toggleAudio = (val: boolean) => {
    setIsAudioEnabled(val);
    sound.setEnabled(val);
    if (val) {
      sound.playSuccess();
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!passwordsMatch) {
      setStatusMessage({
        type: 'error',
        text: 'Les deux mots de passe ne correspondent pas.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullValidation = await validatePasswordFull(newPassword);
      if (!fullValidation.valid) {
        setStatusMessage({
          type: 'error',
          text: fullValidation.reason || 'Mot de passe non conforme.',
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setStatusMessage({
        type: 'success',
        text: 'Mot de passe mis à jour avec succès.',
      });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Échec de la mise à jour du mot de passe.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <SpotlightCard
        spotlightColor="rgba(59, 130, 246, 0.16)"
        className={`bg-slate-900 border border-slate-800 rounded-2xl w-full ${
          activeTab === 'GUIDE' ? 'max-w-4xl' : 'max-w-lg'
        } overflow-hidden shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              {activeTab === 'SECURITY' ? (
                <Shield className="w-5 h-5" />
              ) : activeTab === 'MODULES' ? (
                <SlidersHorizontal className="w-5 h-5" />
              ) : (
                <BookOpen className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <ShinyText
                text={
                  activeTab === 'SECURITY'
                    ? 'Sécurité & Authentification'
                    : activeTab === 'MODULES'
                    ? "Préférences d'Affichage & Modules"
                    : language === 'ar'
                    ? 'دليل الاستخدام والتشغيل البيداغوجي'
                    : language === 'en'
                    ? 'System User Guide & Regulatory Manual'
                    : 'Guide d’Utilisation & Manuel Réglementaire'
                }
                speed={5}
                className="font-semibold text-slate-100"
              />
              <p className="text-xs text-slate-400">
                {activeTab === 'GUIDE'
                  ? language === 'ar'
                    ? 'المعهد الوطني المتخصص في التكوين المهني • أولاد فايت'
                    : 'INSFP Ouled Fayet • Direction des Études & Scolarité'
                  : userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-4 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('SECURITY');
            }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'SECURITY'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              {language === 'ar'
                ? 'أمان الحساب'
                : language === 'en'
                ? 'Account Security'
                : 'Sécurité du Compte'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('MODULES');
            }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'MODULES'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {language === 'ar'
                ? 'الوحدات والعرض'
                : language === 'en'
                ? 'Modules & Display'
                : 'Modules & Affichage'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('GUIDE');
            }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'GUIDE'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {language === 'ar'
                ? 'دليل الاستخدام (F1)'
                : language === 'en'
                ? 'System Guide (F1)'
                : 'Guide d’Utilisation (F1)'}
            </span>
          </button>
        </div>

        {/* Content Tab: SECURITY */}
        {activeTab === 'SECURITY' ? (
          <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Au moins 10 caractères..."
                  className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checklist des exigences */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Règles de conformité
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`flex items-center gap-1.5 ${
                    policy.isLengthValid ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {policy.isLengthValid ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Min. 10 caractères</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    policy.hasUpperCase ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {policy.hasUpperCase ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>1 majuscule (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    policy.hasLowerCase ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {policy.hasLowerCase ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>1 minuscule (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    policy.hasNumber ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {policy.hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>1 chiffre (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    policy.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {policy.hasSpecialChar ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>1 symbole (!@#$%)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    policy.isNotTrivial ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {policy.isNotTrivial ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Non prévisible</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <Magnet padding={10} magnetStrength={0.15} className="flex-1">
                <button
                  type="submit"
                  disabled={!policy.valid || !passwordsMatch || isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validation...</span>
                    </>
                  ) : (
                    <span>Mettre à jour</span>
                  )}
                </button>
              </Magnet>
            </div>
          </form>
        ) : (
          /* Content Tab: MODULES & PREFERENCES */
          <div className="p-6 space-y-5">
            {/* Theme Mode Preference */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'المظهر العام' : language === 'en' ? 'Interface Theme' : 'Thème Visuel'}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'التبديل بين الوضع الداكن والوضع الفاتح'
                    : language === 'en'
                    ? 'Switch between Dark and Light mode'
                    : 'Alterner entre Mode Sombre institutionnel et Mode Clair'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTheme('dark');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('themeDark')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setTheme('light');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    theme === 'light'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('themeLight')}</span>
                </button>
              </div>
            </div>

            {/* Language Preference */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('language')}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'اللغة الرسمية لواجهة التطبيق'
                    : language === 'en'
                    ? 'Official portal display language'
                    : 'Langue officielle d\'affichage du portail'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setLanguage('fr');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                    language === 'fr'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Français
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setLanguage('ar');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors font-sans ${
                    language === 'ar'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setLanguage('en');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                    language === 'en'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Toggle Modules Optionnels */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Modules Campus (Optionnels)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Afficher ou masquer les trois modules institutionnels avancés
                  </p>
                </div>
                <button
                  onClick={() => toggleOptionalModules(!showOptionalModules)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    showOptionalModules
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {showOptionalModules ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showOptionalModules ? 'Actifs' : 'Masqués'}</span>
                </button>
              </div>

              {/* Sub-modules list */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs py-1 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Scan className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Guichet d'Émargement Direct (douchette & caméra)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-mono">Inclus</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 text-slate-300">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Analytique Prédictive & Décrochage</span>
                  </div>
                  <span className="text-[10px] text-indigo-400/80 font-mono">Inclus</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Journal d'Audit & Traçabilité (Décret 18-162)</span>
                  </div>
                  <span className="text-[10px] text-blue-400/80 font-mono">Inclus</span>
                </div>
              </div>
            </div>

            {/* Sidebar Compact Mode */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Disposition de la Barre Latérale
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Alterner entre mode complet (256px) et rail compact (80px)
                </p>
              </div>
              <button
                onClick={() => toggleSidebarCollapsed(!isSidebarCollapsed)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isSidebarCollapsed
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelLeft className="w-3.5 h-3.5" />
                )}
                <span>{isSidebarCollapsed ? 'Compact' : 'Étendu'}</span>
              </button>
            </div>

            {/* Audio Signals */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Signaux Sonores de Pointage
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tonalités sonores Web Audio lors des scans de badges
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sound.playSuccess()}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Tester
                </button>
                <button
                  onClick={() => toggleAudio(!isAudioEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isAudioEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isAudioEnabled ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span>{isAudioEnabled ? 'Actifs' : 'Muets'}</span>
                </button>
              </div>
            </div>

            {/* Quick Access to System Guide */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>
                    {language === 'ar'
                      ? 'دليل الاستخدام والتشغيل البيداغوجي'
                      : language === 'en'
                      ? 'System User Guide & Operational Manual'
                      : 'Guide d’Utilisation & Manuel Réglementaire'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'الاطلاع على مسار تسجيل الحضور، عتبات الإقصاء وإجراءات التبرير'
                    : language === 'en'
                    ? 'Review roll call procedures, absence sanction thresholds, and sync workflow'
                    : 'Consulter les procédures de pointage, seuils d’exclusion et synchronisation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('GUIDE');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'فتح الدليل' : language === 'en' ? 'Open Guide' : 'Ouvrir le guide'}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Fermer les paramètres
              </button>
            </div>
          </div>
        )}

        {/* Content Tab: GUIDE */}
        {activeTab === 'GUIDE' && (
          <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
            {/* Guide Filter & Print Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={guideSearchQuery}
                  onChange={(e) => setGuideSearchQuery(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'ابحث في الدليل (رمز QR، الغيابات، الإقصاء، التبرير، البطاقات...)'
                      : language === 'en'
                      ? 'Search the guide (QR code, absences, exclusion, certificates...)'
                      : 'Rechercher dans le guide (QR code, absences, exclusion, justificatifs...)'
                  }
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    window.print();
                  }}
                  title="Imprimer ce manuel d'utilisation"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer no-print"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">
                    {language === 'ar' ? 'طباعة' : language === 'en' ? 'Print' : 'Imprimer'}
                  </span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-medium no-scrollbar shrink-0">
              {[
                { id: 'ALL', label: language === 'ar' ? 'الكل' : language === 'en' ? 'All' : 'Tous les sujets' },
                { id: 'ARCHITECTURE', label: language === 'ar' ? 'الأدوار' : language === 'en' ? 'Roles' : 'Rôles & Plateformes' },
                { id: 'POINTAGE', label: language === 'ar' ? 'رمز QR' : language === 'en' ? 'QR Code' : 'Pointage QR' },
                { id: 'REGLEMENTATION', label: language === 'ar' ? 'العقوبات' : language === 'en' ? 'Regulations' : 'Seuils & Sanctions' },
                { id: 'JUSTIFICATIFS', label: language === 'ar' ? 'التبريرات' : language === 'en' ? 'Certificates' : 'Justificatifs' },
                { id: 'EDITION', label: language === 'ar' ? 'البطاقات' : language === 'en' ? 'Badges' : 'Badges & Registres' },
                { id: 'HORS_LIGNE', label: language === 'ar' ? 'دون إنترنت' : language === 'en' ? 'Offline' : 'Hors-Ligne SQLite' },
                { id: 'ERGONOMIE', label: language === 'ar' ? 'الاختصارات' : language === 'en' ? 'Shortcuts' : 'Raccourcis' },
                { id: 'SUPPORT', label: language === 'ar' ? 'الحسابات' : language === 'en' ? 'Support' : 'Comptes & Support' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedGuideCategory(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                    selectedGuideCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Guide Topics Cards */}
            <div className="space-y-3 pt-1">
              {filteredGuideTopics.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                  <p className="text-xs">
                    {language === 'ar'
                      ? 'لا توجد نتائج تطابق بحثك في الدليل.'
                      : language === 'en'
                      ? 'No topics matched your search query in the manual.'
                      : 'Aucun sujet ne correspond à votre recherche dans le manuel.'}
                  </p>
                </div>
              ) : (
                filteredGuideTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-wide">
                          {topic.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {topic.subtitle}
                        </p>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
                        {topic.category}
                      </span>
                    </div>

                    <ul className="space-y-1.5 pt-1 text-xs text-slate-300">
                      {topic.content.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800 shrink-0">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {language === 'ar'
                    ? 'يمكنك فتح هذا الدليل دائماً بالضغط على مفتاح F1'
                    : language === 'en'
                    ? 'You can reopen this guide anytime by pressing F1'
                    : 'Vous pouvez rouvrir ce guide à tout moment via la touche F1'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق الدليل' : language === 'en' ? 'Close Guide' : 'Fermer le guide'}
              </button>
            </div>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
};
