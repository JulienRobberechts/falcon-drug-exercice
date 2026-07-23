# ADR03 — Pattern stratégie (map `name -> handler`) pour `updateBenefitValue`

## Statut

Acceptée

## Contexte

`Pharmacy.updateBenefitValue` était une pyramide de `if` imbriqués (jusqu'à 5
niveaux) mélangeant, pour chaque drogue, la sélection de la règle métier et son
application. Le comportement observable est protégé par [[ADR01]] (test de
non-régression sur `output.json`) et [[ADR02]] (tests unitaires par règle),
ce qui permet de refactorer en confiance.

Deux approches ont été envisagées :

1. Garder une seule méthode et aplatir les `if` imbriqués avec des guard
   clauses / early returns.
2. Extraire une fonction de mise à jour par nom de drogue et sélectionner la
   bonne via une map `name -> handler`, avec une fonction par défaut pour les
   drogues "normales" (pattern stratégie).

## Décision

Utiliser un pattern stratégie : une fonction pure par comportement
(`updateNormalDrug`, `updateHerbalTea`, `updateFervex`, `updateMagicPill`),
une map `DRUG_HANDLERS` associant le nom exact de la drogue à sa fonction, et
un fallback sur `updateNormalDrug` pour toute drogue absente de la map
(Doliprane aujourd'hui, Dafalgan à la Phase 5).

Chaque fonction applique sa règle en 2-3 lignes à plat (pas de `if` imbriqué),
avec un helper `clampBenefit` commun pour borner `benefit` entre 0 et 50.

## Conséquences

- Ajouter une nouvelle drogue (Dafalgan, Phase 5) = ajouter une fonction et une
  entrée dans la map, sans toucher aux fonctions existantes.
- Chaque fonction est testable et lisible indépendamment ; les tests de
  [[ADR02]] restent verts sans modification car l'API publique
  (`Drug`, `Pharmacy`, `updateBenefitValue()`) est inchangée.
- Le remplacement des plafonds appliqués pas-à-pas (dans l'ancien code) par un
  clamp unique en fin de fonction est équivalent : les incréments/décréments
  sont monotones par appel, donc `clamp(valeur + somme des deltas)` donne le
  même résultat final que plusieurs bornages successifs.
