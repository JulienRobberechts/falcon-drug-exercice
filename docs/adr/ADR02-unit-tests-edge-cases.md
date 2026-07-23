# ADR02 — Per-drug and edge-case unit tests before refactor

## Status

Accepted

## Context

[[ADR01]] secures the overall observable behavior (30 days, 4 drugs) via
`output.json`. This net is deliberately coarse: it compares full series and
doesn't say *which business rule* would break if a test failed, nor does it
cover the boundaries (`benefit` at 0 or 50) which don't necessarily occur
within the 30 days simulated by `index.js`.

Before refactoring `updateBenefitValue` (Phase 3), a second, finer-grained net
is needed: one test per business rule, independent of the frozen content of
`output.json`, explicitly documenting the expected behavior.

## Decision

Write unit tests targeting `Pharmacy.updateBenefitValue`, one per business
rule and edge case listed in the README:

- Normal drug: -1/-1 per day, `benefit` never negative.
- Expired normal drug: doubled degradation (-2 on `benefit`).
- Herbal Tea: `benefit` increases, capped at 50, +2/day after expiration.
- Fervex: +1 normal, +2 if `expiresIn <= 10`, +3 if `expiresIn <= 5`, drops to 0
  as soon as expired, capped at 50.
- Magic Pill: `expiresIn` and `benefit` unchanged after N calls.
- Generic edge cases: `benefit` at 0 (floor) and at 50 (ceiling).

Each test builds a `Drug` in the desired state (right at the boundary when
needed) and verifies the state after one or more calls to
`updateBenefitValue()`, without depending on `output.json` or the initial
values in `index.js`.

## Consequences

- These tests act as an executable specification of the business rules: they
  must stay green after the Phase 3 refactor (same behavior, different
  implementation).
- They are more readable and faster to debug than the global non-regression
  test: a failure points directly to the rule at fault.
- Deliberate, accepted duplication with the Phase 1 net (two different nets,
  two different goals).
