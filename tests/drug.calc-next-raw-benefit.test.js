import { calcNextRawBenefit } from "../pharmacy";

describe("calcNextRawBenefit (pure function)", () => {
  it("applies benefitDeltaBeforeExpiry when not expired", () => {
    const rule = { benefitDeltaAfterExpiry: -2 };
    expect(calcNextRawBenefit(rule, 20, false, -1)).toBe(19);
  });

  it("applies benefitDeltaAfterExpiry when expired and no fixed value is set", () => {
    const rule = { benefitDeltaAfterExpiry: -2 };
    expect(calcNextRawBenefit(rule, 10, true, -1)).toBe(8);
  });

  it("returns the fixed benefitValueAfterExpiry when expired and set", () => {
    const rule = { benefitDeltaAfterExpiry: -2, benefitValueAfterExpiry: 0 };
    expect(calcNextRawBenefit(rule, 30, true, -1)).toBe(0);
  });

  it("ignores benefitValueAfterExpiry when not expired", () => {
    const rule = { benefitDeltaAfterExpiry: -2, benefitValueAfterExpiry: 0 };
    expect(calcNextRawBenefit(rule, 20, false, -1)).toBe(19);
  });

  it("does not clamp the result (clamping is the caller's responsibility)", () => {
    const rule = { benefitDeltaAfterExpiry: -100 };
    expect(calcNextRawBenefit(rule, 10, true, -1)).toBe(-90);
  });

  it("is deterministic: same inputs always produce the same output", () => {
    const rule = { benefitDeltaAfterExpiry: -2 };
    expect(calcNextRawBenefit(rule, 10, true, -1)).toBe(
      calcNextRawBenefit(rule, 10, true, -1),
    );
  });
});
