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
} from 'lucide-react';
import {
  evaluatePasswordPolicy,
  validatePasswordFull,
} from '../lib/passwordPolicy';
import { supabase } from '../lib/supabase';
import { SpotlightCard, ShinyText, Magnet } from './react-bits';

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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const policy = evaluatePasswordPolicy(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

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
      // 1. Full Bank-Grade Policy + HaveIBeenPwned k-anonymity breach check
      const validation = await validatePasswordFull(newPassword);
      if (!validation.valid) {
        setStatusMessage({
          type: 'error',
          text: validation.reason || 'Le mot de passe ne respecte pas les critères.',
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Update password in Supabase Auth
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
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <ShinyText
                text="Sécurité & Mot de Passe"
                speed={5}
                className="font-semibold text-slate-100"
              />
              <p className="text-xs text-slate-400">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password Strength Score Meter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-400">Robustesse de sécurité</span>
              <span
                className={`font-semibold ${
                  policy.score >= 80
                    ? 'text-emerald-400'
                    : policy.score >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {policy.score}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  policy.score >= 80
                    ? 'bg-emerald-500'
                    : policy.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${policy.score}%` }}
              />
            </div>
          </div>

          {/* Criteria Checklist */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              {policy.isLengthValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span
                className={
                  policy.isLengthValid ? 'text-slate-300' : 'text-slate-500'
                }
              >
                Au moins 10 caractères
              </span>
            </div>
            <div className="flex items-center gap-2">
              {policy.hasUpperCase && policy.hasLowerCase ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span
                className={
                  policy.hasUpperCase && policy.hasLowerCase
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }
              >
                Majuscules et minuscules
              </span>
            </div>
            <div className="flex items-center gap-2">
              {policy.hasNumber ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span
                className={policy.hasNumber ? 'text-slate-300' : 'text-slate-500'}
              >
                Au moins un chiffre (0-9)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {policy.hasSpecialChar ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span
                className={
                  policy.hasSpecialChar ? 'text-slate-300' : 'text-slate-500'
                }
              >
                Caractère spécial (!@#$%...)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {policy.isNotTrivial ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span
                className={
                  policy.isNotTrivial ? 'text-slate-300' : 'text-slate-500'
                }
              >
                Aucune séquence prévisible ou triviale
              </span>
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
      </SpotlightCard>
    </div>
  );
};
