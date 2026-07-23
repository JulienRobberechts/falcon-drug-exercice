import { Drug, Pharmacy, DRUG_NAMES } from "../pharmacy";

import baseline from "../output.json";

const initialDrugs = [
  new Drug("Doliprane", 20, 30),
  new Drug(DRUG_NAMES.HERBAL_TEA, 10, 5),
  new Drug(DRUG_NAMES.FERVEX, 12, 35),
  new Drug(DRUG_NAMES.MAGIC_PILL, 15, 40),
];

describe("Pharmacy (anti-régression pré-refactor sur les 4 drogues existantes)", () => {
  const pharmacy = new Pharmacy(initialDrugs);
  const log = [];
  for (let elapsedDays = 0; elapsedDays < 30; elapsedDays++) {
    log.push(JSON.parse(JSON.stringify(pharmacy.updateBenefitValue())));
  }

  it.each(initialDrugs.map((drug) => drug.name))(
    "%s : historique sur 30 jours identique à la baseline figée dans `output.json`",
    (name) => {
      const actual = log.map((day) => day.find((drug) => drug.name === name));
      const expected = baseline.result.map((day) =>
        day.find((drug) => drug.name === name),
      );

      expect(actual).toEqual(expected);
    },
  );
});
