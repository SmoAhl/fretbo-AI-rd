# Evidence-based developer onboarding


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). It records one substantial documentation investigation, not an implementation roadmap.

## Purpose / Big Picture


Create an English onboarding guide at `docs/onboarding/README.md` with detailed linked chapters. An experienced TypeScript developer with limited music theory should be able to understand the actual algorithms, contracts, dependencies, examples and limitations. Only Markdown changes and documentation navigation are authorized; findings do not authorize code fixes, tests, dependency changes or commits.

## Progress


- [x] 2026-11-11: Inspected instructions, clean Git status, package configuration, architecture, decisions and current Playability guide/plan. Baseline HEAD is `1ad31b3`.
- [x] 2026-11-11: Read all 38 production domain modules, app/tooling files, important tests, all three references, handoffs and relevant historical plans; recorded evidence and discrepancies.
- [x] 2026-11-11: Wrote the onboarding index and eight detailed chapters, with seven standalone executable walkthroughs; added root README navigation.
- [x] 2026-11-11T10:46:46Z: Re-read every chapter, reviewed public names and implemented/planned boundaries, ran the existing tests/type checks, executed walkthroughs and verified catalog tables and additional prose examples.
- [x] 2026-11-11T10:48:27Z: Final audit passed 360 local links and 103 heading references, direct coverage of all 38 domain modules, fence/conflict/trailing-whitespace checks, tracked and untracked Git whitespace checks, and the exact Markdown-only changed-file set. No files were staged.

## Surprises & Discoveries


The root README still calls Playability unimplemented. Current source, D056, `docs/PLAYABILITY_V1.md` and the revised Playability plan describe reusable templates, search and assessment. The [discrepancy ledger](../docs/onboarding/implementation-status.md#documentation-discrepancies-discovered) records this and other historical/future wording that needs qualification. Navigation points readers to the current snapshot; existing historical records were not rewritten.

Music Theory and Playability require more than pitch-class coverage: formula roles, original spellings, explicit bass, optional indices and exact registered occurrences have independent contracts. Playability now supplies the occurrence-aware consumer that earlier handoff documents described as future work. Known-template generation exists, while general shape/fingering solving and heuristic ranking remain absent.

The inspected source/tests established no new behavior contradiction. Two existing maintenance concerns are documented without fixes: array-derived reference geometry IDs and broad error classification before external/UI exposure. The exact-pitch-search oracle remains a prior nonblocking coverage recommendation.

Installed Node 24.19.0/npm 11.6.2 differ from the Node 24.21.0/npm 11.19.0 pins. Existing tests, type checks and temporary example harnesses passed in this environment. TypeScript 7's package does not expose the old JavaScript compiler API; verification used its existing CLI from a temporary working directory, avoiding its command-line-file versus local-tsconfig conflict. No tooling was installed or changed.

## Decision Log


2026-11-11, documentation author: Use an ExecPlan because this repository-wide investigation requires durable evidence across a long task. Keep onboarding explanatory; existing architecture, references and decisions retain their ownership. Record documentation discrepancies explicitly instead of rewriting historical decisions or plans.

2026-11-11, documentation author: Split Music Theory into foundations, collections/keys and chords/voicings. This keeps prerequisite concepts near their algorithms and avoids an excessively long single domain chapter. The index defines both a full reading order and a short architecture/examples/status route.

2026-11-11, documentation author: Verify executable examples and tabular claims in temporary copies outside the repository, using the installed compiler and Node. This checks outputs and type contracts without changing source, tests, dependencies or configuration. Keep setup/runtime caveats explicit instead of implying root-relative `.js` imports execute through plain Node TypeScript loading.

## Outcomes & Retrospective


The nine-file guide explains every production domain module and the application/tooling bootstrap. It covers numerical/spelled representations, construction, analysis, optimized searches, contact validation, exact occurrence matching, bounded template search and the current limitations. Seven executable walkthroughs include a complete supported chord-symbol-to-fingering path and explicitly stop where arbitrary shape solving is absent.

All existing tests and type checks passed, all walkthrough assertions passed, and executable checks confirmed the complete chord/scale tables and key counts. Final local link/whitespace and scope checks passed as recorded below. The authorized documentation effort is complete; no implemented domain area remains undocumented for lack of evidence. The primary lesson is to distinguish implemented bounded contracts from older roadmap language and broader reference knowledge; neither review support nor a passing domain test establishes universal ergonomic comfort or a product UI.

## Context and Orientation


One private Next.js package contains framework-independent Music Theory, Fretboard and Playability modules. The app is a bootstrap page. Music Theory has five subject folders; Fretboard has one mapping module; Playability has seven modules spanning geometry, contacts, relative templates, reference data, assessment and search. Current decisions run through D056. Tests use Vitest in Node and strict TypeScript checking. Historical plans may contain old paths and superseded scope restrictions.

## Plan of Work


First establish actual behavior by reading source and tests alongside design records. Inspect numeric/spelled representations, parsing, scale/degree/key algorithms, chord construction/analysis/identification, fretboard searches, and Playability geometry/contact/search/assessment. Check bootstrap and tooling for whole-repository coverage. Evidence is observable APIs, assertions and current records, not memory.

Then write an entry point, architecture/development explanation, Music Theory chapters, Fretboard and Playability chapters, runnable examples and a status/discrepancy ledger. Split the Music Theory treatment if necessary to keep chapters navigable. Link source and tests with repository-relative paths; link rationale to accepted decisions. Add a navigation link to the root README without silently repairing unrelated stale statements.

Finally review the guide as a new developer, verify links and code examples against actual exports and execution where available, run relevant existing tests and `git diff --check`, and inspect new files directly. Acceptance requires accurate explanations and explicit implemented/planned boundaries, not merely Markdown existence.

## Concrete Steps


From `C:\Users\simoa\Documents\fretbo-AI-rd`, use `rg --files`, targeted `Get-Content`/`rg` reads, `git status --short` and `git log` for evidence. Read existing package scripts before running checks. Use installed Node/npm; no installation or tooling change is planned. A temporary external verification harness may execute extracted documentation snippets without adding repository source or tests.

Expected final checks: local Markdown targets resolve; public symbols match source; documented examples produce stated outputs; existing domain tests used as evidence pass or their environmental blockers are recorded; `git diff --check` is clean; only intended Markdown files differ.

Executed from the repository root:

    npm test
    # 41 test files, 17,870 tests passed; exit 0.
    npm run typecheck
    # Next route type generation and both TypeScript checks passed; exit 0.

For the walkthrough check, extract the seven `ts` fences from `docs/onboarding/end-to-end-examples.md` into independent temporary root-level files beside a copy of `domain/`. Compile with the installed `node_modules/typescript/bin/tsc` using ES2022, NodeNext module/resolution, strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes and the installed Node type definitions. Use a temporary ESM package and run the emitted files with Node. All seven compiled and completed their assertions. A separate temporary CLI compilation supported table-driven checks of the 37 chord formula/suffix rows, all 13 scale identifiers, all 98 keys (30 signatures and 92 representable relative keys), and additional interval/voicing examples; all passed.

## Validation and Acceptance


Cover all domain modules and essential supporting files, with conceptual explanations and meaningful algorithms rather than an export inventory. Verify success and rejection examples, C0-based register arithmetic, distinct ID/position ordering, exact occurrence preservation, and independent musical/pattern support. Do not claim heuristic ranking, general fingering solving, product UI or AI exists. No Markdown checker is currently declared in package scripts; perform link/reference/fence/whitespace checks directly. Record actual commands/results below when available.

## Idempotence and Recovery


Reads and checks are repeatable. Resume by inspecting status and this plan. Preserve all unrelated user changes, do not stage or commit, and remove only task-owned temporary verification artifacts if any are created. No migrations, publishing or external writes are involved.

## Artifacts and Notes


Deliverables:

- [Onboarding index](../docs/onboarding/README.md).
- [Architecture and development](../docs/onboarding/architecture-and-data-flow.md).
- [Music Theory foundations](../docs/onboarding/music-theory-engine.md), [collections and keys](../docs/onboarding/collections-and-keys.md), [chords and voicings](../docs/onboarding/chords-and-voicings.md).
- [Fretboard](../docs/onboarding/fretboard-engine.md) and [Playability](../docs/onboarding/playability-engine.md).
- [Executable walkthroughs](../docs/onboarding/end-to-end-examples.md) and [implementation status/discrepancies](../docs/onboarding/implementation-status.md).
- Root README navigation and this plan.

The initial clean worktree and HEAD establish the review baseline. The final local audit passed 360 local links and 103 heading references, found direct links to all 38 production domain modules, and reported no unbalanced fences, conflict markers or trailing whitespace. `git diff --check` passed for the tracked README. Each of the ten new Markdown files also passed `git diff --no-index --check -- /dev/null <path>` with no whitespace diagnostics (exit 1 denotes the new-file difference). Directly rereading the new files covered content that ordinary unstaged diff omits. The changed-file set is exactly the nine guides, this plan and README; the staged set is empty.

No dedicated Markdown checker is configured. No production build or UI check was run for this documentation-only change. Temporary harness files remained outside the repository. Source, APIs, tests, domain behavior, dependencies and tooling configuration are unchanged.

## Interfaces and Dependencies


All existing public TypeScript interfaces remain unchanged. Documentation consumes their actual names and signatures. Existing tests, references, D001–D056 and the completed/revised domain plans supply evidence. No additional package, service, schema or API is proposed.

Revision note: 2026-11-11. Completed the investigation plan with source review, chapter organization, findings, actual test/example/table verification, final link/whitespace checks and Markdown-only scope review.
