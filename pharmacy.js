const MIN_BENEFIT = 0;
const MAX_BENEFIT = 50;

const clampBenefit = (benefit) =>
  Math.min(MAX_BENEFIT, Math.max(MIN_BENEFIT, benefit));

function updateNormalDrug(drug) {
  drug.benefit = clampBenefit(drug.benefit - 1);
  drug.expiresIn -= 1;
  if (drug.expiresIn < 0) {
    drug.benefit = clampBenefit(drug.benefit - 1);
  }
}

function updateHerbalTea(drug) {
  drug.benefit = clampBenefit(drug.benefit + 1);
  drug.expiresIn -= 1;
  if (drug.expiresIn < 0) {
    drug.benefit = clampBenefit(drug.benefit + 1);
  }
}

function updateFervex(drug) {
  let increase = 1;
  if (drug.expiresIn <= 10) increase += 1;
  if (drug.expiresIn <= 5) increase += 1;

  drug.benefit = clampBenefit(drug.benefit + increase);
  drug.expiresIn -= 1;
  if (drug.expiresIn < 0) {
    drug.benefit = 0;
  }
}

function updateMagicPill() {
  // expiresIn and benefit never change
}

export const DRUG_NAMES = {
  HERBAL_TEA: "Herbal Tea",
  FERVEX: "Fervex",
  MAGIC_PILL: "Magic Pill",
};

const DRUG_HANDLERS = {
  [DRUG_NAMES.HERBAL_TEA]: updateHerbalTea,
  [DRUG_NAMES.FERVEX]: updateFervex,
  [DRUG_NAMES.MAGIC_PILL]: updateMagicPill,
};

export class Drug {
  constructor(name, expiresIn, benefit) {
    this.name = name;
    this.expiresIn = expiresIn;
    this.benefit = benefit;
  }
}

export class Pharmacy {
  constructor(drugs = []) {
    this.drugs = drugs;
  }
  updateBenefitValue() {
    for (const drug of this.drugs) {
      const updateDrug = DRUG_HANDLERS[drug.name] || updateNormalDrug;
      updateDrug(drug);
    }

    return this.drugs;
  }
}
