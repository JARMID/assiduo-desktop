import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2, WifiOff, School, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InsfpUser } from '../types';
import { SpotlightCard, ShinyText, Magnet, DecryptedText, AnimatedContent } from './react-bits';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface LoginScreenProps {
  onLoginSuccess: (user: InsfpUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();
  const [email, setEmail] = useState('admin@insfp.dz');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

      if (authError) {
        throw new Error(
          authError.message === 'Invalid login credentials'
            ? language === 'ar'
              ? 'بيانات الاعتماد غير صحيحة. يرجى التحقق من البريد وكلمة المرور.'
              : language === 'en'
              ? 'Invalid credentials. Please verify your email and password.'
              : 'Identifiants incorrects. Vérifiez l’adresse e-mail et le mot de passe.'
            : authError.message
        );
      }

      if (!authData.user) {
        throw new Error(
          language === 'ar'
            ? 'المستخدم غير موجود في قاعدة المصادقة.'
            : language === 'en'
            ? 'User not found in authentication registry.'
            : 'Utilisateur introuvable dans la base d’authentification.'
        );
      }

      // 2. Fetch role and profile from public.insfp_users
      const { data: userData, error: userError } = await supabase
        .from('insfp_users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        // Fallback for primary administrative account
        const fallbackAdmin: InsfpUser = {
          id: authData.user.id,
          email: authData.user.email || 'admin@insfp.dz',
          first_name: 'Directeur',
          last_name: 'Pédagogique',
          role: 'ADMINISTRATION',
          department: 'Direction des Études',
          created_at: new Date().toISOString(),
        };
        onLoginSuccess(fallbackAdmin);
        return;
      }

      onLoginSuccess(userData as InsfpUser);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (
          err.message.toLowerCase().includes('fetch') ||
          err.message.toLowerCase().includes('network') ||
          err.message.toLowerCase().includes('failed host lookup')
        ) {
          setErrorMessage(
            language === 'ar'
              ? 'الخادم السحابي غير متصل. يمكنك استخدام الوضع غير المتصل أدناه لتجربة التطبيق.'
              : language === 'en'
              ? 'Cloud server offline. You can use the offline demo mode below to explore the portal.'
              : 'Serveur cloud indisponible ou hors-ligne. Vous pouvez utiliser le mode démonstration ci-dessous pour explorer l’application.'
          );
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage(
          language === 'ar' ? 'حدث خطأ غير متوقع.' : 'Une erreur imprévue est survenue.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-6 select-none relative">
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.16)"
        className="w-full max-w-md bg-[#111724] border border-[#1f293d] rounded-2xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden"
      >
        {/* Top Controls: Language & Theme */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="flex items-center bg-[#162032] border border-[#24334f] rounded-lg p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                language === 'fr'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-1.5 py-0.5 rounded cursor-pointer font-sans ${
                language === 'ar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              عربية
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
            className="p-1.5 rounded-lg bg-[#162032] border border-[#24334f] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            )}
          </button>
        </div>

        {/* Subtle Decorative Backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Institution Brand */}
        <div className="text-center mb-8 relative mt-2">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-[#223049] bg-[#0A0E17] flex items-center justify-center p-2">
            <img src="/logos/assiduo-icon.png" alt="Assiduo" className="w-full h-full object-contain" />
          </div>
          <ShinyText
            text="ASSIDUO"
            speed={5}
            className="text-2xl font-bold text-white tracking-wider"
          />
          <div className="mt-1">
            <DecryptedText
              text={
                language === 'ar'
                  ? 'المنصة المركزية لتسيير ومتابعة الحضور'
                  : language === 'en'
                  ? 'Central Attendance Governance Platform'
                  : 'Système Central de Présence & Assiduité'
              }
              speed={30}
              maxIterations={12}
              className="text-xs text-slate-400 font-sans"
            />
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182235] border border-[#223049] text-[11px] text-slate-300 font-medium">
            <School className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {language === 'ar'
                ? 'المعهد الوطني أولاد فايت • الإدارة البيداغوجية'
                : language === 'en'
                ? 'INSFP Ouled Fayet • Faculty Administration'
                : 'INSFP Ouled Fayet • Direction & Administration'}
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <AnimatedContent distance={16} duration={0.45} delay={0.05}>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'ar'
                ? 'البريد الإلكتروني المؤسساتي'
                : language === 'en'
                ? 'Institutional Email'
                : 'Identifiant de service (Email)'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@insfp.dz"
                className="w-full bg-[#162032] border border-[#223049] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {language === 'ar'
                ? 'كلمة المرور'
                : language === 'en'
                ? 'Password'
                : 'Mot de passe'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#162032] border border-[#223049] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 rounded bg-[#162032] border-[#223049] text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>
                {language === 'ar'
                  ? 'تذكر هذا الحاسوب'
                  : language === 'en'
                  ? 'Remember this station'
                  : 'Mémoriser ce poste'}
              </span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Port 5173</span>
          </div>

          <Magnet padding={20} magnetStrength={0.15} className="w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {language === 'ar'
                      ? 'جارٍ تسجيل الدخول...'
                      : language === 'en'
                      ? 'Signing in...'
                      : 'Connexion en cours...'}
                  </span>
                </>
              ) : (
                <span>
                  {language === 'ar'
                    ? 'فتح الجلسة الآمنة'
                    : language === 'en'
                    ? 'Open Secure Session'
                    : 'Ouvrir la session sécurisée'}
                </span>
              )}
            </button>
          </Magnet>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#1f293d]"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'أو' : language === 'en' ? 'or' : 'ou'}
            </span>
            <div className="flex-grow border-t border-[#1f293d]"></div>
          </div>

          <Magnet padding={20} magnetStrength={0.15} className="w-full">
            <button
              type="button"
              onClick={() => {
                const offlineAdmin: InsfpUser = {
                  id: 'admin-offline-001',
                  email: 'admin@insfp.dz',
                  first_name: 'Directeur',
                  last_name: 'Pédagogique',
                  role: 'ADMINISTRATION',
                  department: 'Direction des Études',
                  created_at: new Date().toISOString(),
                };
                onLoginSuccess(offlineAdmin);
              }}
              className="w-full py-2 px-3 bg-[#162032] hover:bg-[#1a263d] text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-[#223049] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'ar'
                  ? 'وضع تجريبي غير متصل (عرض)'
                  : language === 'en'
                  ? 'Offline Institutional Mode (Demo)'
                  : 'Mode Hors-Ligne Institutionnel (Démonstration)'}
              </span>
            </button>
          </Magnet>
          </form>
        </AnimatedContent>

        {/* Institutional Verification Footer */}
        <div className="mt-8 pt-4 border-t border-[#1a2333] text-center text-[11px] text-slate-500">
          {language === 'ar'
            ? 'المعهد الوطني المتخصص في التكوين المهني - أولاد فايت'
            : language === 'en'
            ? 'National Specialized Institute of Vocational Training - Ouled Fayet'
            : 'Institut National Spécialisé de Formation Professionnelle - Ouled Fayet'}
        </div>
      </SpotlightCard>
    </div>
  );
};
