# ExecPlan protocol

## Purpose

An ExecPlan is a self-contained, living Markdown document for one significant implementation or investigation effort. It carries the knowledge needed to continue that effort across sessions. It is neither the project roadmap nor a replacement for architecture documentation.

The rules and template below define the repository's workflow for self-contained plans with living progress, findings, decisions, and outcomes.

## When and where to use a plan

The [ExecPlan threshold in AGENTS.md](../AGENTS.md#planning-and-execplans) determines when a plan is required. Read that instruction and this entire protocol before authoring or resuming one.

Keep actual plans at `plans/<descriptive-execplan-name>.md`, relative to the repository root. Create `plans/` only when the first real ExecPlan is needed. Do not create placeholder plans or a plan directory during the documentation bootstrap. This file defines the protocol; it is not an ExecPlan.

## Authoring a plan

Write for a developer or agent who has the current working tree and this plan, but no memory of previous conversations. Explain the intended outcome, scope, relevant repository state, unfamiliar terms, and the reasons behind important choices. Include necessary context in the plan itself; links to external material, local Downloads files, or earlier conversations cannot substitute for that explanation.

Name relevant files with repository-relative paths. Describe existing interfaces and the changes required by this effort without designing unrelated future capabilities. Consult [ARCHITECTURE.md](../docs/ARCHITECTURE.md) and [DECISIONS.md](../docs/DECISIONS.md), and explain the relevant constraints within the plan rather than merely telling the reader to find them elsewhere.

Organize the work into narrative milestones within Plan of Work. Each milestone must describe an outcome, the work that produces it, and a way to verify it independently. Progress tracks individual completed and remaining steps; milestones explain how those steps produce the intended result.

Give concrete commands, their working directories, and expected observations. Identify prerequisites honestly. If introducing a runner, script, or dependency is part of the authorized effort, describe that setup before using its proposed commands. Do not present a future command as currently available. Record actual execution results separately from predictions.

Define acceptance through observable behavior, including meaningful tests or a small demonstration appropriate to the task. Internal domain work can be demonstrated through deterministic tests or an authorized debug harness; a UI or agent is not required to prove it. Explain safe repetition and recovery for steps that can partially fail. Label exploratory prototypes and the criteria for retaining or discarding them.

## Maintaining and resuming a plan

Keep Progress, Surprises & Discoveries, Decision Log, and Outcomes & Retrospective current throughout the effort. At each stopping point, record completed work with timestamps, separate partial completion from remaining work, and preserve concise evidence for relevant findings and checks. Use UTC timestamps with an explicit `Z` suffix.

On continuation, inspect the working tree and verify the plan's recorded state before acting. Current instructions and accepted decisions take precedence over superseded plan assumptions. Mark outdated plans as historical; do not restore removed scope from them. Update stale facts explicitly. Continue through authorized milestones without repeatedly asking for next steps. If direction changes, update every affected section and append a dated revision note explaining what changed and why.

At major milestones and completion, compare the achieved behavior with the plan's purpose. Record remaining limitations and lessons. Do not mark work complete because files were written or compilation succeeded when the acceptance behavior remains unverified.

## Authority and decisions

An ExecPlan does not authorize additional scope, dependencies, Git actions, or changes to accepted project decisions. Follow the current task's authority; a plan does not grant permission to commit or publish.

Resolve routine implementation details within the agreed scope and record significant choices with their rationale, date, and author. Keep assumptions and unanswered questions distinguishable from decisions. If a consequential product or architecture question blocks a milestone, state that dependency and obtain the missing decision before doing the dependent work. Continue independent authorized work where possible.

The Decision Log records decisions for this effort. Only promote a choice to [DECISIONS.md](../docs/DECISIONS.md) when it becomes an actual persistent project decision within the task's authority. Include its rationale and update [ARCHITECTURE.md](../docs/ARCHITECTURE.md) when the architectural description changes. Proposals and temporary implementation choices do not become permanent merely because they appear in a plan.

## Formatting and required sections

Use plain language and primarily prose. Explain technical terms where they matter. Keep evidence concise. Checkbox checklists belong only in Progress; keep the other sections focused on explanation. Leave two blank lines after headings in an ExecPlan.

A standalone plan file contains ordinary Markdown without an enclosing code fence. When presenting an entire plan in a message, use one `md` fence and indented examples inside it, rather than nested fences. The fenced block below is an unpopulated template inside the protocol, not an active plan.

Retain all sections in the template. State explicitly when a section has no findings yet or a consideration does not apply. Do not leave unresolved placeholders in a milestone represented as ready for implementation. Each plan must reference this protocol.

## Reusable template

```md
# <Short description of the effort's outcome>


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). It is a living document; its progress, findings, decisions, and outcomes must reflect the current effort.

## Purpose / Big Picture


<Explain who benefits, what becomes possible, and how to observe success. State the authorized scope and important exclusions.>

## Progress


- [ ] <A concrete next step. Timestamp completed work and distinguish completed portions from what remains.>

## Surprises & Discoveries


<Record relevant observations and concise supporting evidence. State when there are no findings yet.>

## Decision Log


<For each significant choice, record the decision, rationale, date, and author. Keep unresolved questions separate from actual decisions.>

## Outcomes & Retrospective


<Compare demonstrated results with the original purpose at milestones and completion. Record gaps and lessons; do not imply unfinished work is complete.>

## Context and Orientation


<Explain the current repository state, relevant files and concepts, constraints, and assumptions without relying on chat history. Identify existing capabilities and proposed additions separately.>

## Plan of Work


<Describe the edits and additions as narrative milestones. For each milestone, identify the outcome, relevant locations, and independent verification. Include any necessary investigation and explicitly unresolved dependencies.>

## Concrete Steps


<Give the commands and working directories in execution order. Show expected observations as indented examples and record actual results as execution proceeds. Identify setup that must exist before a later command can run.>

## Validation and Acceptance


<Specify observable behavior and relevant positive, negative, or regression cases. Give available validation commands and explain what establishes success. Identify any checks that cannot yet run.>

## Idempotence and Recovery


<Explain which steps can safely be repeated and how to recover from partial failure. Describe safeguards for risky steps when such steps are authorized.>

## Artifacts and Notes


<Keep short evidence excerpts and relevant artifact references. Include enough explanation that unavailable external context is not required to continue.>

## Interfaces and Dependencies


<Describe the interfaces and dependencies required by this effort, their responsibilities, and the reasons for the choices. Distinguish existing contracts from deliberate changes. Do not predesign unrelated future features.>

Revision note: <Date, change to the plan, and reason. Update affected sections rather than relying on this note alone.>
```
