import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  evaluatePasswordPolicy,
  validatePasswordFull,
} from '../lib/passwordPolicy';
import { supabase } from '../lib/supabase';
import { SpotlightCard, ShinyText, Magnet } from './react-bits';
import { sound } from '../lib/audioFeedback';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'MODULES'>('SECURITY');
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
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              {activeTab === 'SECURITY' ? (
                <Shield className="w-5 h-5" />
              ) : (
                <SlidersHorizontal className="w-5 h-5" />
              )}
            </div>
            <div>
              <ShinyText
                text={
                  activeTab === 'SECURITY'
                    ? 'Sécurité & Authentification'
                    : "Préférences d'Affichage & Modules"
                }
                speed={5}
                className="font-semibold text-slate-100"
              />
              <p className="text-xs text-slate-400">{userEmail}</p>
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
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'SECURITY'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Sécurité du Compte</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MODULES')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'MODULES'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Modules & Affichage</span>
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
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>Analytique Prédictive & Décrochage</span>
                  </div>
                  <span className="text-[10px] text-purple-400/80 font-mono">Inclus</span>
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
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
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
      </SpotlightCard>
    </div>
  );
};
