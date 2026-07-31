const MIN_BENEFIT = 0;
const MAX_BENEFIT = 50;

const clampBenefit = (benefit) =>
  Math.min(MAX_BENEFIT, Math.max(MIN_BENEFIT, benefit));

export const calcNextRawBenefit = (
  rule,
  benefit,
  expired,
  benefitDeltaBeforeExpiry,
) => {
  const hasFixedBenefitAfterExpiry = rule.benefitValueAfterExpiry !== undefined;

  if (expired && hasFixedBenefitAfterExpiry)
    return rule.benefitValueAfterExpiry;

  if (expired) return benefit + rule.benefitDeltaAfterExpiry;

  return benefit + benefitDeltaBeforeExpiry;
};

export function getBenefitDeltaBeforeExpiry(rule, previousExpiresIn) {
  return typeof rule.benefitDeltaBeforeExpiry === "function"
    ? rule.benefitDeltaBeforeExpiry(previousExpiresIn)
    : rule.benefitDeltaBeforeExpiry;
}

export const DRUG_NAMES = {
  HERBAL_TEA: "Herbal Tea",
  FERVEX: "Fervex",
  MAGIC_PILL: "Magic Pill",
  DAFALGAN: "Dafalgan",
};

const DEFAULT_RULE = {
  benefitDeltaBeforeExpiry: -1, // benefit change per day before expiration
  benefitDeltaAfterExpiry: -2, // benefit change per day once expired
  expiresInDeltaPerDay: -1, // expiresIn change per day
};

const DRUG_RULES = {
  [DRUG_NAMES.HERBAL_TEA]: {
    benefitDeltaBeforeExpiry: 1,
    benefitDeltaAfterExpiry: 2,
    expiresInDeltaPerDay: -1,
  },
  [DRUG_NAMES.FERVEX]: {
    benefitDeltaBeforeExpiry: (expiresIn) => {
      if (expiresIn <= 5) return 3;
      if (expiresIn <= 10) return 2;
      return 1;
    },
    benefitValueAfterExpiry: 0,
    expiresInDeltaPerDay: -1,
  },
  [DRUG_NAMES.MAGIC_PILL]: {
    benefitDeltaBeforeExpiry: 0,
    benefitDeltaAfterExpiry: 0,
    expiresInDeltaPerDay: 0,
  },
  [DRUG_NAMES.DAFALGAN]: {
    benefitDeltaBeforeExpiry: -2,
    benefitDeltaAfterExpiry: -4,
    expiresInDeltaPerDay: -1,
  },
};

export class Drug {
  constructor(name, expiresIn, benefit) {
    this.name = name;
    this.expiresIn = expiresIn;
    this.benefit = benefit;
  }

  update() {
    const rule = DRUG_RULES[this.name] || DEFAULT_RULE;

    const benefitDeltaBeforeExpiry = getBenefitDeltaBeforeExpiry(
      rule,
      this.expiresIn,
    );

    const nextExpiresIn = this.expiresIn + rule.expiresInDeltaPerDay;
    const expired = nextExpiresIn < 0;

    const nextRawBenefit = calcNextRawBenefit(
      rule,
      this.benefit,
      expired,
      benefitDeltaBeforeExpiry,
    );

    this.expiresIn = nextExpiresIn;
    this.benefit = clampBenefit(nextRawBenefit);
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
