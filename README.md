# Assiduo Desktop

Application native administrative de supervision pédagogique et d'émargement pour l'Institut National Spécialisé de la Formation Professionnelle (INSFP) Ouled Fayet.

## Présentation

Assiduo Desktop est une application de bureau haute performance construite avec **React 19**, **Tauri v2** et **Rust**. Elle remplace l'ancienne interface Flutter (`admin_portal`) en apportant une synchronisation en direct avec PostgreSQL/Supabase, un moteur acoustique interactif et une conformité stricte avec les directives du Ministère de la Formation et de l'Enseignement Professionnels (MFEP).

## Fonctionnalités Principales

1. **Tableau de Bord Institutionnel**
   - Indicateurs en temps réel: effectif global, stagiaires présents, absences du jour, séances actives et justificatifs en attente.
   - Calcul automatique du taux de présence moyen et suivi du palier réglementaire des 25%.

2. **Répertoire des Stagiaires & Badges**
   - Fiches individuelles avec matricules, coordonnées, section et historique d'assiduité.
   - Générateur de cartes de stagiaire officielles avec QR Code de pointage imprimable.
   - Importation en masse via fichiers Excel/CSV avec validation préalable des colonnes.
   - Contact pédagogique direct vers la messagerie interne.

3. **Formateurs & Emplois du Temps**
   - Annuaire du corps enseignant avec affectations modulaires et suivi du volume horaire.
   - Planification hebdomadaire des séances de cours, TD et travaux pratiques (TP).

4. **Promotions & Sections Pédagogiques**
   - Organisation des filières selon les semestres d'études (S1 à S5) et les capacités d'accueil.
   - Suivi des effectifs inscrits par groupe.

5. **Filières & Spécialités Homologuées**
   - Répertoire complet des 16 filières officielles de l'institut (Audiovisuel, Montage, Son, Maintenance, Développement).
   - Intitulés bilingues en français et en arabe avec support RTL natif.
   - Formulaire d'enregistrement des nouvelles filières directement synchronisé avec Supabase.

6. **Séances & Feuilles d'Émargement**
   - Contrôle d'appel numérique avec rotation dynamique de jeton QR pour prévenir la fraude.
   - Pointage manuel, par QR Code ou biométrique avec horodatage certifié.
   - Impression des feuilles de présence officielles pour archivage papier.

7. **Justificatifs d'Absence & Audit Médical**
   - Traitement des certificats médicaux et pièces justificatives déposées par les stagiaires.
   - Grille d'évaluation automatisée des critères d'admissibilité (signature, cachet, dates).
   - Décision administrative avec enregistrement des motifs de validation ou de rejet.

8. **Alertes Réglementaires & Prévention d'Abandon**
   - Surveillance automatique des seuils légaux: avertissement à 3 séances, mise en demeure formelle à 10 heures, exclusion modulaire à 25%.
   - Envoi de notifications d'alerte avec normalisation des numéros mobiles algériens (+213).

9. **Messagerie Pédagogique Interne**
   - Canaux de communication bidirectionnels entre l'administration, les stagiaires et les enseignants.
   - Réponses types administratives rapides et suivi du cycle de vie des demandes (Ouvert, Résolu, Clôturé).

10. **Communications & Gestion des Accès**
    - Traitement instantané des demandes de réinitialisation de mot de passe stagiaire (`INSFP-<matricule>`).
    - Diffusion d'annonces officielles ciblées vers les applications mobiles Android.

11. **Distribution des Applications Mobiles**
    - Hub de distribution avec QR Codes générés localement pour le téléchargement direct de `student_app.apk` et `presence_insfp.apk`.

12. **Registres & Procès-Verbaux d'Examen**
    - Génération des registres officiels de scolarité conformes aux normes ministérielles et au Décret Exécutif n° 18-162.

## Pile Technologique

- **Framework Bureau:** Tauri v2.12 (Rust)
- **Interface Utilisateur:** React 19.2, TypeScript 6.0, Vite 8.3, Tailwind CSS v4
- **Base de Données:** Supabase (PostgreSQL 15, Row Level Security, Realtime channels)
- **Composants & Animations:** Lucide React, GSAP 3.15, Lenis Scroll
- **Moteur Audio:** Synthèse Web Audio API sans fichiers audio externes
- **Outils Qualité:** Oxlint, Vitest

## Installation & Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement (Tauri dev)
npm run dev

# Vérification du typage TypeScript
npx tsc --noEmit

# Analyse de code (Linter)
npx oxlint

# Exécuter les tests unitaires
npm test

# Compilation de l'exécutable autonome Windows
npx tauri build --no-bundle
```

L'exécutable compilé est généré à l'emplacement suivant:
`src-tauri/target/release/app.exe`

## Structure des Branches Git

- `main`: Version moderne de référence (React 19 + Tauri v2).
- `backup`: Miroir de sauvegarde de la branche principale.
- `flutter-version`: Historique de l'ancienne version Flutter (`admin_portal`).
