import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Printer, Shield, Smartphone } from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { ShinyText, Magnet, BlurText } from './react-bits';
import { sound } from '../lib/audioFeedback';

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
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateString(
        now.toLocaleDateString('fr-FR', {
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
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: "Tableau de Bord Général",
          subtitle: "Supervision en direct de l'assiduité et des flux de formation",
        };
      case 'trainees':
        return {
          title: 'Répertoire des Stagiaires',
          subtitle: 'Fiches administratives, matricules et suivi de présence individuelle',
        };
      case 'instructors':
        return {
          title: 'Corps Enseignant',
          subtitle: 'Formateurs, affectations modulaires et suivi des vacations',
        };
      case 'classes':
        return {
          title: 'Promotions et Sections',
          subtitle: 'Organisation des filières, semestres et effectifs inscrits',
        };
      case 'specialities':
        return {
          title: 'Filières et Spécialités Pédagogiques',
          subtitle: 'Programmes officiels du ministère, diplômes d État et capacités d accueil',
        };
      case 'sessions':
        return {
          title: 'Séances et Feuilles d Émargement',
          subtitle: 'Créneaux horaires officiels et contrôle de présence en temps réel',
        };
      case 'justifications':
        return {
          title: 'Justificatifs d Absence et Audit IA',
          subtitle: 'Validation médicale assistée par vision artificielle NVIDIA NIM',
        };
      case 'alerts':
        return {
          title: 'Alertes Réglementaires et Risque d Abandon',
          subtitle: 'Seuils des 3 séances, 10 heures et palier des 25% d exclusion',
        };
      case 'messages':
        return {
          title: 'Messagerie et Échanges Pédagogiques',
          subtitle: 'Communications officielles directes avec les stagiaires et formateurs',
        };
      case 'notifications':
        return {
          title: 'Communications et Alertes Système',
          subtitle: 'Diffusion d annonces institutionnelles et traitement des mots de passe',
        };
      case 'reports':
        return {
          title: 'Registres Pédagogiques et Feuilles d Examen',
          subtitle: 'Génération et impression des états officiels conformes au ministère',
        };
      case 'scanner':
        return {
          title: "Guichet d'Émargement Direct & Scan de Badges",
          subtitle: "Pointage physique par douchette USB, webcam et émargement instantané au guichet",
        };
      case 'analytics':
        return {
          title: "Analytique Prédictive & Prévention du Décrochage",
          subtitle: "Profils hebdomadaires (Dimanche-Jeudi), créneaux sensibles et cohortes à risque",
        };
      case 'audit':
        return {
          title: "Journal d'Audit & Traçabilité Réglementaire",
          subtitle: "Registre cryptographique infalsifiable conforme au décret exécutif 18-162 et ISO 27001",
        };
      default:
        return { title: 'Administration INSFP', subtitle: 'Portail de gestion' };
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
          key={currentTab}
          text={subtitle}
          className="text-xs text-slate-400 mt-0.5"
          delay={30}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Sync Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#141d2e] border border-[#202d45] rounded-lg text-[10px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Synchronisé</span>
        </div>

        {/* Command Palette Trigger */}
        <Magnet padding={15} magnetStrength={0.15}>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCommandPalette?.();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#182235] hover:bg-[#202d45] border border-[#223049] hover:border-slate-500 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer w-60 justify-between"
            title="Ouvrir la palette de commandes (Ctrl + K)"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Recherche rapide...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#101726] border border-[#263756] text-[10px] font-mono text-emerald-400 shrink-0">
              Ctrl K
            </kbd>
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
