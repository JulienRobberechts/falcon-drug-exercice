# ADR04 — Pas de polymorphisme par sous-classe (`HerbalTea extends Drug`, etc.)

## Statut

Acceptée

## Contexte

Suite à [[ADR03]], le comportement par drogue est piloté par une table
`DRUG_RULES` (map `name -> { getBenefitDelta, expiresInDelta, onExpired }`)
consommée par une méthode unique `Drug.update()`. Une alternative orientée
objet a été envisagée : une sous-classe par comportement (`HerbalTea extends
Drug`, `Fervex extends Drug`, `MagicPill extends Drug`), chacune redéfinissant
`update()`.

Contrainte du README : ne pas casser l'API publique de `Drug` — en
particulier `new Drug(name, expiresIn, benefit)`, utilisé tel quel dans
`index.js`, `output.json`/tests de régression ([[ADR01]]) et tous les tests
unitaires ([[ADR02]]).

## Décision

Ne pas introduire de hiérarchie de sous-classes. Garder une seule classe
`Drug`, dont le comportement au moment de `update()` est résolu via
`DRUG_RULES[this.name]`.

Raisons :

- Le discriminant reste `name`, une simple chaîne fournie au constructeur
  existant. Avec des sous-classes, il faudrait soit que les appelants
  connaissent et instancient la bonne sous-classe (`new HerbalTea(...)` au
  lieu de `new Drug("Herbal Tea", ...)`, ce qui casse l'API publique), soit
  ajouter une factory (`Drug.create(name, ...)`) qui fait exactement le même
  travail de dispatch nom → comportement que `DRUG_RULES` — sans gain, avec
  une indirection en plus.
- Chaque comportement est une poignée de nombres et de petites fonctions
  pures (`getBenefitDelta`, `expiresInDelta`, `onExpired`), pas un état ou un
  cycle de vie propre à chaque type : ça reste de la donnée de configuration,
  pas une raison suffisante pour une hiérarchie de classes.
- Le polymorphisme par sous-classe change la forme structurelle des
  instances (prototype différent par drogue), ce qui fragilise les
  comparaisons `toEqual(new Drug(...))` utilisées dans [[ADR02]] et le test
  de non-régression ([[ADR01]]), pour un bénéfice nul ici.

## Conséquences

- Ajouter une drogue (Dafalgan, Phase 5) reste : une entrée dans
  `DRUG_RULES`, sans nouvelle classe ni modification de `Drug`/`Pharmacy`.
- `Drug` reste instanciable uniformément (`new Drug(name, expiresIn,
  benefit)`), quel que soit son nom, ce qui préserve l'API publique et les
  tests existants tels quels.
- Si un futur comportement nécessite un état ou une logique propre trop
  complexe pour rester déclarative dans `DRUG_RULES`, cette décision devra
  être révisée.
