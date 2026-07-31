import { getBenefitDeltaBeforeExpiry } from "../pharmacy";

describe("getBenefitDeltaBeforeExpiry (pure function)", () => {
  it("returns the constant delta when the rule value is a number", () => {
    const rule = { benefitDeltaBeforeExpiry: -1 };
    expect(getBenefitDeltaBeforeExpiry(rule, 5)).toBe(-1);
  });

  it("calls the rule function with expiresIn and returns its result", () => {
    const rule = { benefitDeltaBeforeExpiry: (expiresIn) => expiresIn * 2 };
    expect(getBenefitDeltaBeforeExpiry(rule, 7)).toBe(14);
  });

  it("is deterministic: same inputs always produce the same output", () => {
    const rule = { benefitDeltaBeforeExpiry: (expiresIn) => (expiresIn <= 5 ? 3 : 1) };
    expect(getBenefitDeltaBeforeExpiry(rule, 5)).toBe(
      getBenefitDeltaBeforeExpiry(rule, 5),
    );
  });
});
