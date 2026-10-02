# Working in FretboAIrd

## Scope and authority

Use the current request to determine the work and its limits. Questions, reviews, diagnoses, and planning requests do not by themselves authorize implementation. For authorized implementation, carry the work through relevant verification and review. A plan does not expand that authorization.

Preserve existing user work and comments unless the affected code is removed or a comment is demonstrably wrong. Keep changes focused; avoid unrelated refactoring, speculative infrastructure, and unnecessary dependencies.

## Before making changes

Inspect Git status and the relevant repository context before editing. Read applicable instructions, [architecture](docs/ARCHITECTURE.md), [accepted decisions](docs/DECISIONS.md), and any ExecPlan for the current effort. Inspect the affected code paths, interfaces, tests, and configuration as they become available.

Resolve discoverable questions by inspecting the repository. Distinguish verified facts from assumptions. If an unresolved requirement or consequential architectural choice blocks progress, ask a focused question and continue any independent authorized work. Do not silently turn an open question into a decision.

## Engineering boundaries

Preserve the deterministic domain boundaries described in the architecture document. Direct application interaction and later AI interaction must use the same domain capabilities. AI interprets and orchestrates; UI and renderer layers present results. Neither defines musical or physical truth.

Develop the domain independently before adding AI. Expose clear, verified contracts for supported capabilities, and evolve them deliberately rather than attempting to finalize all future interfaces. Reuse suitable existing extension points and keep each change coherent and reviewable.

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

## Documentation and continuation

- This file owns working instructions and the ExecPlan threshold.
- [.agent/PLANS.md](.agent/PLANS.md) owns the ExecPlan protocol and template.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) owns architectural boundaries and the verified implementation description.
- [docs/DECISIONS.md](docs/DECISIONS.md) owns persistent accepted decisions and their rationale.
- An individual ExecPlan owns the context, progress, evidence, and local decisions for its effort.

Update affected documentation when behavior, architecture, or accepted decisions change. Keep task-specific choices in their ExecPlan unless they become persistent project decisions within the task's authority. Explain important tradeoffs concisely enough for the user to review the result.
