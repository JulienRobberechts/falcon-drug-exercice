import { Drug, Pharmacy } from "../pharmacy";

describe("Pharmacy (smoke test)", () => {
  it("decreases benefit and expiresIn of a generic drug by 1 per day", () => {
    expect(new Pharmacy([new Drug("test", 2, 3)]).updateBenefitValue()).toEqual(
      [new Drug("test", 1, 2)],
    );
  });
});
