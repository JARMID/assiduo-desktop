# Assiduo Admin Portal (Version Flutter Historique)

Cette branche conserve l'implémentation historique du portail administratif INSFP développé avec le framework **Flutter**.

## Contexte Historique

Cette version constituait la première itération native du panneau d'administration pour la gestion des présences et des flux scolaires à l'INSFP Ouled Fayet.

Pour des performances accrues, une consommation mémoire réduite et une intégration native au système d'exploitation Windows, le projet a évolué vers la pile **React 19 + Tauri v2** présente sur la branche `main`.

## Contenu de cette Branche

- **`lib/`**: Code source Dart de l'application Flutter.
  - `features/auth/`: Écran de connexion et dialogue de téléchargement des applications.
  - `features/dashboard/`: Vues de gestion (classes, alertes, justifications, sessions, spécialités, stagiaires, formateurs).
  - `features/v2_admin/`: Écrans de messagerie, conversations et notifications.
  - `core/`: Modèles de données, services Supabase et composants graphiques.
- **`windows/`**, **`linux/`**, **`macos/`**, **`web/`**, **`android/`**: Couches d'hébergement multiplateformes Flutter.
- **`pubspec.yaml`**: Déclaration des dépendances Flutter et polices de caractères.

## Branches Associées

- **`main`**: Version moderne de production en React 19 + Tauri v2.
- **`backup`**: Miroir de sauvegarde de la version actuelle.
- **`flutter-version`**: Cette branche (archive historique du code Flutter).
