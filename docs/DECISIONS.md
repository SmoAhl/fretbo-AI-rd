# Project decisions

## Record policy

This document records significant accepted project decisions and their rationale. Open questions, recommendations, and temporary implementation possibilities do not belong here as accepted decisions. Unresolved architecture questions are listed separately in [ARCHITECTURE.md](ARCHITECTURE.md#open-architectural-questions).

Use stable decision IDs. Each record identifies its status, decision, rationale, consequences, and recording date and authority. Bootstrap records D001-D008 and the subsequent approved technology foundation D009-D018 are recorded on 2026-10-01; that date does not claim when every idea was first discussed.

Accepted technology choices describe what the project will use, not what has been installed or implemented. See [current implementation](ARCHITECTURE.md#current-implementation) for the verified repository state. This documentation update does not scaffold tooling or authorize implementation.

When a decision changes, preserve its historical record, mark it superseded, and link the replacement. Only accepted, non-superseded records are currently in force. Record actual decisions rather than keeping a queue of proposals in this file.

An ExecPlan's Decision Log concerns one effort. Promote a choice here only when it becomes a persistent project decision within the task's authority. Explain its reason and consequences and update the architectural description where relevant; do not promote it automatically.

## D001: Deterministic domain authority

Status: Accepted.

Decision: The deterministic domain owns music-theory calculations, discrete fretboard mapping, and chord fingering validation and ranking. AI, UI, and renderer layers consume those rules. The scope is clarified in [D019](#d019-discrete-fretboard-and-practical-chord-fingerings).

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

Consequences: No application technology was selected during the documentation bootstrap. The subsequent explicit technology choices in [D009-D018](#d009-typescript-and-strict-contract-checking) now apply without superseding this decision's requirement for explicit choices. One agent and structured communication can remain an initial direction without becoming permanent constraints. Record consequential technology choices when they are actually made within an authorized effort.

Recorded: 2026-10-01. Authority: User-accepted shared project understanding and bootstrap approval.

## D007: Separate documentation responsibilities and decision status

Status: Accepted.

Decision: `AGENTS.md` owns coding-agent instructions; `.agent/PLANS.md` owns the ExecPlan protocol; `docs/ARCHITECTURE.md` owns architectural boundaries and the current implementation description; this file owns accepted persistent decisions and their rationale. Open questions remain open until actually resolved.

Rationale: Separate work instructions, system description, persistent reasoning, and per-effort execution history so that assumptions do not silently become authority.

Consequences: Link to the document that owns a rule instead of maintaining competing definitions. Architecture must distinguish intended components from implemented code. A plan or earlier planning example cannot silently override an accepted project decision.

Recorded: 2026-10-01. Authority: User's approved documentation bootstrap and accepted requirement to preserve unresolved questions.

## D008: Self-contained ExecPlans for significant efforts

Status: Accepted.

Decision: Use self-contained ExecPlans for work meeting the authoritative [threshold in AGENTS.md](../AGENTS.md#planning-and-execplans). The protocol lives in [.agent/PLANS.md](../.agent/PLANS.md); actual plans live at `plans/<descriptive-execplan-name>.md` under the repository root.

Rationale: Significant efforts need durable, self-contained execution context. Keeping the protocol separate from actual plans avoids confusing working rules with individual efforts and avoids imposing heavyweight planning on small changes.

Consequences: Create `plans/` only when the first real ExecPlan is needed. File count alone does not determine whether a plan is required. The documentation bootstrap creates neither that directory nor an actual ExecPlan. Each future plan follows the protocol and maintains its living sections.

Recorded: 2026-10-01. Authority: User's final bootstrap approval, including the accepted threshold and correction to the actual ExecPlan location.

## D009: TypeScript and strict contract checking

Status: Accepted.

Decision: Use TypeScript 7.x as the implementation language with `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` enabled.

Rationale: Explicit, reviewable contracts and careful handling of missing values support reliable domain implementation and agent-assisted changes.

Consequences: Types do not replace deterministic musical tests or runtime validation where required. Keep static checking separate from behavioral testing as described in [D013](#d013-vitest-and-separate-behavioral-verification). Do not introduce generic type systems or abstractions for hypothetical capabilities.

Recorded: 2026-10-01. Authority: User's explicit technology-foundation approval and refinements.

## D010: Native ESM with NodeNext semantics

Status: Accepted.

Decision: Use native ESM conventions with NodeNext semantics for TypeScript modules.

Rationale: Explicit module semantics provide a consistent foundation for domain code and Node-based tooling without adding a legacy CommonJS requirement.

Consequences: Verify configuration and module resolution during setup, preserving portable domain boundaries when connecting the application framework. This decision does not establish a package-publication or dual-format distribution system.

Recorded: 2026-10-01. Authority: User's explicit technology-foundation approval and refinements.

## D011: Node.js 24 LTS development baseline

Status: Accepted.

Decision: Use Node.js 24 LTS as the initial development, tooling, and test runtime.

Rationale: A shared LTS baseline makes local development and verification predictable without selecting the eventual hosting environment.

Consequences: Keep Node-specific functionality outside portable domain calculations unless a concrete domain requirement justifies it. A test running under Node does not justify filesystem, process, network, or other Node-specific dependencies in music-theory logic.

Recorded: 2026-10-01. Authority: User's explicit technology-foundation approval and refinements.

## D012: npm and deliberate dependency updates

Status: Accepted.

Decision: Use npm for dependency management. During setup, use the npm version bundled with the selected Node.js 24 LTS release unless a concrete compatibility issue requires otherwise. Commit `package-lock.json` and update dependencies deliberately rather than relying on floating versions.

Rationale: The bundled package manager keeps setup simple, while the lockfile and deliberate updates make dependency changes reproducible and reviewable.

Consequences: Do not introduce pnpm configuration or a second package-manager lockfile. npm does not imply workspaces or a monorepo. Create the manifest and lockfile only during authorized setup.

Recorded: 2026-10-01. Authority: User's explicit selection of npm and setup policy in the technology-foundation approval.

## D013: Vitest and separate behavioral verification

Status: Accepted.

Decision: Use Vitest 5.x in a Node test environment for deterministic behavioral testing. Use separate commands for TypeScript static checking and runtime test execution.

Rationale: Type correctness and behavioral correctness are distinct obligations. Determinism depends on explicit inputs, controlled state, domain rules, and meaningful assertions rather than the test runner itself.

Consequences: A passing type check does not prove musical behavior, and passing runtime tests do not establish type correctness. If Vitest requires a Vite peer dependency, select and pin a supported compatible version during setup. Vite serves test-tooling infrastructure; no Vite version is a project-level architecture decision, and Next.js retains the application-framework role.

Recorded: 2026-10-01. Authority: User's explicit technology-foundation approval and Vite refinement.

## D014: React for application UI and interaction

Status: Accepted.

Decision: Use React as the UI library for guitar controls, fretboard interaction, selection and display state, composition-workbench interaction, and later AI-assisted interaction.

Rationale: Declarative UI and interaction can present and operate on shared deterministic capabilities across the intended application workflows.

Consequences: React components consume domain capabilities rather than contain or duplicate music-theory, fretboard, or playability rules. Selection and display interaction do not establish the state-management architecture or library. React selection does not change [domain-first construction](#d004-domain-first-construction) or require immediate UI implementation.

Recorded: 2026-10-01. Authority: User's explicit technology-foundation approval and React responsibility boundary.

## D015: Next.js as the full-stack application boundary

Status: Accepted.

Decision: Use Next.js as the full-stack application framework around the deterministic domain. FretboAIrd is intended to become a complete full-stack portfolio application.

Rationale: React is selected, the finished application needs full-stack capabilities, and later AI integration needs trusted server-side execution. Next.js provides a common application boundary for future authentication, persistence, APIs, and integrations without maintaining separate frontend and backend stacks or reopening the framework choice when server functionality is needed.

Consequences: Next.js consumes domain rules rather than defining musical content, pitch locations, or chord usability. Music Theory, Fretboard, and Playability remain usable and testable without Next.js, routing, Server Components, Route Handlers, or server actions, before and after application integration. Introduce server capabilities when needed; the first non-AI UI may primarily interact with the domain on the client. The [deferred technology choices](ARCHITECTURE.md#deferred-technology-choices), including hosting, authentication, persistence, and AI providers, remain undecided.

Recorded: 2026-10-01. Authority: User's explicit selection of Next.js and full-stack application rationale.

## D016: Generic UI controls, accessible primitives, and styling

Status: Accepted.

Decision: Use shadcn/ui as the primary source of reusable application UI components, Base UI as their accessible primitive layer where applicable, and Tailwind CSS for application styling.

Rationale: shadcn/ui supplies customizable controls within the repository, avoiding repeated implementation of generic interactions. Base UI supports keyboard interaction, focus management, and accessible semantics. Tailwind fits this React/Next.js UI approach and supports rapid iteration on the product's own visual identity.

Consequences: These technologies remain presentation and interaction dependencies. Generic controls must not encode musical semantics, fretboard calculations, or playability rules, and their conventions must not determine domain or application architecture. Do not add another broad UI framework such as MUI, Mantine, Chakra UI, or Ant Design without a demonstrated requirement. Introduce visual tokens and further design-system abstractions only when concrete repetition justifies them. The custom fretboard has a separate responsibility under [D017](#d017-custom-fretboard-visualization-with-react-and-svg).

Recorded: 2026-10-01. Authority: User's explicit shadcn/ui, Base UI, and Tailwind CSS selections and constraints.

## D017: Custom fretboard visualization with React and SVG

Status: Accepted.

Decision: Build the core fretboard visualization using React and SVG as a custom product interaction, separate from generic shadcn/ui and Base UI controls.

Rationale: SVG provides a scalable coordinate-based representation, and React provides declarative rendering and interaction. This gives the product direct control over strings, frets, markers, labels, selections, regions, voicings, playable positions, responsive geometry, and domain-driven feedback.

Consequences: The visualization consumes deterministic results through application state and operations. It does not independently determine musical content, note locations, or playability. SVG interactions initiate application operations rather than define musical meaning. Exact component hierarchy, SVG data structures, rendering algorithms, geometry, and state-management architecture remain open. No dedicated fretboard library is selected; a specialized library may be evaluated later for a concrete difficult problem if it preserves domain ownership.

Recorded: 2026-10-01. Authority: User's explicit React + SVG direction and visualization responsibility boundary.

## D018: One private application package with an independent domain

Status: Accepted.

Decision: Start with one repository and one private Next.js application package containing framework-independent deterministic domain modules. Do not introduce a monorepo, separate backend service, or premature package extraction.

Rationale: A single application keeps development structurally simple while preserving the existing logical boundaries. Multiple packages or services are not required to separate domain responsibilities from their consumers.

Consequences: Application and presentation technologies consume the domain. Domain calculations and tests remain independent of React, Next.js, UI libraries, CSS, routing and server framework features, AI providers, and deployment infrastructure. Package or service extraction may be considered later when concrete requirements justify it; do not create placeholder boundaries. This technology selection preserves [D001](#d001-deterministic-domain-authority) and [D004](#d004-domain-first-construction) and does not begin scaffolding or implementation.

Recorded: 2026-10-01. Authority: User's explicit single-package organization and deterministic-domain independence constraints.

## D019: Discrete fretboard and practical chord fingerings

Status: Accepted.

Decision: FretboAIrd models a discrete fretboard and produces chord fingerings that are musically correct, possible on that fretboard, and practically sensible. Music Theory determines the musical object; Fretboard maps its pitches to available locations; Playability validates proposed chord fingerings and ranks valid alternatives. Scales and melodies currently need locations only.

Rationale: Concise domain rules support useful, deterministic behavior without simulating instrument construction or a human hand.

Consequences: Keep string identities, registered tuning, fret range, contact rules, finger assignments, barres, and shared grip constraints. Separate hard validity checks from ergonomic preference. References contain the knowledge needed to derive answers, rather than exhaustive results. Historical plan assumptions do not extend current scope; candidate-generation ownership, concrete hard grip limits, and ranking parameters remain open. The Playability Reference now supplies conservative recommendation heuristics: ordinarily at most five consecutive fret positions (span 4), reviewed six-position stretches (span 5), and complete finger-placement checks. These are project recommendation rules, not universal anatomical limits; further supported shapes and exceptions remain to be established.

Recorded: 2026-10-06. Authority: User's explicit domain-reference refactoring request. D001 and D015 terminology is aligned with this scope; D008 retains the same plan workflow with external attribution removed.

Clarified: 2026-10-06. Authority: User's request to add fret-span/reach and playable finger-ordering heuristics to the Playability Reference.

Reference set: 2026-10-06. Authority: User-supplied CAGED major and movable minor assignments. The Playability Reference records the initial supported examples and explicit barre coverage; additional shapes and exceptions remain open. These examples do not introduce engine behavior or exclusive fingering solutions.

## D020: C-based pitch classes and explicit note spelling

Status: Accepted.

Decision: Interpret numeric pitch classes with C = 0 and natural letters D=2, E=4, F=5, G=7, A=9, B=11. Represent explicit spelling as a readonly object with required uppercase `letter` (A through G) and numeric `accidental` (-2|-1|0|1|2, for double flat through double sharp). Convert spellings one way to pitch class using the existing semitone transposition capability.

Rationale: A named origin connects the numeric foundation to Western letter spelling. Keeping letter and accidental explicit preserves enharmonic distinctions before conversion without choosing a canonical spelling or requiring key context. C = 0 is a project convention; octave equivalence and modulo-12 arithmetic are mathematical properties.

Consequences: Conversion does not mutate input and its numeric result loses spelling information. Existing numeric transposition remains unchanged and does not select a spelling. The contract accepts typed structured inputs; arbitrary JavaScript and external-data validation belong to a future input boundary. Register, reverse spelling selection, text parsing, formatting, and spelled transposition remain outside this increment and undecided where relevant. No framework or runtime-specific dependency is introduced into the domain.

Recorded: 2026-10-07. Authority: User's explicit approval and implementation request for the note-spelling plan.

## D021: Registered pitch coordinates with C0 as origin

Status: Accepted.

Decision: Represent registered sounding pitches as numeric safe-integer semitone coordinates with C0 = 0, C4 = 48, and C5 = 60. Support negative coordinates and octave numbers. A readonly `RegisteredNote` extends the existing explicit spelling with a required written octave. Convert notes to sounding coordinates, transpose by signed semitone addition without wrapping, and extract pitch class by discarding register.

Rationale: Numeric coordinates preserve octave distance and support comparison and future fretboard semitone mapping without coupling the domain to a renderer, instrument preset, or MIDI representation. A separate spelled-note input retains the written letter's octave convention: B-sharp3 and C4 identify the same sounding pitch. C0 = 0 is a project convention, not a universal numbering rule.

Consequences: `RegisteredPitch` is a number alias rather than a branded type or constructor. Each function validates numeric inputs and results as safe integers and throws `RangeError` for invalid values or overflow. Note conversion also requires a safe C-based octave coordinate (12 * octave), even if an accidental could bring the final mathematical result into range. Group the natural letter displacement and accidental before adding that octave base. These are software arithmetic limits, not musical or instrument bounds. Letter/accidental validity retains the existing typed-input contract. Conversion preserves the input and loses spelling in its numeric result. No dependency or existing API change is needed. Text parsing, formatting, reverse spelling selection, spelled transposition, and fretboard implementation remain outside this increment.

Recorded: 2026-10-07. Authority: User's explicit approval and implementation request for the registered-pitch plan.
