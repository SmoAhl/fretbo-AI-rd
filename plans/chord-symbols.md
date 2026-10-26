# Chord-symbol parsing and canonical formatting


This living ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md).

## Purpose / Big Picture


Add a bounded notation layer for all 37 existing named chord qualities and optional slash basses. parseChordSymbol returns an existing SpelledChordDescription, and formatChordSymbol canonically formats exact catalog formulas. Preserve spelling, formula role identity and explicit bass, without choosing register or voicing. Arbitrary alteration languages, custom-formula symbol synthesis, omissions, polychords, Roman numerals, inversion analysis, identification, guitar behavior, UI, AI and new dependencies are excluded.

## Progress


- [x] 2026-10-26T09:10:55Z: Rechecked clean Git status, complete ExecPlan protocol, description/note-text contracts, catalog and architecture/decision/reference guidance. User explicitly authorized this plan.
- [x] 2026-10-26T09:15:28Z: Established private exhaustive suffix tables and strict parser with complete-note slash bass handling.
- [x] 2026-10-26T09:15:28Z: Implemented exact canonical formatting and independent grammar/round-trip fixtures. Focused checks passed 10,389 tests across nine suites; npm run typecheck passed.
- [x] 2026-10-26T09:17:55Z: Documented the full grammar in Architecture and this plan, updated README and recorded D050. Full regression passed 14,258 tests across 30 suites. Reviewed all six changed/new files, 116 local documentation targets, linked grammar/decision headings, 94 relative .js domain import targets, whitespace and final status.

## Surprises & Discoveries


Existing description creation deliberately defers derived spelling limits. The notation layer preserves that behavior. The existing note parser accepts uppercase letters and supported accidental tokens, not every accidental-character combination; complete root/bass validation delegates to it. A terminal /9 is part of the 6/9 suffix, whereas a terminal /E is a bass. The reference's symbol examples illustrate broader conventions rather than a committed parser grammar. Sandbox Vitest failed before assertions with temporary SSR-cache ENOENT; the identical focused command passed outside the sandbox without tooling changes.

## Decision Log


2026-10-26, user: Use a small explicit alias set, default Unicode output with an ASCII option, and exact ordered catalog-formula matching. Canonical sharp-eleventh suffixes are 9(#11) and maj9(#11), making the included ninth explicit. Implement the approved grammar.

2026-10-26, approved plan: Parse root plus complete suffix and optional terminal note bass. Trim outer whitespace but reject all internal whitespace. Suffixes are case-sensitive. Root/bass reuse existing note syntax, including natural and triple accidentals; suffix accidental signs accept ASCII or Unicode. Accept separate notation styles across tokens. Preserve explicit root/non-chord bass and absent bass. Parsing/formatting never resolve derived tones. Reject unsupported input with SyntaxError and unsupported/malformed formatting formulas or invalid notation with RangeError. Numeric descriptions cannot be formatted without an explicit spelling choice outside this API.

## Outcomes & Retrospective


All three milestones are complete. The two new APIs cover all 37 named qualities, six aliases and specified slash bass while retaining exact formula and spelling contracts. Independent fixtures, both-notation root/bass matrices and full regressions pass; type checking passes. The complete grammar and D050 are documented. Existing production modules, musical reference definitions, constructors, harmonization, dependencies and historical plans remain unchanged. Work is uncommitted.

## Context and Orientation


domain/music-theory/chords-symbols-and-realization/chord-descriptions.ts (D049) creates copied readonly-by-type descriptions with root, formula and optional bass, without requiring derived tones to be spellable. chord-formulas.ts (D042) validates nonempty formulas and resolves their tones; validation and resolution remain unchanged. triads.ts, seventh-chords.ts, added-tone-chords.ts and extended-chords.ts expose quality types and formula getters for 37 named qualities. Note parsing/formatting lives in domain/music-theory/pitch-pitch-classes-and-spelling/note-text.ts and already supports AccidentalNotation ascii/unicode with Unicode default.

Architecture keeps this deterministic capability independent of UI, AI and instrument rules. The Music Theory Reference explains common chord symbols, exact letter roles and specified versus sounding bass, but does not define the parser's accepted vocabulary. This effort adds a notation adapter depending on existing descriptions/catalogs without reverse dependencies or changing their APIs.

## Plan of Work


Milestone 1 adds chord-symbols.ts in the chord folder with private, exhaustively typed per-family entries referring to catalog formula getters. Share these canonical entries between parsing and formatting; aliases refer to canonical entries. Never duplicate musical formulas. Recognize a terminal slash bass only when the entire remainder parses as a note spelling. Parse the remaining root with existing accidental syntax, then match the entire suffix. Verify independent fixtures for every canonical suffix, alias and slash distinction.

Milestone 2 validates supplied formulas and compares exact ordered role numbers/alterations with catalog getter results. Format through existing note formatting with canonical suffix notation and explicit bass. Do not sort, deduplicate, reduce compound roles, infer bass or resolve tones. Verify all roots in both notations, representative bass matrices, deferred representability, formula rejection and independent/unchanged data.

Milestone 3 updates README.md, docs/ARCHITECTURE.md and docs/DECISIONS.md with the capability, bounded grammar and next accepted decision. Remove the obsolete statement that chord symbols are unimplemented while retaining realization as future work. Keep the reference's broader examples distinct from parser support. Run focused/full/type checks, inspect new files and tracked diffs, and check documentation links, imports, whitespace and final status.

## Concrete Steps


From C:/Users/simoa/Documents/fretbo-AI-rd, after adding tests/chord-symbols.test.ts, run:

    npm test -- tests/chord-symbols.test.ts tests/note-text.test.ts tests/chord-descriptions.test.ts tests/chord-formulas.test.ts tests/triads.test.ts tests/seventh-chords.test.ts tests/added-tone-chords.test.ts tests/extended-chords.test.ts tests/scale-harmonization.test.ts
    npm run typecheck
    npm test
    git diff --check
    git status --short

These scripts already exist on the Node 24.x foundation. Expect passing assertions/type checks and no whitespace diagnostics. Record actual observations separately below. If sandbox Vitest fails before assertions with its known temporary SSR-cache issue, repeat the identical read-only command outside the sandbox when permitted; do not modify tooling to work around it.

## Validation and Acceptance


Independent role fixtures cover all 37 canonical suffixes and six aliases. Verify 49 root spellings in both notations and all 49 bass spellings with representative roots/suffixes, exact root/bass and ordered formula round trips, alias canonicalization, natural-sign normalization, and preservation of explicit root/non-chord bass. C6/9 has no bass; C6/9/E, C6/E and C/E have different formulas or bass presence. Reject repeated/incomplete slashes, internal whitespace, lowercase roots, case variants, malformed accidentals/parentheses, unsupported suffixes and trailing text. Formatting must reject role reorderings, duplicates, enharmonic substitutions and other unmatched/malformed formulas without silently normalizing. Parsing and formatting G###maj7 succeeds even though later spelled tone resolution fails. Inputs stay unchanged, results are independent and unfrozen, and compile-time checks exclude numeric-only formatting.

## Idempotence and Recovery


Checks are repeatable. Preserve unrelated/user changes and inspect status before resuming. Correct only this effort's files after partial failure; no migration, commit, publishing or external mutation is needed. Keep progress/evidence current and do not mark completion before observable acceptance passes.

## Artifacts and Notes


Focused command passed 10,389 tests in nine suites and npm run typecheck passed. Full npm test passed 14,258 tests in 30 suites, including 2,287 new symbol tests. The initial sandbox run failed before assertions on its temporary SSR cache; the identical focused command and full regression passed outside the sandbox without tooling changes. Reviewed new source/tests/plan directly and all documentation diffs. Verified 116 local documentation link targets, the new grammar/decision heading anchors, 94 portable relative .js domain import targets, tracked/new-file whitespace and final Git status. Dependency review confirms the notation adapter imports existing capabilities without any reverse dependency.

Canonical ASCII suffixes (Unicode output replaces b/# accidental signs inside suffixes):

| Family | Quality | Suffix |
| --- | --- | --- |
| Triad | major | empty |
| Triad | minor | m |
| Triad | diminished | dim |
| Triad | augmented | aug |
| Triad | sus2 | sus2 |
| Triad | sus4 | sus4 |
| Seventh | major-seventh | maj7 |
| Seventh | dominant-seventh | 7 |
| Seventh | minor-seventh | m7 |
| Seventh | half-diminished-seventh | m7(b5) |
| Seventh | diminished-seventh | dim7 |
| Seventh | minor-major-seventh | m(maj7) |
| Seventh | augmented-major-seventh | aug(maj7) |
| Seventh | augmented-seventh | aug7 |
| Seventh | dominant-seventh-sus2 | 7sus2 |
| Seventh | dominant-seventh-sus4 | 7sus4 |
| Added tone | major-add2 | add2 |
| Added tone | major-add9 | add9 |
| Added tone | minor-add9 | madd9 |
| Added tone | major-add11 | add11 |
| Added tone | major-sixth | 6 |
| Added tone | minor-sixth | m6 |
| Added tone | major-sixth-ninth | 6/9 |
| Extended | dominant-ninth | 9 |
| Extended | major-ninth | maj9 |
| Extended | minor-ninth | m9 |
| Extended | dominant-eleventh | 11 |
| Extended | major-eleventh | maj11 |
| Extended | minor-eleventh | m11 |
| Extended | dominant-thirteenth | 13 |
| Extended | major-thirteenth | maj13 |
| Extended | minor-thirteenth | m13 |
| Extended | dominant-flat-ninth | 7(b9) |
| Extended | dominant-sharp-ninth | 7(#9) |
| Extended | dominant-sharp-eleventh | 9(#11) |
| Extended | dominant-flat-thirteenth | 13(b13) |
| Extended | major-sharp-eleventh | maj9(#11) |

Only additional aliases: sus -> sus4; 7sus -> 7sus4; ° -> dim; °7 -> dim7; ø7 -> m7(b5); 7(#5) -> aug7. Unicode ♭/♯ also work in the parenthesized suffix positions. Other aliases/conventions, including min, -, +, M7, Δ7, unparenthesized alterations and 7(#11), are unsupported by this grammar rather than musically invalid.

Root/bass tokens retain the existing note grammar: uppercase A-G with optional #/b, ##/bb, ###/bbb, ♯/♭, 𝄪/𝄫, ♯𝄪/♭𝄫, or ♮. No octave or internal whitespace is allowed. Formatting preserves note letter/accidental, normalizes natural tokens away, uses canonical suffixes and appends a slash bass only when specified.

## Interfaces and Dependencies


Export parseChordSymbol(text: string): SpelledChordDescription and formatChordSymbol(description: SpelledChordDescription, notation: AccidentalNotation = "unicode"): string from the new chord-symbols.ts. Parsing delegates note tokens to parseNoteSpelling and construction to createSpelledChordDescription. Formatting uses validateChordFormula, exact catalog formula getters and formatNoteSpelling. No public suffix registry, new quality type, external-data validator or notation dependency is introduced. Retain relative .js domain imports and existing constructor, harmonization and description contracts.

Revision note: 2026-10-26, created before implementation from the user-approved plan; updated after completion to record acceptance results and final review.
