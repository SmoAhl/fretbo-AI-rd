# Project decisions

## Record policy

This document records significant accepted project decisions and their rationale. Open questions, recommendations, and temporary implementation possibilities do not belong here as accepted decisions. Unresolved architecture questions are listed separately in [ARCHITECTURE.md](ARCHITECTURE.md#open-architectural-questions).

Use stable decision IDs. Each record identifies its status, decision, rationale, consequences, and recording date and authority. The bootstrap records below are recorded on 2026-10-01; that date does not claim when every idea was first discussed.

When a decision changes, preserve its historical record, mark it superseded, and link the replacement. Only accepted, non-superseded records are currently in force. Record actual decisions rather than keeping a queue of proposals in this file.

An ExecPlan's Decision Log concerns one effort. Promote a choice here only when it becomes a persistent project decision within the task's authority. Explain its reason and consequences and update the architectural description where relevant; do not promote it automatically.

## D001: Deterministic domain authority

Status: Accepted.

Decision: The deterministic domain owns music-theory calculations, fretboard mapping, and applicable physical and playability logic. AI, UI, and renderer layers do not define musical or physical truth.

Rationale: The product's musical expertise must be verifiable independently of probabilistic model output or visual presentation.

Consequences: Separate theoretical content, instrument mapping, and playability responsibilities. Structural validity alone does not establish domain correctness. Configurable ergonomic judgments must not be presented as universal human limits. Exact data structures and engine interfaces remain undecided.

Recorded: 2026-10-01. Authority: User-accepted shared project understanding and bootstrap approval.

## D002: A useful standalone application with shared domain capabilities

Status: Accepted.

Decision: Ordinary application controls and direct fretboard interaction must provide useful guitar-tool functionality without AI. Later AI-assisted interaction invokes the same underlying deterministic capabilities as the direct path. AI adds intent interpretation and orchestration.

Rationale: The product must function as a guitar application independently of conversation, while allowing conversational assistance to build on the same musical behavior.

Consequences: Basic operation cannot require an LLM. Do not create competing UI-specific and agent-specific implementations of domain rules. The placement of those shared capabilities and application-state coordination remain open.

Recorded: 2026-10-01. Authority: User-accepted shared project understanding and bootstrap approval.

## D003: One system for exploration and composition

Status: Accepted.

Decision: General guitar and theory exploration and composition/arrangement development are two usage patterns of the same system. The musician remains the source of creative direction.

Rationale: Inspecting scales, chords, positions, and relationships supplies capabilities also needed to understand and develop musical ideas.

Consequences: Preserve a shared domain foundation for both patterns. This does not commit the first version to advanced composition features or establish their implementation order.

Recorded: 2026-10-01. Authority: User-accepted corrected planning review.

## D004: Domain-first construction

Status: Accepted.

Decision: Establish minimal domain concepts, Music Theory with deterministic tests, Fretboard with deterministic tests, and minimal Playability when required. Develop clear supported contracts and a basic non-AI UI before agent/tool integration and AI orchestration. Early work may use tests and a small CLI/debug harness.

Rationale: Understanding and establishing the deterministic machine independently is an explicit project goal. Reaching an AI-powered demonstration as quickly as possible is not the governing strategy.

Consequences: Runtime diagrams do not dictate construction order. A general fingering optimizer is not an early prerequisite. Audio, broader evaluation, and advanced capabilities arrive later as justified; ordinary deterministic verification starts with domain work.

Recorded: 2026-10-01. Authority: User's implementation-order correction, accepted shared understanding, and bootstrap approval.

## D005: Clear contracts that evolve deliberately

Status: Accepted.

Decision: Currently supported deterministic capabilities expose clear, verified contracts that dependent layers can use. Contracts may evolve with new capabilities while boundaries remain explicit.

Rationale: Dependable interfaces are necessary for the next layer, but comprehensively finalizing all future interfaces before UI development would over-constrain the project.

Consequences: Verify deliberate contract changes and update affected consumers and documentation. Do not infer a permanent freeze, a large future type system, or a versioning policy that has not been chosen.

Recorded: 2026-10-01. Authority: User's explicit clarification of stable structured interfaces.

## D006: Technology choices require explicit decisions

Status: Accepted.

Decision: Renderer, framework, library, and vendor choices are not permanent architectural commitments unless explicitly decided. Product references and course examples do not select the project's technology or scope.

Rationale: Preserve the distinction between architectural responsibilities and possible implementations of them.

Consequences: No application technology is selected by this bootstrap. One agent and structured communication can remain an initial direction without becoming permanent constraints. Record consequential technology choices when they are actually made within an authorized effort.

Recorded: 2026-10-01. Authority: User-accepted shared project understanding and bootstrap approval.

## D007: Separate documentation responsibilities and decision status

Status: Accepted.

Decision: `AGENTS.md` owns coding-agent instructions; `.agent/PLANS.md` owns the ExecPlan protocol; `docs/ARCHITECTURE.md` owns architectural boundaries and the current implementation description; this file owns accepted persistent decisions and their rationale. Open questions remain open until actually resolved.

Rationale: Separate work instructions, system description, persistent reasoning, and per-effort execution history so that assumptions do not silently become authority.

Consequences: Link to the document that owns a rule instead of maintaining competing definitions. Architecture must distinguish intended components from implemented code. A plan or earlier planning example cannot silently override an accepted project decision.

Recorded: 2026-10-01. Authority: User's approved documentation bootstrap and accepted requirement to preserve unresolved questions.

## D008: Cookbook-based ExecPlans for significant efforts

Status: Accepted.

Decision: Use the OpenAI Cookbook ExecPlan approach for work meeting the authoritative [threshold in AGENTS.md](../AGENTS.md#planning-and-execplans). The protocol lives in [.agent/PLANS.md](../.agent/PLANS.md); actual plans live at `plans/<descriptive-execplan-name>.md` under the repository root.

Rationale: Significant efforts need durable, self-contained execution context. Keeping the protocol separate from actual plans avoids confusing working rules with individual efforts and avoids imposing heavyweight planning on small changes.

Consequences: Create `plans/` only when the first real ExecPlan is needed. File count alone does not determine whether a plan is required. The documentation bootstrap creates neither that directory nor an actual ExecPlan. Each future plan follows the protocol and maintains its living sections.

Recorded: 2026-10-01. Authority: User's final bootstrap approval, including the accepted threshold and correction to the actual ExecPlan location.
