import { Drug, Pharmacy, DRUG_NAMES } from "../pharmacy";

const update = (drug, times = 1) => {
  const pharmacy = new Pharmacy([drug]);
  for (let i = 0; i < times; i++) {
    pharmacy.updateBenefitValue();
  }
  return drug;
};

describe("Pharmacy (règles métier par drogue et cas limites)", () => {
  describe("Drogue normale : Doliprane", () => {
    it("diminue expiresIn et benefit de 1 chacun par jour avant expiration", () => {
      const drug = update(new Drug("Doliprane", 10, 20));
      expect(drug).toEqual(new Drug("Doliprane", 9, 19));
    });

    it("dégrade le benefit 2x plus vite une fois expirée", () => {
      const drug = update(new Drug("Doliprane", 0, 10));
      expect(drug.benefit).toBe(8);
    });

    it("ne descend jamais sous 0", () => {
      const drug = update(new Drug("Doliprane", 5, 0));
      expect(drug.benefit).toBe(0);
    });
  });

  describe("Herbal Tea", () => {
    it("le benefit augmente avec l'âge", () => {
      const drug = update(new Drug(DRUG_NAMES.HERBAL_TEA, 5, 10));
      expect(drug).toEqual(new Drug(DRUG_NAMES.HERBAL_TEA, 4, 11));
    });

    it("le benefit augmente 2x plus vite une fois expirée", () => {
      const drug = update(new Drug(DRUG_NAMES.HERBAL_TEA, -1, 10));
      expect(drug.benefit).toBe(12);
    });

    it("le benefit ne dépasse jamais 50, même expirée", () => {
      const drug = update(new Drug(DRUG_NAMES.HERBAL_TEA, -5, 49));
      expect(drug.benefit).toBe(50);
    });
  });

  describe("Fervex", () => {
    it("le benefit augmente de 1 quand expiresIn > 10", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 15, 30));
      expect(drug).toEqual(new Drug(DRUG_NAMES.FERVEX, 14, 31));
    });

    it("le benefit augmente de 2 quand expiresIn <= 10", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 10, 30));
      expect(drug.benefit).toBe(32);
    });

    it("le benefit augmente de 3 quand expiresIn <= 5", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 5, 30));
      expect(drug.benefit).toBe(33);
    });

    it("le benefit tombe à 0 dès que la drogue est expirée", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 0, 30));
      expect(drug.benefit).toBe(0);
    });

    it("le benefit ne dépasse jamais 50", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 3, 48));
      expect(drug.benefit).toBe(50);
    });
  });

  describe("Magic Pill", () => {
    it("expiresIn et benefit restent inchangés après plusieurs jours", () => {
      const drug = update(new Drug(DRUG_NAMES.MAGIC_PILL, 15, 40), 10);
      expect(drug).toEqual(new Drug(DRUG_NAMES.MAGIC_PILL, 15, 40));
    });
  });

  describe("Dafalgan", () => {
    it("diminue expiresIn de 1 et benefit de 2 par jour avant expiration", () => {
      const drug = update(new Drug(DRUG_NAMES.DAFALGAN, 10, 20));
      expect(drug).toEqual(new Drug(DRUG_NAMES.DAFALGAN, 9, 18));
    });

    it("dégrade le benefit 2x plus vite une fois expirée (soit -4/jour)", () => {
      const drug = update(new Drug(DRUG_NAMES.DAFALGAN, 0, 10));
      expect(drug.benefit).toBe(6);
    });

    it("ne descend jamais sous 0", () => {
      const drug = update(new Drug(DRUG_NAMES.DAFALGAN, 5, 0));
      expect(drug.benefit).toBe(0);
    });
  });
});
