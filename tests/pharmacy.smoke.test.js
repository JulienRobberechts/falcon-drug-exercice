import { Drug, Pharmacy } from "../pharmacy";

describe("Pharmacy (smoke test)", () => {
  it("diminue le benefit et l'expiresIn d'une drogue générique de 1 par jour", () => {
    expect(new Pharmacy([new Drug("test", 2, 3)]).updateBenefitValue()).toEqual(
      [new Drug("test", 1, 2)],
    );
  });
});
