# Meal Planner

Planificateur de repas avec gestion de recettes et génération de liste de courses.

## Structure du projet

### Branches
- `main` : Version stable, production
- `develop` : Branche de développement
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `enhancement/*` : Améliorations diverses

### Workflow de développement
1. Créer une branche depuis `develop`
   ```bash
   git checkout develop
   git checkout -b feature/ma-fonctionnalite
   ```

2. Développer la fonctionnalité

3. Commiter les changements
   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalité"
   ```

4. Pousser la branche
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

5. Créer une Pull Request vers `develop`

### Conventions de nommage des commits
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `enhance:` Amélioration
- `docs:` Documentation
- `refactor:` Refactoring
- `style:` Changements de style
- `test:` Tests

## Installation

```bash
git clone https://github.com/remyvin/meal-planner.git
cd meal-planner
npm install
npm run dev
```

## Technologies utilisées
- Next.js
- TypeScript
- Tailwind CSS
- Shadcn/ui

## Fonctionnalités
- Planification des repas
- Gestion des recettes
- Génération de liste de courses
- Export du planning