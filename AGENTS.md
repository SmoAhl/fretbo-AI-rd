# Working in FretboAIrd

## Scope and authority

Use the current request to determine the work and its limits. Questions, reviews, diagnoses, and planning requests do not by themselves authorize implementation. For authorized implementation, carry the work through relevant verification and review. A plan does not expand that authorization.

Preserve existing user work and comments unless the affected code is removed or a comment is demonstrably wrong. Keep changes focused; avoid unrelated refactoring, speculative infrastructure, and unnecessary dependencies.

## Before making changes

Inspect Git status and the relevant repository context before editing. Read applicable instructions, relevant [architecture](docs/ARCHITECTURE.md) sections, the owning engine contract, relevant [accepted decisions](docs/DECISIONS.md#topic-index), and any ExecPlan for the current effort. Use the [documentation index](docs/README.md) to select those documents; do not load unrelated references or the entire decision history by default. Inspect the affected code paths, interfaces, tests, and configuration as they become available.

Resolve discoverable questions by inspecting the repository. Distinguish verified facts from assumptions. If an unresolved requirement or consequential architectural choice blocks progress, ask a focused question and continue any independent authorized work. Do not silently turn an open question into a decision.

## Engineering boundaries

Preserve the deterministic domain boundaries described in the architecture document. Direct application interaction and later AI interaction must use the same domain capabilities. AI interprets and orchestrates; UI and renderer layers present results. Domain code owns musical rules, discrete fretboard mapping, and chord fingering validation.

FretboAIrd models a discrete fretboard and produces chord fingerings that are musically correct, available on that fretboard, and practically sensible. Music Theory determines the musical object; Fretboard determines where its pitches can occur; Playability validates and assesses proposed chord fingerings and owns future ergonomic ranking; ranking is not yet implemented.

Develop the domain independently before adding AI. Expose clear, verified contracts for supported capabilities, and evolve them deliberately rather than attempting to finalize all future interfaces. Reuse suitable existing extension points and keep each change coherent and reviewable.

When implementing or reviewing Music Theory Engine behavior, consult the relevant sections of the [Music Theory Reference](docs/MUSIC_THEORY_REFERENCE.md).

When implementing or reviewing Fretboard Engine behavior, consult the relevant sections of the [Fretboard Reference](docs/FRETBOARD_REFERENCE.md).

When implementing or reviewing Playability Engine behavior, consult the relevant sections of the [Playability Reference](docs/PLAYABILITY_REFERENCE.md).

Read only the sections relevant to the behavior being changed. References contain the domain knowledge needed to derive answers, rather than every derivable answer. Preserve useful assumptions and convention distinctions; reference coverage does not establish implemented capabilities or select software representations. Scales and melodies currently require note locations only.

## Planning and ExecPlans

Plan before significant changes. Use an ExecPlan for:

- Complex features.
- Significant refactors.
- Substantial domain-contract or component-boundary changes.
- Staged migrations.
- Investigations or implementation efforts requiring durable continuation across sessions.

Small isolated fixes, tests, or documentation changes do not automatically require an ExecPlan. File count alone is not a threshold. For work below the threshold, a brief in-session approach is sufficient when planning is useful.

This section is the authoritative threshold. When an ExecPlan is required, read and follow the complete [.agent/PLANS.md](.agent/PLANS.md) protocol. Actual ExecPlans belong in the repository-level `plans/` directory; create that directory only when the first real plan is needed. Use one plan for one significant effort, not for the whole project roadmap.

## Commands and verification

Application commands are defined in `package.json`: `npm run dev`, `npm run build`, `npm run start`, `npm run typecheck`, and `npm test`. Discover any additional commands from actual configuration, documentation, and the execution environment. Do not invent commands, tools, dependencies, or existing project capabilities. If an authorized task introduces tooling, distinguish proposed setup from tools that already exist.

Verify behavior in proportion to risk. Prefer focused deterministic tests for domain logic, valuable regression coverage for bugs, and direct user-facing checks when presentation or interaction changes. Broaden testing when failures or unresolved risk justify it. Later agent evaluation does not replace ordinary tests.

Review the changes and relevant Git status before reporting completion. Inspect newly created files directly because an ordinary unstaged diff omits untracked files. Report what changed, what was actually checked, the results, and remaining uncertainty. Do not report an unrun check as passing.

When reporting completed repository changes, include a concise suggested commit message in a fenced text block without waiting for the user to ask. Base it on the reviewed changes from the current task, including documentation-only work, and follow the repository's existing commit-message style. Do not include unrelated user changes or claim unimplemented behavior. Suggesting a message does not authorize staging or committing changes.

### Completion reporting for every task

At the end of every task, including questions, investigations, reviews, planning, documentation changes and code implementation, report any remaining required work, deliberate deferrals, discovered TODOs and unresolved decisions relevant to the task. For each actionable item, state its category, impact, owning document or code location (with a link when available), and the next action or decision needed. Distinguish blockers from optional follow-ups and make clear whether the next step requires user input or separately authorized work. If none remain, say so. Keep the report proportionate; do not repeat the entire project backlog or create duplicate tracking documents merely to satisfy this report.

Required unfinished logic or verification must remain explicitly incomplete. Do not relabel it as an optional follow-up or claim the agreed task is complete; report the unmet requirement and what is needed to finish it. A proposed reduction in agreed scope needs the user's decision.

When documentation changes are authorized, record durable findings in the existing owning document: effort-specific unfinished work in its ExecPlan when one is required, current maintenance follow-ups in status, unsupported behavior in the relevant contract, and unresolved architectural choices in architecture. Read-only tasks do not authorize file changes: report the finding and its intended home, explicitly noting when it is not yet recorded. A local code TODO does not replace reporting an actionable finding to the user.

For code implementation, incorporate this information into the review below rather than duplicating it. The limit on maintainability concerns does not permit omitting required unfinished work or blockers.

### Post-implementation review

After every code implementation, include a concise review in the final response. Write the review in Finnish, including its headings, so the user can read it quickly. Cover:

- **Toteutettu:** What was added, changed, or completed.
- **Varmennus:** Tests, type checks, and their actual results.
- **Jatkotehtävät:** Intentionally postponed functionality, incomplete work, and newly discovered follow-up tasks.
- **Ylläpidettävyys:** Concrete technical debt, architectural concerns, or future maintenance risks introduced or identified by the changes.

Prioritize actionable findings over speculative improvements. Report at most two significant maintainability concerns, with relevant file references when applicable. Explicitly state when no concerns or deferred tasks were identified.

Do not expand the implementation scope or address deferred items without authorization. Keep the review brief and preserve the existing commit-message suggestion convention.

## Documentation and continuation

- This file owns working instructions and the ExecPlan threshold.
- [.agent/PLANS.md](.agent/PLANS.md) owns the ExecPlan protocol and template.
- [docs/README.md](docs/README.md) routes readers to the owning document.
- [docs/STATUS.md](docs/STATUS.md) owns the current capability overview and known follow-ups.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) owns architectural boundaries, cross-layer data and open architectural questions.
- The [Music Theory](docs/MUSIC_THEORY_V1.md), [Fretboard](docs/FRETBOARD_V1.md) and [Playability](docs/PLAYABILITY_V1.md) guides own current supported contracts, limits and handoffs.
- [Onboarding](docs/onboarding/README.md) teaches algorithms and examples; it does not own a separate capability or discrepancy ledger.
- [docs/DECISIONS.md](docs/DECISIONS.md) owns persistent accepted decisions and their rationale.
- [docs/MUSIC_THEORY_REFERENCE.md](docs/MUSIC_THEORY_REFERENCE.md) owns musical definitions, construction rules, and convention distinctions.
- [docs/FRETBOARD_REFERENCE.md](docs/FRETBOARD_REFERENCE.md) owns discrete string, tuning, fret, and pitch-location mapping knowledge.
- [docs/PLAYABILITY_REFERENCE.md](docs/PLAYABILITY_REFERENCE.md) owns chord contact, finger assignment, shared grip, and ergonomic ranking knowledge.
- An individual ExecPlan owns the context, progress, evidence, and local decisions for its effort.

Documentation remains a maintained foundation for humans and AI. Source and tests establish actual behavior; accepted decisions and supported contracts establish intended constraints. Investigate disagreements rather than silently treating stale prose or an accidental code change as authority. Update the owning document, and use links instead of competing detailed specifications. Historical plans and dated test counts do not establish current status.

Update affected documentation when behavior, architecture, or accepted decisions change. Keep task-specific choices in their ExecPlan unless they become persistent project decisions within the task's authority. Explain important tradeoffs concisely enough for the user to review the result.
