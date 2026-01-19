# 🎙️ Scénario de Démo - Soutenance TeamFlow

**Durée estimée :** 5-7 minutes
**Objectif :** Montrer la fluidité, le temps réel et la robustesse technique.

## 1. Introduction & Setup (1 min)

*   **Action :** Avoir deux fenêtres de navigateur ouvertes côte à côte (ex: Chrome à gauche, Edge ou Navigation Privée à droite).
*   **Contexte :** "Bonjour, je vais vous présenter TeamFlow, une plateforme collaborative temps réel. Pour cette démo, je simule deux utilisateurs connectés simultanément."
*   **Action :**
    *   **Gauche (Chrome) :** Connectez-vous avec un compte existant (ex: `admin`).
    *   **Droite (Edge) :** Créez un nouveau compte (ex: `membre`) devant le jury pour montrer la rapidité du flux d'inscription.

## 2. Création de Projet & Tâches (1 min)

*   **Action (Gauche - Admin) :** 
    *   Allez sur la page "Projects".
    *   Si vide, cliquez sur "Create Demo Project".
    *   Entrez dans le projet.
*   **Discours :** "L'interface est construite avec React et Tailwind pour un rendu moderne style 'Linear'. Regardez la fluidité de la navigation (React Router)."
*   **Action (Gauche) :** Créez une tâche dans la colonne "TO DO".
    *   Titre : *"Préparer la soutenance"*
    *   Priorité : *HIGH* (Rouge)
*   **Point Technique :** "Dès la création, la tâche est persistée en base de données MongoDB."

## 3. Le "Wow Effect" : Temps Réel (2 min)

*   **Action :** Assurez-vous que les deux fenêtres affichent le même tableau Kanban.
*   **Action (Droite - Membre) :** Vous voyez la tâche apparaître *automatiquement* (grâce au Socket).
*   **Action Clé (Gauche) :** "Regardez bien l'écran de droite."
    *   Prenez la carte "Préparer la soutenance" à gauche.
    *   Déplacez-la vers la colonne "IN PROGRESS".
    *   Relâchez.
*   **Observation :** La carte bouge INSTANTANÉMENT à droite.
*   **Discours Technique :** "C'est ici que réside la complexité technique. J'utilise des **updates optimistes** : l'interface réagit avant même la confirmation du serveur pour éviter toute latence (Zero Lag), et **Socket.io** synchronise l'état avec les autres clients en millisecondes."

## 4. Collaboration & Assignation (1 min)

*   **Action (Droite - Membre) :** Cliquez sur la tâche pour l'ouvrir.
*   **Action :** Cliquez sur "+" dans les assignés.
*   **Action :** Cherchez et sélectionnez "Admin" (l'autre utilisateur).
*   **Résultat :** L'avatar apparaît sur la carte dans les DEUX fenêtres.
*   **Action :** Changez la description et sauvegardez.
*   **Discours :** "Tout est synchronisé. C'est un vrai outil collaboratif."

## 5. Conclusion Technique (1 min)

*   **Action :** Revenez à l'accueil ou déconnectez-vous.
*   **Discours de fin :** "Pour finir sur la sécurité, notez que je n'utilise pas de localStorage pour les tokens, mais des **Cookies HttpOnly**. Cela rend l'application résistante aux failles XSS, ce qui est crucial pour une application SaaS professionnelle."

---
**💡 Conseils en cas de pépin (Plan B) :**
*   *Si le socket ne marche pas :* Rafraîchissez la page (F5). L'état est toujours sauvegardé en base.
*   *Si le serveur plante :* Montrez le code du `TaskController.js` pour prouver que la logique backend est solide.
