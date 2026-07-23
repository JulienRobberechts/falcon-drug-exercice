import { Drug, Pharmacy, DRUG_NAMES } from "../pharmacy";

const update = (drug, times = 1) => {
  const pharmacy = new Pharmacy([drug]);
  for (let i = 0; i < times; i++) {
    pharmacy.updateBenefitValue();
  }
  return drug;
};

describe("Pharmacy (per-drug business rules and edge cases)", () => {
  describe("Normal drug: Doliprane", () => {
    it("decreases expiresIn and benefit by 1 each per day before expiration", () => {
      const drug = update(new Drug("Doliprane", 10, 20));
      expect(drug).toEqual(new Drug("Doliprane", 9, 19));
    });

    it("degrades benefit 2x faster once expired", () => {
      const drug = update(new Drug("Doliprane", 0, 10));
      expect(drug.benefit).toBe(8);
    });

    it("never goes below 0", () => {
      const drug = update(new Drug("Doliprane", 5, 0));
      expect(drug.benefit).toBe(0);
    });
  });

  describe("Herbal Tea", () => {
    it("benefit increases with age", () => {
      const drug = update(new Drug(DRUG_NAMES.HERBAL_TEA, 5, 10));
      expect(drug).toEqual(new Drug(DRUG_NAMES.HERBAL_TEA, 4, 11));
    });

    it("benefit increases 2x faster once expired", () => {
      const drug = update(new Drug(DRUG_NAMES.HERBAL_TEA, -1, 10));
      expect(drug.benefit).toBe(12);
    });

    it("benefit never exceeds 50, even when expired", () => {
      const drug = update(new Drug(DRUG_NAMES.HERBAL_TEA, -5, 49));
      expect(drug.benefit).toBe(50);
    });
  });

  describe("Fervex", () => {
    it("benefit increases by 1 when expiresIn > 10", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 15, 30));
      expect(drug).toEqual(new Drug(DRUG_NAMES.FERVEX, 14, 31));
    });

    it("benefit increases by 2 when expiresIn <= 10", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 10, 30));
      expect(drug.benefit).toBe(32);
    });

    it("benefit increases by 3 when expiresIn <= 5", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 5, 30));
      expect(drug.benefit).toBe(33);
    });

    it("benefit drops to 0 as soon as the drug is expired", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 0, 30));
      expect(drug.benefit).toBe(0);
    });

    it("benefit never exceeds 50", () => {
      const drug = update(new Drug(DRUG_NAMES.FERVEX, 3, 48));
      expect(drug.benefit).toBe(50);
    });
  });

  describe("Magic Pill", () => {
    it("expiresIn and benefit stay unchanged after several days", () => {
      const drug = update(new Drug(DRUG_NAMES.MAGIC_PILL, 15, 40), 10);
      expect(drug).toEqual(new Drug(DRUG_NAMES.MAGIC_PILL, 15, 40));
    });
  });

  describe("Dafalgan", () => {
    it("decreases expiresIn by 1 and benefit by 2 per day before expiration", () => {
      const drug = update(new Drug(DRUG_NAMES.DAFALGAN, 10, 20));
      expect(drug).toEqual(new Drug(DRUG_NAMES.DAFALGAN, 9, 18));
    });

    it("degrades benefit 2x faster once expired (i.e. -4/day)", () => {
      const drug = update(new Drug(DRUG_NAMES.DAFALGAN, 0, 10));
      expect(drug.benefit).toBe(6);
    });

    it("never goes below 0", () => {
      const drug = update(new Drug(DRUG_NAMES.DAFALGAN, 5, 0));
      expect(drug.benefit).toBe(0);
    });
  });
});
