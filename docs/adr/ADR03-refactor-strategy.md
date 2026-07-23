# ADR03 — Strategy pattern (map `name -> handler`) for `updateBenefitValue`

## Status

Accepted

## Context

`Pharmacy.updateBenefitValue` was a pyramid of nested `if`s (up to 5 levels)
mixing, for each drug, the selection of the business rule and its
application. The observable behavior is protected by [[ADR01]] (non-regression
test on `output.json`) and [[ADR02]] (per-rule unit tests), which allows
refactoring with confidence.

Two approaches were considered:

1. Keep a single method and flatten the nested `if`s with guard clauses /
   early returns.
2. Extract one update function per drug name and select the right one via a
   `name -> handler` map, with a default function for "normal" drugs
   (strategy pattern).

## Decision

Use a strategy pattern: one pure function per behavior (`updateNormalDrug`,
`updateHerbalTea`, `updateFervex`, `updateMagicPill`), a `DRUG_HANDLERS` map
associating the exact drug name with its function, and a fallback to
`updateNormalDrug` for any drug absent from the map (Doliprane today,
Dafalgan in Phase 5).

Each function applies its rule in 2-3 flat lines (no nested `if`), with a
shared `clampBenefit` helper to bound `benefit` between 0 and 50.

## Consequences

- Adding a new drug (Dafalgan, Phase 5) = adding a function and a map entry,
  without touching existing functions.
- Each function is independently testable and readable; the [[ADR02]] tests
  stay green without modification since the public API (`Drug`, `Pharmacy`,
  `updateBenefitValue()`) is unchanged.
- Replacing the step-by-step clamping applied throughout the old code with a
  single clamp at the end of the function is equivalent: the
  increments/decrements are monotonic per call, so
  `clamp(value + sum of deltas)` gives the same final result as several
  successive clamps.
