# Plan — Take-Home Test (Pharmacy)

## 0. Contraintes à respecter (extraites du README)

### Règles métier

- Chaque jour : `expiresIn` -1 et `benefit` -1 (règle par défaut, drogue "normale").
- Une fois expirée (`expiresIn < 0`) : le `benefit` dégrade **2x plus vite**.
- `benefit` jamais négatif, jamais > 50.
- **Herbal Tea** : `benefit` augmente avec l'âge (au lieu de diminuer), 2x plus vite une fois expirée.
- **Magic Pill** : n'expire jamais (`expiresIn` fixe), `benefit` ne bouge jamais.
- **Fervex** : `benefit` augmente à l'approche de l'expiration (+1 base, +1 supplémentaire si `expiresIn <= 10`, +1 supplémentaire si `expiresIn <= 5`, soit +2 et +3 au total) ; tombe à 0 dès que expirée.
- **Dafalgan** (nouveau) : dégrade 2x plus vite qu'une drogue normale → -2/jour avant expiration, -4/jour après expiration (règle "expiré = 2x plus vite" s'applique par-dessus).

### Contraintes techniques

- Ne pas casser l'API publique de `Drug` et `Pharmacy` (signatures de constructeur, propriétés `name`/`expiresIn`/`benefit`, méthode `updateBenefitValue()`). Ajout de nouvelles méthodes autorisé.
- Liberté totale sur l'implémentation interne de `updateBenefitValue`.
- `output.json` doit rester généré à l'identique pour les drogues existantes (Doliprane, Herbal Tea, Fervex, Magic Pill) — ne pas modifier l'ordre ni les valeurs initiales de ces 4 entrées dans `index.js`. Dafalgan doit être **ajoutée**, pas substituée.
- Commits fréquents et atomiques (facilite la review).
- Temps max recommandé : 2h. Indiquer le temps réel passé à la fin.
- Push vers un dépôt perso + partager le lien.

### Questions non résolues

- Aucune ambiguïté bloquante dans les règles ; seul point d'interprétation : Dafalgan expirée dégrade -4/jour (2x la règle "expiré" normale), à confirmer si besoin avec l'équipe Falcon.

---

## Phase 1 — Baseline & garde-fou anti-régression

- [x] Vérifier que `yarn test` et `yarn lint` passent sur le code actuel (déjà confirmé OK).
- [x] Régénérer avec `yarn test` et constater que le fichier `output.json` n'est pas modifié. Cela confirme que le fichier `output.json` est bien aligné avec le code actuel.
- [x] Ajouter des tests de non-régression : un test par drogue existante (Doliprane, Herbal Tea, Fervex, Magic Pill), comparant l'historique complet sur 30 jours au contenu figé de `output.json`. Ce test doit passer **avant** tout refactor. — **ADR01**

## Phase 2 — Tests unitaires complets (avant refactor)

- [x] Ajouter une courte ADR dans `docs/adr/` documentant le choix de faire des tests unitaires sur les cas limites. — **ADR02**
- [x] Écrire des tests ciblés par drogue et cas limite, sur le comportement actuel (pour sécuriser le refactor) :
  - Drogue normale : dégradation -1/-1, jamais négative.
  - Drogue normale expirée : dégradation -2 sur benefit.
  - Herbal Tea : benefit augmente, plafonné à 50, +2 après expiration.
  - Fervex : +1 normal, +2 si `expiresIn <= 10`, +3 si `expiresIn <= 5`, chute à 0 après expiration, plafonné à 50.
  - Magic Pill : `expiresIn` et `benefit` inchangés après N appels.
  - Cas limites : benefit à 0 (ne descend pas sous 0), benefit à 50 (ne monte pas au-dessus).

## Phase 3 — Refactor de `updateBenefitValue`

Objectif : sortir de la pyramide de `if` imbriqués sans changer le comportement observable.

- Utiliser le pattern stratégie par nom de drogue (map `name -> handler`), ou une méthode `updateDrug(drug)` avec des branches à plat (early return / guard clauses) plutôt que des ifs imbriqués.
- [x] Ajouter une courte ADR dans `docs/adr/` documentant le choix d'utiliser le pattern stratégie. — **ADR03**

**Méthodologie :**
- Faire des modifications étape par étape.
- Garder `Drug`/`Pharmacy` avec la même API publique (garantie par les tests).
- Après chaque étape de refactor, relancer `yarn test` (tests Phase 1 + 2 doivent rester verts) et `yarn lint`.
- Commiter souvent.

## Phase 4 — Confirmation des spécifications du Dafalgan

La spec dit :
- For all drugs, at the end of each day our system lowers both values for every drug.
- "Dafalgan" degrades in Benefit twice as fast as normal drugs.

Il n'est pas certain que la base d'un médicament "normal" soit un décrément de 1. Il faudrait le confirmer. Pour l'exercice nous allons assumer cela.

La spec dit également :
- Once the expiration date has passed, Benefit degrades twice as fast.
- "Dafalgan" degrades in Benefit twice as fast as normal drugs.

Est-ce que cela signifie que pour Dafalgan expirée, la dégradation est de -4/jour ?

### Nouvelle spécification (à valider avec le produit)

Interprétation retenue pour l'exercice : la dégradation "2x plus vite" de Dafalgan s'applique sur la base normale (-1/jour), et se cumule avec la règle générale "expiré = 2x plus vite".

| État              | Dégradation `benefit` |
|-------------------|------------------------|
| Avant expiration  | -2/jour                |
| Après expiration  | -4/jour                |
| Plancher          | jamais négatif (min 0) |

À confirmer avec le produit avant mise en prod : cette lecture suppose que les deux règles "2x plus vite" (spécifique Dafalgan + expiration) se multiplient plutôt que de s'exclure.

## Phase 5 — Implémentation de Dafalgan

- [ ] Créer des tests pour Dafalgan qui reprennent les 3 cas (-2/jour avant expiration, -4/jour après, jamais négatif).
- [ ] Implémentation :
  1. Ajouter une instance `new Drug("Dafalgan", ...)` dans `index.js`, **à la fin** du tableau `drugs`, pour ne pas décaler les entrées existantes dans `output.json`.
  2. Ajouter la règle Dafalgan dans la logique refactorée.
  3. Régénérer `output.json` via `yarn start` et vérifier que les 4 premières entrées de chaque jour sont inchangées, seule une 5e entrée (Dafalgan) apparaît.
  4. Modifier les tests pour Dafalgan pour qu'ils aient la même structure que les autres tests.

## Phase 6 — Vérification

1. `yarn lint` et `yarn test` doivent passer sans erreur.
2. `yarn start` régénère `output.json` sans diff sur les drogues existantes.
3. Relecture rapide du diff global (`git diff main`) pour repérer tout changement non intentionnel de l'API publique.

---

## Résumé des risques à surveiller

- Casser l'API publique (`Drug`, `Pharmacy`) par inadvertance en renommant/supprimant des propriétés ou méthodes existantes.
- Modifier l'ordre ou les valeurs initiales des drogues existantes dans `index.js`, ce qui changerait `output.json` au-delà de l'ajout de Dafalgan.
