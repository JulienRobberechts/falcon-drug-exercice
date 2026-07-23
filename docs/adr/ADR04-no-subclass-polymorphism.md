# ADR04 — No subclass polymorphism (`HerbalTea extends Drug`, etc.)

## Status

Accepted

## Context

Following [[ADR03]], per-drug behavior is driven by a `DRUG_RULES` table
(map `name -> { getBenefitDelta, expiresInDelta, onExpired }`) consumed by a
single `Drug.update()` method. An object-oriented alternative was
considered: one subclass per behavior (`HerbalTea extends Drug`, `Fervex
extends Drug`, `MagicPill extends Drug`), each overriding `update()`.

README constraint: do not break `Drug`'s public API — in particular
`new Drug(name, expiresIn, benefit)`, used as-is in `index.js`,
`output.json`/regression tests ([[ADR01]]), and all unit tests ([[ADR02]]).

## Decision

Do not introduce a subclass hierarchy. Keep a single `Drug` class, whose
behavior at `update()` time is resolved via `DRUG_RULES[this.name]`.

Reasons:

- The discriminant remains `name`, a plain string passed to the existing
  constructor. With subclasses, callers would either need to know and
  instantiate the right subclass (`new HerbalTea(...)` instead of
  `new Drug("Herbal Tea", ...)`, which breaks the public API), or a factory
  (`Drug.create(name, ...)`) would need to be added that does exactly the
  same name → behavior dispatch as `DRUG_RULES` — no gain, extra
  indirection.
- Each behavior is a handful of numbers and small pure functions
  (`getBenefitDelta`, `expiresInDelta`, `onExpired`), not state or a
  lifecycle specific to each type: it remains configuration data, not
  sufficient reason for a class hierarchy.
- Subclass polymorphism changes the structural shape of instances (a
  different prototype per drug), which weakens the `toEqual(new Drug(...))`
  comparisons used in [[ADR02]] and the non-regression test ([[ADR01]]), for
  no benefit here.

## Consequences

- Adding a drug (Dafalgan, Phase 5) remains: one entry in `DRUG_RULES`, with
  no new class and no change to `Drug`/`Pharmacy`.
- `Drug` stays uniformly instantiable (`new Drug(name, expiresIn,
  benefit)`), regardless of its name, preserving the public API and existing
  tests as-is.
- If a future behavior needs state or logic too complex to remain
  declarative in `DRUG_RULES`, this decision will need to be revisited.
