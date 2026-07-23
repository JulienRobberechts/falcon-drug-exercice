# ADR02 — Tests unitaires par drogue et cas limite avant refactor

## Statut

Acceptée

## Contexte

[[ADR01]] sécurise le comportement global observable (30 jours, 4 drogues) via
`output.json`. Ce filet est volontairement grossier : il compare des séries
complètes et ne dit pas *quelle règle métier* casserait si un test échouait, ni
ne couvre les bornes (`benefit` à 0 ou 50) qui n'apparaissent pas forcément dans
les 30 jours simulés par `index.js`.

Avant de refactorer `updateBenefitValue` (Phase 3), il faut un second filet plus
fin : un test par règle métier, indépendant du contenu figé de `output.json`,
qui documente explicitement le comportement attendu.

## Décision

Écrire des tests unitaires ciblés sur `Pharmacy.updateBenefitValue`, un par règle
métier et cas limite listés dans le README :

- Drogue normale : -1/-1 par jour, `benefit` jamais négatif.
- Drogue normale expirée : dégradation doublée (-2 sur `benefit`).
- Herbal Tea : `benefit` augmente, plafonné à 50, +2/jour après expiration.
- Fervex : +1 normal, +2 si `expiresIn <= 10`, +3 si `expiresIn <= 5`, chute à 0
  dès expiration, plafonné à 50.
- Magic Pill : `expiresIn` et `benefit` inchangés après N appels.
- Cas limites génériques : `benefit` à 0 (plancher) et à 50 (plafond).

Chaque test construit une `Drug` dans l'état voulu (au besoin juste avant la
limite) et vérifie l'état après un ou plusieurs appels à `updateBenefitValue()`,
sans dépendre de `output.json` ni des valeurs initiales de `index.js`.

## Conséquences

- Ces tests servent de spécification exécutable des règles métier : ils doivent
  rester verts après le refactor de la Phase 3 (même comportement, autre
  implémentation).
- Ils sont plus lisibles et plus rapides à déboguer que le test de non-régression
  global : un échec pointe directement vers la règle en cause.
- Duplication volontaire et acceptée avec le filet de la Phase 1 (deux filets
  différents, deux objectifs différents).
