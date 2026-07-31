# ADR05 — Module-level pure functions (`calcNextRawBenefit`,
`getBenefitDeltaBeforeExpiry`) instead of `Drug` methods

## Status

Accepted

## Context

`Drug.update()` computed the next `benefit` inline, mixing state mutation
(`this.expiresIn`, `this.benefit`) with pure calculation (delta selection,
fixed-value-after-expiry branching). This inline logic was hard to test in
isolation: exercising an edge case required instantiating a `Drug` and
calling `update()`, then reading back `drug.benefit`, even when the case
under test had nothing to do with mutation or with `Pharmacy`.

Two calculations were extracted:

- `getBenefitDeltaBeforeExpiry(rule, previousExpiresIn)`: resolves the
  before-expiry delta, whether `rule.benefitDeltaBeforeExpiry` is a constant
  or a function of `expiresIn` (Fervex).
- `calcNextRawBenefit(rule, benefit, expired, benefitDeltaBeforeExpiry)`:
  computes the next unclamped `benefit`, including the
  `benefitValueAfterExpiry` fixed-value branch.

Both were made module-level exported functions rather than methods on
`Drug`, which can read as inconsistent with [[ADR04]] (single `Drug` class,
behavior resolved via `DRUG_RULES`) and is easy to mistake for scattering
`Drug`'s behavior outside the class without reason.

## Decision

Keep `calcNextRawBenefit` and `getBenefitDeltaBeforeExpiry` as plain
module-level functions, not `Drug` methods, and export them for direct unit
testing (`tests/drug.calc-next-raw-benefit.test.js`,
`tests/drug.get-benefit-delta-before-expiry.test.js`).

Reasons:

- Both are pure: they only read their arguments (`rule`, `benefit`,
  `expired`, `expiresIn`) and return a value, with no dependency on `this`.
  Making them methods would add an implicit dependency on a `Drug` instance
  they don't need.
- As plain functions they are testable with primitive/object literal inputs,
  without constructing a `Drug` — faster to write, faster to run, and each
  failure points directly at the calculation at fault rather than at
  `update()`'s end-to-end result.
- This does not reopen [[ADR04]]: `DRUG_RULES` remains the single source of
  per-drug behavior, and `Drug.update()` remains the only place that
  orchestrates mutation. These two functions are calculation helpers used by
  `update()`, not a second dispatch mechanism.

## Consequences

- `Drug.update()` reads as: resolve `rule` → compute pure values
  (`benefitDeltaBeforeExpiry`, `nextRawBenefit`) → mutate `this` once at the
  end. Mutation and calculation are visually separated.
- Trade-off accepted: these two functions live outside `Drug`'s prototype,
  so they don't show up via `drug.<TAB>` autocompletion, and their
  signatures repeat parameters (`rule`, `expiresIn`, `benefit`) that a method
  would read off `this`. Given they're pure and few, this is judged
  preferable to coupling them to an instance.
- If similar pure helpers keep being added, group them in one place in the
  module (as done here, just above the `DRUG_NAMES`/`DRUG_RULES` data) so
  they stay easy to locate despite being outside the class.
