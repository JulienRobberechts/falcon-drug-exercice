[![CI](https://github.com/JulienRobberechts/falcon-drug-exercice/actions/workflows/ci.yml/badge.svg)](https://github.com/JulienRobberechts/falcon-drug-exercice/actions/workflows/ci.yml)

## Notes - Julien

Transparence sur l'usage de l'IA : ce travail a été réalisé avec l'aide de Claude Code, utilisé comme je le ferais en situation réelle.

- Le plan de refactoring a été proposé par Claude, puis revu et ajusté par mes soins avant l'implémentation.
- L'implémentation a été en grande partie générée par Claude, sous ma supervision : chaque étape a été validée par les tests de régression et relue avant commit.
- Je maîtrise l'ensemble des choix techniques (documentés dans les ADR) et serai ravi de les défendre et d'en discuter lors d'un échange.

Démarche suivie :

- **Sécurisation** : suite de tests de régression avant tout refactoring (baseline générée depuis `output.json` + cas limites des règles métier).
- **Refactoring incrémental** : extraction de handlers par médicament, puis passage à un modèle déclaratif — chaque médicament est décrit par des règles de données (deltas de benefit avant/après expiration, delta d'`expiresIn`) appliquées par une unique méthode `Drug.update()`. L'API publique de `Drug` et `Pharmacy` reste inchangée.
- **Ajout de "Dafalgan"** : se résume à une simple entrée de configuration.

Nouveaux fichiers :

- les fichiers de tests ont été déplacés dans `tests`
- [`docs/refac-steps.md`](docs/refac-steps.md) — plan de refactoring
- `docs/adr/ADR01` à `ADR04` — décisions de design pour historique.

Merci beaucoup aux développeurs et développeuses qui prendront le temps de relire ce travail — bonne lecture, et n'hésitez pas à me faire part de vos retours !

# Take-Home Test Specification

You are a new developer in the Falcon team, and your first job is to add a feature to an old existing piece of code.

## System specifications

Hi and welcome to the team. We are in the future, and Falcon has extended its activities by opening a pharmacy. Your task is to add a new feature to our system so that we can begin distributing a new drug. First an introduction to our system:

- All drugs have an `expiresIn` value which denotes the number of days we have until the item expires.
- All drugs have a `benefit` value which denotes how powerful the drug is.
- At the end of each day our system lowers both values for every drug

But there is more:

- Once the expiration date has passed, Benefit degrades twice as fast.
- The Benefit of an item is never negative.
- "Herbal Tea" actually increases in Benefit the older it gets. Benefit increases twice as fast after the expiration date.
- The Benefit of an item is never more than 50.
- "Magic Pill" never expires nor decreases in Benefit.
- "Fervex", like Herbal Tea, increases in Benefit as its expiration date approaches. Benefit increases by 2 when there are 10 days or less and by 3 when there are 5 days or less but Benefit drops to 0 after the expiration date.

We have recently signed a supplier of "Dafalgan". This requires an update to our system:

- "Dafalgan" degrades in Benefit twice as fast as normal drugs.

## Instructions

- [x] Create a clone from this repository
- [ ] Implement the required feature
- [ ] Push the clone to your own repository when satisfied
- [ ] Send us the link and tell us approximatively how much time you spent on this assignment

You are encouraged to refactor the existing code before adding your own, as you would do if this was a real task in real life. We strongly recommend that you write tests to help you during this process.

Feel free to make any changes to the `updateBenefitValue` method implementation and add any new code as long as everything still works correctly. However, do not break the public API of the `Drug` and `Pharmacy` classes, as those are used by other pieces of the software (you can add new methods though).

Please commit as frequently as possible to make the review easier.

We expect you to spend no more than 2 hours on this assignment. We value the quality of the end result, not how much time you have spent on it.

## Test

To make sure that you will not break anything in the existing code, we added the result of the simulation in the _output.json_ file. Make sure that your code is able to generate a file with identical content. You can generate a new file by running the following command:

```sh
yarn start
```
