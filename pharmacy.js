const MIN_BENEFIT = 0;
const MAX_BENEFIT = 50;

const clampBenefit = (benefit) =>
  Math.min(MAX_BENEFIT, Math.max(MIN_BENEFIT, benefit));

export const DRUG_NAMES = {
  HERBAL_TEA: "Herbal Tea",
  FERVEX: "Fervex",
  MAGIC_PILL: "Magic Pill",
};

const DEFAULT_RULE = { getBenefitDelta: () => -1, expiresInDelta: -1 };

const DRUG_RULES = {
  [DRUG_NAMES.HERBAL_TEA]: { getBenefitDelta: () => 1, expiresInDelta: -1 },
  [DRUG_NAMES.FERVEX]: {
    getBenefitDelta: (expiresIn) => {
      if (expiresIn <= 5) return 3;
      if (expiresIn <= 10) return 2;
      return 1;
    },
    expiresInDelta: -1,
    onExpired: () => 0,
  },
  [DRUG_NAMES.MAGIC_PILL]: { getBenefitDelta: () => 0, expiresInDelta: 0 },
};

export class Drug {
  constructor(name, expiresIn, benefit) {
    this.name = name;
    this.expiresIn = expiresIn;
    this.benefit = benefit;
  }

  update() {
    const rule = DRUG_RULES[this.name] || DEFAULT_RULE;
    const benefitDelta = rule.getBenefitDelta(this.expiresIn);
    this.benefit = clampBenefit(this.benefit + benefitDelta);
    this.expiresIn += rule.expiresInDelta;

    if (this.expiresIn < 0) {
      this.benefit = rule.onExpired
        ? rule.onExpired(this.benefit)
        : clampBenefit(this.benefit + benefitDelta);
    }
  }
}

export class Pharmacy {
  constructor(drugs = []) {
    this.drugs = drugs;
  }
  updateBenefitValue() {
    for (const drug of this.drugs) {
      drug.update();
    }

    return this.drugs;
  }
}
