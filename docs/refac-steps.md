# Plan — Take-Home Test (Pharmacy)

## 0. Constraints to respect (extracted from the README)

### Business rules

- Every day: `expiresIn` -1 and `benefit` -1 (default rule, "normal" drug).
- Once expired (`expiresIn < 0`): `benefit` degrades **2x faster**.
- `benefit` never negative, never > 50.
- **Herbal Tea**: `benefit` increases with age (instead of decreasing), 2x faster once expired.
- **Magic Pill**: never expires (`expiresIn` fixed), `benefit` never moves.
- **Fervex**: `benefit` increases as expiration approaches (+1 base, +1 extra if `expiresIn <= 10`, +1 extra if `expiresIn <= 5`, i.e. +2 and +3 total); drops to 0 as soon as expired.
- **Dafalgan** (new): degrades 2x faster than a normal drug → -2/day before expiration, -4/day after expiration (the "expired = 2x faster" rule applies on top).

### Technical constraints

- Do not break the public API of `Drug` and `Pharmacy` (constructor signatures, `name`/`expiresIn`/`benefit` properties, `updateBenefitValue()` method). Adding new methods is allowed.
- Full freedom on the internal implementation of `updateBenefitValue`.
- `output.json` must keep generating identically for the existing drugs (Doliprane, Herbal Tea, Fervex, Magic Pill) — do not change the order or initial values of these 4 entries in `index.js`. Dafalgan must be **added**, not substituted.
- Frequent, atomic commits (makes review easier).
- Recommended max time: 2h. Report the actual time spent at the end.
- Push to a personal repo + share the link.

### Open questions

- No blocking ambiguity in the rules; the only point of interpretation: expired Dafalgan degrades -4/day (2x the normal "expired" rule), to confirm with the Falcon team if needed.

---

## Phase 1 — Baseline & anti-regression safety net

- [x] Verify that `yarn test` and `yarn lint` pass on the current code (already confirmed OK).
- [x] Regenerate with `yarn test` and confirm that `output.json` is not modified. This confirms `output.json` is aligned with the current code.
- [x] Add non-regression tests: one test per existing drug (Doliprane, Herbal Tea, Fervex, Magic Pill), comparing the full 30-day history against the frozen content of `output.json`. This test must pass **before** any refactor. — **ADR01**

## Phase 2 — Full unit tests (before refactor)

- [x] Add a short ADR in `docs/adr/` documenting the choice to write unit tests for edge cases. — **ADR02**
- [x] Write targeted tests per drug and edge case, on the current behavior (to safeguard the refactor):
  - Normal drug: -1/-1 degradation, never negative.
  - Expired normal drug: -2 degradation on benefit.
  - Herbal Tea: benefit increases, capped at 50, +2 after expiration.
  - Fervex: +1 normal, +2 if `expiresIn <= 10`, +3 if `expiresIn <= 5`, drops to 0 after expiration, capped at 50.
  - Magic Pill: `expiresIn` and `benefit` unchanged after N calls.
  - Edge cases: benefit at 0 (never goes below), benefit at 50 (never goes above).

## Phase 3 — Refactor `updateBenefitValue`

Goal: escape the nested `if` pyramid without changing observable behavior.

- Use a strategy pattern by drug name (map `name -> handler`), or an `updateDrug(drug)` method with flat branches (early return / guard clauses) rather than nested ifs.
- [x] Add a short ADR in `docs/adr/` documenting the choice to use the strategy pattern. — **ADR03**

**Methodology:**
- Make changes step by step.
- Keep `Drug`/`Pharmacy` with the same public API (guaranteed by the tests).
- After each refactor step, rerun `yarn test` (Phase 1 + 2 tests must stay green) and `yarn lint`.
- Commit often.

## Phase 4 — Confirming the Dafalgan spec

The spec contains two overlapping rules for Dafalgan, hence an ambiguity to resolve before implementation:

1. Normal baseline:
   - For all drugs, at the end of each day our system lowers both values for every drug.
   - "Dafalgan" degrades in Benefit twice as fast as normal drugs.

   This assumes the baseline decrement of a "normal" drug is 1/day. This is not guaranteed by the spec; we take it as a working assumption for the exercise.

2. Expiration rule:
   - Once the expiration date has passed, Benefit degrades twice as fast.
   - "Dafalgan" degrades in Benefit twice as fast as normal drugs.

   Open question: once expired, do the two "2x faster" rules stack for Dafalgan (-4/day), or are they mutually exclusive (-2/day)?

### New spec (to be validated with product)

Interpretation chosen for the exercise: Dafalgan's "2x faster" degradation applies on top of the normal baseline (-1/day), and stacks with the general "expired = 2x faster" rule.

| State             | `benefit` degradation |
|-------------------|------------------------|
| Before expiration | -2/day                 |
| After expiration  | -4/day                 |
| Floor             | never negative (min 0) |

To confirm with product before shipping: this reading assumes the two "2x faster" rules (Dafalgan-specific + expiration) multiply rather than being mutually exclusive.

## Phase 5 — Implementing Dafalgan

- [x] Create tests for Dafalgan covering the 3 cases (-2/day before expiration, -4/day after, never negative).
- [x] Implementation:
  1. Add a `new Drug("Dafalgan", ...)` instance in `index.js`, **at the end** of the `drugs` array, so as not to shift the existing entries in `output.json`.
  2. Add the Dafalgan rule to the refactored logic.
  3. Regenerate `output.json` via `yarn start` and verify that the first 4 entries of each day are unchanged, with only a 5th entry (Dafalgan) appearing.
  4. Update the Dafalgan tests so they follow the same structure as the other tests.

## Phase 6 — Verification

1. `yarn lint` and `yarn test` must pass without error.
2. `yarn start` regenerates `output.json` with no diff on the existing drugs.
3. Quick review of the overall diff (`git diff main`) to spot any unintended change to the public API.

---

## Summary of risks to watch

- Accidentally breaking the public API (`Drug`, `Pharmacy`) by renaming/removing existing properties or methods.
- Changing the order or initial values of the existing drugs in `index.js`, which would change `output.json` beyond the addition of Dafalgan.
