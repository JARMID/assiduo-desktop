export type Language = 'fr' | 'ar' | 'en';
export type Theme = 'dark' | 'light';

export interface Translations {
  [key: string]: {
    fr: string;
    ar: string;
    en: string;
  };
}

export const translations: Translations = {
  // Application & Header
  appTitle: {
    fr: 'Assiduo - Gestion d\'Assiduité',
    ar: 'منصة أسيدو لإدارة الحضور',
    en: 'Assiduo - Attendance Management',
  },
  institutionName: {
    fr: 'INSFP Ouled Fayet',
    ar: 'المعهد الوطني المتخصص أولاد فايت',
    en: 'INSFP Ouled Fayet',
  },
  institutionSubtitle: {
    fr: 'Direction & Administration Pédagogique',
    ar: 'الإدارة والتسيير البيداغوجي',
    en: 'Academic Direction & Administration',
  },
  searchPlaceholder: {
    fr: 'Rechercher une action, stagiaire, séance... (Ctrl+K)',
    ar: 'ابحث عن إجراء، متربص، حصة... (Ctrl+K)',
    en: 'Search action, student, session... (Ctrl+K)',
  },
  syncStatus: {
    fr: 'Synchronisé',
    ar: 'تمت المزامنة',
    en: 'Synchronized',
  },
  themeLight: {
    fr: 'Mode Clair',
    ar: 'الوضع الفاتح',
    en: 'Light Mode',
  },
  themeDark: {
    fr: 'Mode Sombre',
    ar: 'الوضع الداكن',
    en: 'Dark Mode',
  },
  themeSystem: {
    fr: 'Système',
    ar: 'تلقائي',
    en: 'System',
  },
  language: {
    fr: 'Langue',
    ar: 'اللغة',
    en: 'Language',
  },
  logout: {
    fr: 'Déconnexion',
    ar: 'تسجيل الخروج',
    en: 'Log Out',
  },

  // Navigation Items
  navDashboard: {
    fr: 'Tableau de Bord',
    ar: 'لوحة القيادة',
    en: 'Dashboard',
  },
  navSessions: {
    fr: 'Séances & Émargement',
    ar: 'الحصص وقوائم الحضور',
    en: 'Sessions & Attendance',
  },
  navJustifications: {
    fr: 'Justificatifs Médicaux',
    ar: 'المبررات الطبية',
    en: 'Medical Excuses',
  },
  navTrainees: {
    fr: 'Stagiaires & Effectifs',
    ar: 'المتربصون والتعداد',
    en: 'Students & Records',
  },
  navInstructors: {
    fr: 'Formateurs & Enseignants',
    ar: 'الأساتذة والمكونون',
    en: 'Instructors',
  },
  navSpecialities: {
    fr: 'Filières & Spécialités',
    ar: 'الشعب والتخصصات',
    en: 'Majors & Specialties',
  },
  navClasses: {
    fr: 'Sections & Groupes',
    ar: 'الأقسام والفصول',
    en: 'Classes & Sections',
  },
  navAlertes: {
    fr: 'Alertes Réglementaires',
    ar: 'التنبيهات القانونية',
    en: 'Regulatory Alerts',
  },
  navMessages: {
    fr: 'Messagerie Interne',
    ar: 'الرسائل الداخلية',
    en: 'Internal Messages',
  },
  navReports: {
    fr: 'Registres & Procès-Verbaux',
    ar: 'السجلات والمحاضر الرسمية',
    en: 'Reports & Official Registers',
  },
  navAudit: {
    fr: 'Journal d\'Audit',
    ar: 'سجل التدقيق الأمني',
    en: 'Audit Log',
  },
  navScanner: {
    fr: 'Scanner QR Émargement',
    ar: 'قارئ الرمز السريع للبطاقات',
    en: 'QR Card Scanner',
  },
  navSettings: {
    fr: 'Paramètres & Sécurité',
    ar: 'الإعدادات والأمان',
    en: 'Settings & Security',
  },

  // Common Actions
  actionSave: {
    fr: 'Enregistrer',
    ar: 'حفظ',
    en: 'Save',
  },
  actionCancel: {
    fr: 'Annuler',
    ar: 'إلغاء',
    en: 'Cancel',
  },
  actionClose: {
    fr: 'Fermer',
    ar: 'إغلاق',
    en: 'Close',
  },
  actionConfirm: {
    fr: 'Confirmer',
    ar: 'تأكيد',
    en: 'Confirm',
  },
  actionDelete: {
    fr: 'Supprimer',
    ar: 'حذف',
    en: 'Delete',
  },
  actionEdit: {
    fr: 'Modifier',
    ar: 'تعديل',
    en: 'Edit',
  },
  actionExport: {
    fr: 'Exporter',
    ar: 'تصدير',
    en: 'Export',
  },
  actionImport: {
    fr: 'Importer CSV',
    ar: 'استيراد CSV',
    en: 'Import CSV',
  },
  actionFilter: {
    fr: 'Filtrer',
    ar: 'تصفية',
    en: 'Filter',
  },
  actionSearch: {
    fr: 'Rechercher',
    ar: 'بحث',
    en: 'Search',
  },
  actionRefresh: {
    fr: 'Actualiser',
    ar: 'تحديث',
    en: 'Refresh',
  },
  actionPrint: {
    fr: 'Imprimer',
    ar: 'طباعة',
    en: 'Print',
  },
  actionApprove: {
    fr: 'Approuver',
    ar: 'قبول',
    en: 'Approve',
  },
  actionReject: {
    fr: 'Rejeter',
    ar: 'رفض',
    en: 'Reject',
  },

  // Attendance Statuses
  statusPresent: {
    fr: 'Présent(e)',
    ar: 'حاضر',
    en: 'Present',
  },
  statusAbsent: {
    fr: 'Absent(e)',
    ar: 'غائب',
    en: 'Absent',
  },
  statusLate: {
    fr: 'En Retard',
    ar: 'متأخر',
    en: 'Late',
  },
  statusJustified: {
    fr: 'Justifié(e)',
    ar: 'مبرر',
    en: 'Excused',
  },
  statusPending: {
    fr: 'En attente',
    ar: 'قيد الانتظار',
    en: 'Pending',
  },

  // Time Slots
  slotMorning1: {
    fr: '08:30 - 10:30',
    ar: '08:30 - 10:30',
    en: '08:30 AM - 10:30 AM',
  },
  slotMorning2: {
    fr: '10:45 - 12:45',
    ar: '10:45 - 12:45',
    en: '10:45 AM - 12:45 PM',
  },
  slotAfternoon1: {
    fr: '13:30 - 15:00',
    ar: '13:30 - 15:00',
    en: '01:30 PM - 03:00 PM',
  },
  slotAfternoon2: {
    fr: '15:15 - 17:00',
    ar: '15:15 - 17:00',
    en: '03:15 PM - 05:00 PM',
  },

  // Metrics & Titles
  metricTotalStudents: {
    fr: 'Effectif Total des Stagiaires',
    ar: 'إجمالي تعداد المتربصين',
    en: 'Total Enrolled Students',
  },
  metricActiveSessions: {
    fr: 'Séances Actives en Cours',
    ar: 'الحصص الجارية حالياً',
    en: 'Ongoing Sessions',
  },
  metricPendingJustifs: {
    fr: 'Justificatifs en Attente',
    ar: 'المبررات الطبية المعلقة',
    en: 'Pending Excuses',
  },
  metricAverageAttendance: {
    fr: 'Taux Moyen d\'Assiduité',
    ar: 'معدل الحضور الإجمالي',
    en: 'Average Attendance Rate',
  },
  metricCriticalAlerts: {
    fr: 'Alertes de Risque d\'Abandon',
    ar: 'تنبيهات خطر الانقطاع',
    en: 'Drop-out Risk Alerts',
  },

  // Login Screen
  loginTitle: {
    fr: 'Connexion Direction & Administration',
    ar: 'تسجيل دخول الإدارة والتسيير',
    en: 'Administrative & Faculty Sign In',
  },
  loginSubtitle: {
    fr: 'Plateforme institutionnelle sécurisée de gestion d\'assiduité',
    ar: 'المنصة المؤسساتية الآمنة لمتابعة وضبط الحضور',
    en: 'Secure institutional platform for attendance governance',
  },
  loginEmailLabel: {
    fr: 'Adresse e-mail institutionnelle',
    ar: 'البريد الإلكتروني المؤسساتي',
    en: 'Institutional Email Address',
  },
  loginPasswordLabel: {
    fr: 'Mot de passe sécurisé',
    ar: 'كلمة المرور',
    en: 'Secure Password',
  },
  loginButton: {
    fr: 'Accéder au Portail Administratif',
    ar: 'الدخول إلى البوابة الإدارية',
    en: 'Access Administrative Portal',
  },
  loginDemoNotice: {
    fr: 'Comptes de test disponibles pour démonstration',
    ar: 'حسابات اختبارية متوفرة للعرض التجريبي',
    en: 'Testing accounts available for demonstration',
  },

  // Verification & Regulatory
  regulatoryRepublic: {
    fr: 'RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE',
    ar: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    en: 'PEOPLE\'S DEMOCRATIC REPUBLIC OF ALGERIA',
  },
  regulatoryMinistry: {
    fr: 'Ministère de la Formation et de l\'Enseignement Professionnels',
    ar: 'وزارة التكوين والتعليم المهنيين',
    en: 'Ministry of Vocational Training and Education',
  },
  regulatoryInstitute: {
    fr: 'Institut National Spécialisé de la Formation Professionnelle - Ouled Fayet',
    ar: 'المعهد الوطني المتخصص في التكوين المهني - أولاد فايت',
    en: 'National Specialized Institute of Vocational Training - Ouled Fayet',
  },
  regulatoryDecree: {
    fr: 'Conforme au Décret Exécutif n° 18-162 & Règlement Pédagogique Intérieur',
    ar: 'مطابق للمرسوم التنفيذي رقم 18-162 والنظام الداخلي البيداغوجي',
    en: 'Compliant with Executive Decree No. 18-162 & Academic Bylaws',
  },

  // AI & Medical Verification
  medicalAuditReady: {
    fr: 'Contrôle optique et cachet prêts',
    ar: 'الفحص الآلي للختم والتوقيع جاهز',
    en: 'Optical stamp and signature audit ready',
  },
  medicalAuditAction: {
    fr: 'Lancer l\'audit optique du certificat',
    ar: 'بدء الفحص الآلي للشهادة الطبية',
    en: 'Run optical certificate audit',
  },
  riskAssessmentTitle: {
    fr: 'Évaluation Prédictive du Risque d\'Abandon',
    ar: 'التقييم التنبؤي لاحتمالية الانقطاع',
    en: 'Predictive Drop-out Risk Assessment',
  },
};

export function getTranslation(key: string, lang: Language): string {
  const item = translations[key];
  if (!item) return key;
  return item[lang] || item['fr'] || key;
}
