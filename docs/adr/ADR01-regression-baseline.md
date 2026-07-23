# ADR01 — Utiliser `output.json` directement comme référence des tests de non-régression

## Statut

Acceptée

## Contexte

Avant de refactorer `updateBenefitValue`, il faut un garde-fou qui prouve que le
comportement observable des 4 drogues existantes (Doliprane, Herbal Tea, Fervex,
Magic Pill) ne change pas.

Deux options ont été envisagées :

1. Copier `output.json` dans une fixture dédiée (ex. `__fixtures__/output.baseline.json`)
   et comparer le résultat de la simulation à cette copie figée.
2. Importer `output.json` directement dans le test et l'utiliser comme référence.

## Décision

Utiliser directement `output.json` comme référence, sans le dupliquer dans une
fixture séparée.

Raisons :

- `output.json` est déjà le contrat figé pour les 4 drogues existantes (contrainte
  du README : il doit être généré à l'identique). Le dupliquer dans une fixture
  crée deux sources de vérité qui peuvent diverger silencieusement si l'une est
  mise à jour sans l'autre.
- `output.json` est régénéré par `yarn start`/`yarn test` (script `index.js`) avec
  exactement la même logique (mêmes drogues initiales, mêmes 30 itérations) que
  celle rejouée dans le test de non-régression : une seule source de données à
  maintenir.
- Moins de fichiers à gérer, diff de PR plus simple à relire.

## Conséquences

- Si `output.json` est un jour modifié à tort (bug de régénération, refactor qui
  change le comportement), le test échoue immédiatement — c'est l'effet recherché.
- Le test dépend d'un fichier généré et versionné plutôt que d'une fixture
  explicitement écrite à la main ; c'est acceptable ici car `output.json` a déjà
  le statut de référence officielle imposé par l'énoncé du test.
