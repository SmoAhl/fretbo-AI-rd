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

## D022: Note text and explicit reverse spelling policy

Status: Accepted.

Decision: Parse separate unregistered spellings and registered notes using uppercase A-G, optional #/♯, b/♭, ##/𝄪, bb/𝄫, or ♮, and a required signed decimal integer octave for registered notes. Trim outer whitespace and reject internal spaces, lowercase, x, mixed accidentals, and repeated Unicode accidentals. Format supplied spelling in ASCII or Unicode, defaulting to Unicode; omit natural tokens and include the written octave only for registered notes. Reverse conversion requires an explicit sharps/flats policy, preferring naturals and otherwise single accidentals for all twelve classes.

Rationale: Text syntax and display choices are explicit project conventions. Formatting an existing spelling must not silently choose an enharmonic alternative; selecting spelling from a numeric pitch is a separate operation whose policy cannot be inferred from the number alone.

Consequences: Parse functions return existing structured types and throw `SyntaxError` for malformed text, `RangeError` for unsupported numeric register. Optional ASCII +/- and leading octave zeroes are accepted and normalize on formatting. Reverse selection returns independent objects, preserves source pitches through conversion, and retains the safe-octave-base restriction of D021, rejecting unsupported extreme lower coordinates. No key-aware policy, scale context, interval parser, or UI logic is introduced. Modules depend only on portable sibling domain code.

Recorded: 2026-10-07. Authority: User's explicit answers to parser/formatter and reverse-spelling questions during the four-capability implementation goal.

## D023: Spelled transposition by qualified intervals

Status: Accepted.

Decision: Describe spelled transposition with a positive safe-integer interval number (including compound intervals), perfect/major/minor/augmented/diminished quality, and explicit up/down direction. Determine the target letter from interval number and its accidental from the sounding semitone displacement. Support both unregistered spellings and registered notes. Reject diminished unisons and derived accidentals outside the existing -2..2 contract with `RangeError`.

Rationale: Semitone distance alone cannot distinguish an augmented unison from a minor second. Keeping letter and chromatic displacement separate preserves musical spelling. Rejecting diminished unison avoids an up/down instruction whose chromatic motion contradicts that direction; rejecting unsupported accidentals preserves explicit interval meaning instead of silently respelling.

Consequences: Apply perfect quality to simple 1/4/5 families, major/minor to 2/3/6/7, and augmented/diminished to either except diminished unison. Compound intervals retain octave distance in registered output; unregistered output discards it. Validate numeric interval displacements and registered coordinates under the existing safe-integer/base restrictions; exact portable BigInt intermediates avoid precision loss. Preserve input objects and existing numeric APIs. Multiply augmented/diminished qualities, interval text parsing, scales, chords, fretboard mapping, and future-feature abstractions are outside scope.

Recorded: 2026-10-07. Authority: User's explicit interval-interface and diminished-unison answers during the four-capability implementation goal.

## D024: Interval text syntax with required direction

Status: Accepted.

Decision: Parse compact interval symbols P/M/m/A/d with a decimal number, full quality with a named interval from unison through fifteenth (octave for 8), or full quality with a decimal number for arbitrary supported compound intervals. Require trailing up/down. Preserve case-sensitive compact quality symbols to distinguish major M from minor m; full quality/name/direction words are case-insensitive.

Rationale: Both concise notation and readable names translate directly into the existing interval contract. Explicit direction avoids silently assuming upward transposition. Parsing validates interval semantics independently of a source note rather than attempting transposition on a dummy note.

Consequences: Trim outer whitespace and allow whitespace between tokens. Unsigned ASCII decimal numbers may have leading zeroes; signed numbers, fractions, ordinal suffixes, multiply augmented/diminished aliases, and unspecified word names are unsupported. Malformed syntax throws `SyntaxError`; existing quality compatibility, diminished-unison rejection, and safe-displacement rules throw `RangeError`. `validateSpelledInterval` shares the existing rules between parsing and transposition. No interval formatter, dependency, or change to existing transposition behavior is introduced. The earlier D023 exclusion described that increment's scope; interval text parsing is now implemented under this decision.

Recorded: 2026-10-07. Authority: User's interval-parser implementation request and explicit compact/full syntax and required-direction answers.

## D025: Registered interval measurement and identification

Status: Accepted.

Decision: Measure registered chromatic distance as signed target minus source with safe-integer inputs/results and positive zero for equality. Identify intervals between registered spelled notes using the existing SpelledInterval number/quality/up-or-down contract. Written letter/octave positions determine interval number and direction when positions differ, including enharmonic equality. Same-position altered unisons use sounding direction; identical notes return perfect unison/up.

Rationale: Sounding distance alone cannot distinguish an augmented fourth from a diminished fifth. Written and chromatic displacements together recover intervals usable by existing transposition. Up for an identical note is a deterministic project convention, not a claim that stationary pitches move upward. C4 to C-flat4 is represented as augmented unison/down under the existing rejection of diminished unisons.

Consequences: Preserve compound interval distance and explicit note spelling. Reject unsupported multiply augmented/diminished qualities, opposing written/sounding motion, invalid numeric inputs, and unsafe distances with RangeError. Existing registered-note octave-base validation applies. Inputs remain unchanged and every supported identified interval can transpose its source to its exact target. No new qualities, direction values, pitch-class distance convention, interval formatter/inversion, dependencies, or framework-specific domain code are introduced.

Recorded: 2026-10-07. Authority: User's interval measurement/identification implementation request and explicit approval of the existing interval contract and edge-case rules.

## D026: Simple interval inversion by octave displacement

Status: Accepted.

Decision: Invert validated simple intervals with numbers 1 through 8 using complementary number 9 minus the original number and qualities perfect↔perfect, major↔minor, augmented↔diminished. Flip up/down direction: major third/up becomes minor sixth/down. Return the existing SpelledInterval type without mutating the source.

Rationale: Moving the source note one octave in the original interval's direction leaves the target unchanged; the interval from that displaced source to the target has complementary number/quality and opposite direction. Unison and octave are retained as distinct endpoints of this operation.

Consequences: Reuse shared interval validation for input and result. Invalid or compound intervals throw RangeError. Augmented octaves cannot be inverted within the existing model because their complements are excluded diminished unisons; reject them without respelling or expanding the quality/direction vocabulary. Inversion is involutive for supported inputs. Earlier D025 exclusions described that increment; simple inversion is now implemented under this decision. Formatting, compound reduction, chord inversion, and other domain capabilities remain outside this increment.

Recorded: 2026-10-07. Authority: User's simple-interval inversion implementation request and approval to continue with the recommended direction-flipping convention and input limits.

## D027: Interval formatting and public semitone displacement

Status: Accepted.

Decision: Format the existing SpelledInterval as compact text by default (`m3 up`) or full English text (`minor third up`), always including direction. Export IntervalNotation with compact/full choices. Full notation uses the parser's existing names for numbers 1 through 15 and decimal numbers beyond them (`major 16 up`). Expose semitonesFromInterval as the signed safe-integer displacement of a validated interval, independently of a source note; normalize zero displacement to positive zero.

Rationale: Canonical text supports presentation and parser round trips without changing the interval model. Public semitone conversion lets other domain consumers reuse the existing arithmetic without dummy transposition or duplicated quality rules. Direction and compound octave distance remain explicit.

Consequences: Reuse existing interval validation, exact arithmetic, and parser symbol/name tables. Unsupported notation, invalid intervals, and unsafe displacement throw RangeError. Inputs remain unchanged. Earlier formatter exclusions described those increments' scopes; formatting is now implemented under this decision. Existing parsing/transposition behavior remains intact. No new qualities, localization, dependencies, or source-note constraints are introduced.

Recorded: 2026-10-08. Authority: User's approval and implementation request for the interval formatting and semitone conversion plan.

## D028: Seven-note scales, modes, and ordinal degrees

Status: Accepted.

Decision: Support explicit ScaleType identifiers major, natural-minor, harmonic-minor, melodic-minor-ascending, ionian, dorian, phrygian, lydian, mixolydian, aeolian, and locrian. Construct seven tonic-relative ordered pitch classes or NoteSpelling values with no repeated octave tonic. Share upward SpelledInterval patterns between numeric and spelled construction, including shared major/Ionian and natural-minor/Aeolian definitions. Expose ordinal ScaleDegree 1..7, class retrieval by degree, and class-to-degree membership returning undefined for non-members.

Rationale: Shared interval definitions preserve both sounding distance and seven successive letter roles without duplicating musical rules or applying a generic sharp/flat preference. Ordinal degree is the position in the chosen scale, distinct from its major-relative formula. An explicitly named ascending melodic-minor collection is useful without selecting future classical/jazz traversal behavior.

Consequences: Reuse existing semitone and spelled transposition, preserve typed pitch/spelling inputs, and return independent readonly arrays and spelling objects. Unsupported types/degrees and results beyond double accidentals throw RangeError; no silent respelling occurs. Numeric construction has no derived accidental limit. The broader melodic-minor convention remains open. Other collections, registered runs, custom patterns, relative-mode derivation, scale-name parsing, keys/signatures, harmonization, Fretboard, UI, AI, and dependencies are outside this increment. Earlier scale exclusions described preceding increments; supported scales/modes are now implemented under this decision.

Recorded: 2026-10-08. Authority: User's approval of the scales and modes plan, explicit implementation request, and instruction to retain the melodic-minor question and deferred architecture list.

## D029: Pentatonic collections and scale-specific ordinal limits

Status: Accepted. Additive extension of [D028](#d028-seven-note-scales-modes-and-ordinal-degrees).

Decision: Add major-pentatonic and minor-pentatonic to ScaleType and support them through the existing four scale functions. Major pentatonic uses upward intervals P1/M2/M3/P5/M6 (semitone offsets 0/2/4/7/9); minor pentatonic uses P1/m3/P4/P5/m7 (0/3/5/7/10). Return five tonic-relative ordered classes or spellings with no octave repetition. Preserve all function signatures and ScaleDegree 1..7; runtime cardinality validation rejects pentatonic degrees 6/7 while retaining them for seven-note scales.

Rationale: Ordinal degree identifies position in the selected collection, while explicit interval number and quality identify musical role and spelling. G is ordinal degree 4 of C major pentatonic but a fifth above C; E-flat is ordinal degree 2 of C minor pentatonic but a minor third above C. Existing shared interval consumers already support these skipped roles without a public custom-pattern contract or scale-specific type overloads.

Consequences: Retain the seven-note pattern helper and existing definitions, typed pitch/spelling inputs, independent readonly outputs, and double-accidental limits. Non-members return undefined; invalid degrees, unknown types, and unsupported spellings throw RangeError. No new public functions or dependencies are introduced. Pentatonic is implemented rather than deferred; chromatic collections and other deferred capabilities remain open, including classical/jazz melodic-minor traversal. D028's original seven-note scope is preserved as historical context rather than an exclusion of this extension.

Recorded: 2026-10-09. Authority: User's approval and implementation request for the pentatonic ExecPlan, explicit selection of runtime degree limits, and requirement to record remaining deferred capabilities and open questions after implementation.

## D030: Relative relationships between major-scale modes

Status: Accepted. Additive extension of [D028](#d028-seven-note-scales-modes-and-ordinal-degrees).

Decision: Derive a relative tonic, canonical mode name, and ordered collection from a parent tonic, a major-scale mode, and ordinal degree 1..7. Accept major as an Ionian parent alias and natural-minor as an Aeolian parent alias; return only ionian/dorian/phrygian/lydian/mixolydian/aeolian/locrian names. Expose relativeModePitchClasses and relativeModeNoteSpellings in a separate domain module with readonly structured results and a narrow RelativeModeParent type.

Rationale: Relative derivation preserves a parent's collection while changing tonic and degree roles. Reusing existing construction and rotating its output preserves exact spellings without choosing new enharmonic alternatives. Canonical output names identify the resulting mode consistently, including degree-1 alias inputs. This operation is distinct from constructing a named mode at an independently supplied tonic.

Consequences: The numeric result has tonic/mode/pitchClasses fields; the spelled result has tonic/mode/noteSpellings fields. The tonic is the first collection member, including the same readonly note object for spelled output. Results and their arrays/notes are independent between calls, not runtime-frozen; the supplied tonic is preserved. Unsupported runtime parents/degrees and parent construction requiring accidentals outside -2..2 throw RangeError. Numeric tonic and structured spelling inputs retain the existing typed-input boundary. No harmonic/melodic-minor modes, pentatonic rotations, custom patterns, registered runs, parsing, key/signature inference, dependencies, or UI are introduced. D028's relative-mode exclusion described its original increment; relationships between existing major-scale modes are now implemented. The classical/jazz melodic-minor question remains open.

Recorded: 2026-10-09. Authority: User's implementation request for relative relationships between existing major-scale modes. Canonical alias handling and the minimal structured result contracts were selected within that scope and explained before implementation.

## D031: Registered scale runs with explicit octave extent

Status: Accepted. Additive extension of [D028](#d028-seven-note-scales-modes-and-ordinal-degrees) and [D029](#d029-pentatonic-collections-and-scale-specific-ordinal-limits).

Decision: Expose scaleRegisteredPitches and scaleRegisteredNotes for every existing ScaleType, accepting a registered tonic plus required up/down direction, positive safe-integer octave count, and explicit boolean includeEndpoint. Always include the starting tonic and internal octave tonics; optionally include only the final tonic. Return independent readonly arrays/notes. Export MAX_SCALE_RUN_NOTES = 10_000 and reject excessive requested counts before output allocation without truncation.

Rationale: Octave extent gives a small, explicit tonic-to-tonic sequence contract. Reusing existing scale definitions and registered transposition avoids duplicated musical rules. Preserving each collection's spellings maintains degree roles and written octave boundaries. The note cap bounds allocation; it is a software resource limit rather than a musical or instrument limit.

Consequences: Note count is scale cardinality times octaves plus one if includeEndpoint is true. Invalid runtime options/types, oversized results, unsafe emitted coordinates, unsupported accidentals, and unsafe written octave bases throw RangeError. Only emitted notes require representable coordinates/register; an excluded final tonic is not calculated or validated. Spelled results retain D021's octave-base restriction, so some valid numeric runs cannot be spelled within the current contract. Letter/accidental inputs retain the typed-input boundary. Descending melodic-minor-ascending traverses that fixed collection downward without substituting natural minor or accepting a broader classical/jazz convention; that question remains open. Arbitrary start/end pitch bounds, zero-octave runs, custom patterns, new scale types, dependencies, UI, and Fretboard are outside this increment. Earlier run exclusions describe preceding increments; this explicit-octave capability is now implemented.

Recorded: 2026-10-09. Authority: User's registered-run implementation request and explicit approval to continue with the recommended extent, endpoint, numeric/spelled output, and 10,000-note cap.

Clarified: 2026-10-09. Authority: User's documentation request about up/down prompts and later convention-sensitive traversal. A call remains a single directional leg. Callers may compose two legs, starting the descent at the upper tonic and omitting that leg's starting note when a single turning tonic is desired. Each call's note cap applies independently; combined-output budgets and turning-note repetition policies remain future product choices. Classical downward natural-minor substitution is not part of fixed-collection reversal and must not be inferred from direction, an unqualified melodic-minor prompt, or future modes derived from the fixed ascending collection. This clarification changes no implemented behavior.

## D032: Strict scale-name parsing

Status: Accepted.

Decision: Expose parseScaleType(text: string): ScaleType in a separate scale-text domain module. Accept every existing ScaleType identifier and its space-separated word form, ignoring capitalization, trimming outer whitespace, and normalizing repeated whitespace between words. Hyphenated forms retain exact separators: do not normalize mixed spaces/hyphens, whitespace around hyphens, or alternative punctuation. Preserve major/ionian and natural-minor/aeolian as distinct returned identifiers.

Rationale: A small explicit name catalog translates text directly into existing structured domain inputs without choosing musical context. Bare minor and melodic minor do not identify an approved explicit collection/convention, so the parser must not silently expand them. An exhaustive ScaleType-keyed name table ensures future additions require deliberate parser coverage without exposing scale pattern internals.

Consequences: Unsupported or malformed text throws SyntaxError, including abbreviations, bare minor/melodic minor, unsupported collections, reordered words, tonic-prefixed text, and extra words. Parsing has no numeric or source-note semantic checks; existing construction functions retain their RangeError behavior independently. The complete accepted catalog is major, major-pentatonic, minor-pentatonic, natural-minor, harmonic-minor, melodic-minor-ascending, ionian, dorian, phrygian, lydian, mixolydian, aeolian, and locrian, with each hyphenated identifier also accepted as separate words. No inferred tonic/key, broader alias grammar, scale formatter, new collection, traversal convention, dependency, or product input UI is introduced. D028's parser exclusion described its original increment; this strict parser is now implemented. The existing melodic-minor traversal and combined-run questions remain open.

Recorded: 2026-10-09. Authority: User's strict scale-name parsing implementation request and explicit selection of the recommended grammar.

## D033: Standalone numeric chromatic collection

Status: Accepted.

Decision: Expose chromaticPitchClasses(tonic: PitchClass): readonly PitchClass[] in a separate chromatic domain module. Construct all twelve classes in tonic-relative ascending semitone order from offsets 0..11 using existing transposePitchClass, without repeating the tonic. Return a fresh array for each call, readonly by type and not runtime-frozen.

Rationale: Numeric chromatic exploration needs no twelve-note spelling or ordinal-degree policy. A standalone helper supplies the complete ordered collection without expanding the scale catalog's shared numeric/spelled contracts or duplicating pitch arithmetic.

Consequences: Retain the existing typed PitchClass input boundary; do not add arbitrary JavaScript input validation. ScaleType, ScaleDegree 1..7, existing scale functions, scale-name parsing, relative-mode helpers, and registered-run APIs remain unchanged. parseScaleType("chromatic") continues to throw SyntaxError. Chromatic spelling, ordinal degree queries, and scale-catalog integration remain deferred. No direction option, registered output, dependency, UI, or new traversal convention is introduced. Earlier chromatic exclusions described preceding increments; standalone numeric construction is now implemented. Melodic-minor traversal and combined-run questions remain open.

Recorded: 2026-10-09. Authority: User's explicit selection of a dedicated helper with deferred degree queries, followed by the approved-plan implementation request.

## D034: Explicit melodic-minor traversal conventions

Status: Accepted. Additive extension of [D031](#d031-registered-scale-runs-with-explicit-octave-extent).

Decision: Expose melodicMinorRegisteredPitches and melodicMinorRegisteredNotes in a separate domain module. Require registered tonic and readonly MelodicMinorRunOptions containing convention, direction, octaves, and includeEndpoint. Accept fixed-collection and classical-exercise conventions. Both ascend using melodic-minor-ascending; fixed-collection descends using the same collection, while classical-exercise descends using natural-minor. Each call describes one directional leg.

Rationale: Direction orders a collection; an explicit convention can select a different collection for the downward exercise. Separate helpers preserve existing fixed-scale contracts and avoid interpreting an unqualified melodic-minor request. Delegation keeps validation, spelling, register arithmetic, and output limits in one existing implementation.

Consequences: Missing/unsupported convention throws RangeError; existing run validation rejects missing/invalid direction, extent, endpoint policy, unsafe emitted coordinates, unrepresentable spellings, and excessive output. Retain MAX_SCALE_RUN_NOTES = 10,000 with no truncation, input preservation, independent readonly arrays/notes, and existing double-accidental/safe-octave-base limits. Validate only the selected collection, so classical descent does not require a representable ascending collection. ScaleType, fixed scale/run APIs, relative modes, and text parsing remain unchanged; no jazz alias or convention inference is introduced. Combined legs, turning-note policy, combined budgets, future minor-derived modes, arbitrary bounds, keys, UI, and dependencies remain outside this increment. Earlier decisions' melodic-minor traversal exclusions describe their original increments; this explicit two-convention capability now resolves that narrow question. Future modes of the fixed ascending collection must not automatically select classical downward substitution.

Recorded: 2026-10-09. Authority: User's explicit implementation request for registered melodic-minor runs using fixed-collection or classical-exercise conventions.

## D035: Fixed modes of harmonic and ascending melodic minor

Status: Accepted. Additive extension of [D028](#d028-seven-note-scales-modes-and-ordinal-degrees) and [D031](#d031-registered-scale-runs-with-explicit-octave-extent).

Decision: Represent each derived mode with readonly MinorMode containing parent (harmonic-minor or melodic-minor-ascending) and rotation degree 1..7. Provide minorModePitchClasses/minorModeNoteSpellings at an explicit mode tonic; relativeMinorModePitchClasses/relativeMinorModeNoteSpellings from a parent tonic, parent, and degree; and minorModeRegisteredPitches/minorModeRegisteredNotes using existing ScaleRunOptions. Relative results contain tonic, mode, and the ordered collection, preserving exact parent spellings. Keep all fourteen derived collections fixed on ascent and descent.

Rationale: Parent and rotation distinguish each mode without accepting naming aliases. Reusing parent construction and interval identification/transposition avoids duplicating musical formulas. Direct construction spells the requested interval roles; relative construction preserves the parent's collection. Sharing existing registered-run arithmetic retains one implementation of octave positioning, numerical limits, spelling recovery, and output budgets.

Consequences: Validate parent/rotation with RangeError; retain typed pitch/spelling inputs, independent readonly results, double-accidental limits, safe registered coordinates and written octave bases, and MAX_SCALE_RUN_NOTES = 10,000. The spelled relative tonic is the first collection object. scale-run-internals.ts consumes trusted internal offsets/spellings, not arbitrary custom patterns; scale-runs.ts retains its public options/cap exports and signatures. ScaleType, canonical major-mode contracts, degree queries, parsers, and D034 convention-aware melodic-minor traversal stay unchanged. No names, grammar, mode inference, classical substitution for derived modes, custom families, keys, harmonization, UI, or dependencies are added. Earlier minor-mode exclusions describe preceding increments; this two-parent capability is now implemented.

Recorded: 2026-10-09. Authority: User's explicit implementation request for constructing, deriving, spelling, and running the seven modes of harmonic minor and fixed ascending melodic minor.

## D036: Simple degree formulas and shared collection queries

Status: Accepted. Additive extension of [D028](#d028-seven-note-scales-modes-and-ordinal-degrees), [D029](#d029-pentatonic-collections-and-scale-specific-ordinal-limits), and [D035](#d035-fixed-modes-of-harmonic-and-ascending-melodic-minor).

Decision: Represent a simple major-relative role as readonly DegreeFormula with required number: ScaleDegree (1..7) and alteration: Accidental (-2..2). Expose pitchClassFromDegreeFormula and noteSpellingFromDegreeFormula. Expose DegreeCollection = ScaleType | MinorMode and shared degreeFormulas, degreeFormulaAtOrdinal, pitchClassAtCollectionDegree, noteSpellingAtCollectionDegree, and collectionDegreeOfPitchClass. Membership returns readonly CollectionDegree with ordinal/formula, or undefined for non-members. Preserve existing ordinal scale-query signatures and behavior.

Rationale: Ordinal position and major-relative role differ in pentatonic collections; a formula's alteration also differs from its resulting note accidental. Existing scale/mode spelling at C supplies ordered roles without duplicating definitions. Spelling from the tonic's natural reference role and validating the final combined accidental supports B-double-sharp plus flat 3 yielding D-double-sharp. Independent formula arithmetic supports all simple double alterations without expanding the existing interval-quality contract. Numeric membership reports the selected collection's role rather than choosing an enharmonic interpretation outside it.

Consequences: Formula fields, collection selectors, ordinal limits, and unsupported final accidentals throw RangeError. Typed tonic/pitch inputs retain existing boundaries; numeric conversion does not inherit spelling limits. Spelled ordinal retrieval validates only its requested result. MinorMode.degree selects the parent rotation; the explicit tonic is the mode tonic and the query ordinal is separate. Results are fresh readonly arrays/objects, not runtime-frozen; inputs are preserved. All fourteen modes remain fixed collections.

Text contract: Expose parseDegreeFormula and formatDegreeFormula in degree-text. Accept one optional prefix (b/#, bb/##, ♭/♯, ♭♭/♯♯, 𝄫/𝄪, or ♮) followed by unsigned decimal digits, with outer whitespace and leading zeroes. Reject internal whitespace, mixed signs, suffix signs, signed numbers, words, and lists with SyntaxError; syntactically valid numbers outside 1..7 throw RangeError. Formatting uses existing AccidentalNotation, defaults to Unicode repeated signs for doubles, and omits the prefix for zero alteration. Formula and notation validation use RangeError; both formats round-trip.

Compound/registered formulas, arbitrary note-to-formula identification, keys/signatures, key-aware spelling, custom collections, harmonization, dependencies, UI, Fretboard, and AI remain outside this increment. Earlier exclusions describe their original increments; this narrow Degrees capability is now implemented.

Recorded: 2026-10-09. Authority: User's explicit selections of the narrow Degrees contract and shared API, followed by the approved-plan implementation request.

## D037: Explicit major/minor keys and conventional signatures

Status: Accepted. Additive extension of [D020](#d020-c-based-pitch-classes-and-explicit-note-spelling), [D028](#d028-seven-note-scales-modes-and-ordinal-degrees), and [D036](#d036-simple-degree-formulas-and-shared-collection-queries).

Decision: Expose KeyMode major/minor, readonly Key with required tonic: NoteSpelling and mode: KeyMode, and createKey. Keep identity independent of signature support and musical collection selection. Expose keySignature returning KeySignature, a readonly array of KeySignatureAccidental entries with letter and single accidental -1/1. Support conventional signatures of zero through seven sharps or flats, in F-C-G-D-A-E-B or B-E-A-D-G-C-F order; zero alterations are omitted and count is array length. Preserve enharmonic tonic spelling without automatic substitution.

Rationale: A minor key is not one fixed minor scale. Existing major/natural-minor spelling supplies the conventional signature baseline without adding a collection field or new musical definitions. Keeping identity independent allows theoretical identities and relationships even when their signatures exceed this increment's support. Ordered entries provide the actual altered letters without redundant count/direction fields or renderer-specific placement.

Relationships: Expose relativeKey, deriving formula 6 from major or ♭3 from minor with existing noteSpellingFromDegreeFormula and changing mode. Expose parallelKey, preserving exact tonic spelling and changing mode. Neither validates signature availability. All seventy existing tonic/mode identities and parallel relationships are supported; thirty have conventional signatures and sixty-four relative results are spellable within ±2. The six relative results needing triple accidentals are rejected.

Consequences: Unsupported runtime modes, non-conventional signatures, and spelling-limit failures throw RangeError. Tonic spelling retains the existing typed-input boundary. Results are fresh readonly objects/arrays rather than runtime-frozen, including copied tonic and signature entries. Existing scale, text, degree, and spelling-selection contracts remain unchanged; key identity does not extend DegreeCollection. Key text, theoretical signatures, key-aware spelling, inverse signature lookup, harmonization, UI, AI, and dependencies are outside this increment.

Deferred improvements: Triple accidentals and improved error classification are documentation-only TODOs with capability-driven triggers in [Architecture](ARCHITECTURE.md#deferred-music-theory-improvements). They do not widen current spelling limits, change public errors, add structured codes, or introduce infrastructure in this increment.

Recorded: 2026-10-12. Authority: User's explicit identity/signature and structured-input selections, acceptance of the plan with deferred TODO triggers, and implementation request.

## D038: Key-aware pitch-class spelling with explicit degree roles

Status: Accepted. Additive extension of [D022](#d022-note-text-and-explicit-reverse-spelling-policy), [D036](#d036-simple-degree-formulas-and-shared-collection-queries), and [D037](#d037-explicit-majorminor-keys-and-conventional-signatures).

Decision: Expose spellingFromPitchClassInKey(pitchClass, key, role?) in a separate portable domain module, returning NoteSpelling or undefined. Require numeric class and explicit Key; optional role is the existing major-relative DegreeFormula measured from key tonic. Without a role, major/natural-minor baseline membership supplies the formula to spell. Pitches outside that baseline return undefined rather than receiving an inferred role or fallback spelling. This baseline is a spelling-selection convention, not a selected collection for subsequent operations or a definition of every pitch usable in the key.

Rationale: Key context supplies conventional baseline spellings such as E-sharp in F-sharp major, while chromatic pitches can retain multiple musical roles. Existing numeric degree membership and formula conversion separate role selection from spelling construction. An explicit role can deliberately override baseline spelling, including C-major class 0 as B-sharp under sharp 7. Roles remain major/perfect-relative in minor: B-minor formula 6 is G-sharp, not a natural-minor ordinal or alteration added to its baseline sixth.

Consequences: Validate runtime classes as integers in 0..11 and key mode through existing key construction; tonic spelling retains its typed boundary. For supplied roles, validate formula/pitch agreement numerically before spelling. Invalid inputs, contradictory roles, and selected spellings beyond +/-2 throw RangeError without fallback. Support all existing key identities, validate only the selected output, and never require conventional signature support or full collection spelling. Return fresh readonly-by-type spellings without runtime freezing or input mutation. Generic sharps/flats selection, registered spelling, key/signature, degree, and parser contracts remain unchanged.

Registered output, candidate enumeration, fallback policies, collection-ordinal roles, broader functional/context inference, triple accidentals, structured error infrastructure, UI, AI, and dependencies are outside this increment. The [deferred improvements](ARCHITECTURE.md#deferred-music-theory-improvements) retain their capability-driven triggers. Earlier key-aware exclusions describe preceding increments; this narrow key-and-formula capability is now implemented.

Recorded: 2026-10-12. Authority: User's explicit unresolved-result, DegreeFormula, pitch-class output, and selected-result key-support choices, followed by the approved-plan implementation request.

## D039: Triple accidentals and degree alterations

Status: Accepted. Additive extension of D020/D022/D023 and the spelling limits inherited by D028-D038. Previous decisions and completed plans describe their original increments.

Decision: Extend Accidental to integer -3..3, shared by NoteSpelling, RegisteredNote, and DegreeFormula.alteration. Existing public function signatures remain unchanged. Widen runtime formula validation and derived note-spelling guards to the same range. Preserve exact letter roles and reject results beyond it with RangeError without respelling.

Text contract: Note parsing accepts ###/bbb and ♯𝄪/♭𝄫; Unicode formatting uses single sign followed by double sign for triples and retains dedicated double signs. Reversed composites, repeated Unicode triples, mixed ASCII/Unicode tokens, and quadruples remain SyntaxError. Degree parsing additionally accepts ♯♯♯/♭♭♭; degree formatting retains repeated Unicode signs for doubles and triples. Existing whitespace, octave, degree-number, and notation validation rules are unchanged.

Rationale: Previously representable theoretical key identities could have relative keys or selected degree spellings requiring triples. Widening the existing spelling foundation makes these operations available without enharmonic substitution or a parallel spelling algorithm. A formula alteration remains distinct from the final note accidental; only the combined result determines spelling representability.

Consequences: Support 49 spellings, 49 simple formulas, and 98 major/minor identities. All previous double-accidental identities now have representable relative keys; 92 of the expanded identities have representable relative results and six require quadruples. Conventional signatures remain zero through seven single sharps/flats, supporting the same 30 identities. Scale/mode/run and key-aware operations reuse the widened capabilities, preserving selected-result validation, typed note-input boundaries, readonly outputs/input isolation, safe arithmetic/octave bases, explicit traversal, and the 10,000-note cap. Generic spelling policies and interval-quality semantics remain unchanged.

The triple-accidental TODO is completed; the deferred error-classification TODO remains open. Theoretical signatures, accidentals beyond ±3, new interval qualities, registered key-aware output, structured errors, UI, AI, dependencies, and broader inference remain outside this increment. Current capabilities and evidence are recorded in [Architecture](ARCHITECTURE.md) and the [triple-accidental effort](../plans/triple-accidentals.md).

Recorded: 2026-10-13. Authority: User's explicit triple-formula and composite note-notation selections, followed by approval and implementation request for the triple-accidental plan.

## D040: Basic triads from explicit root and quality

Status: Superseded by [D043](#d043-triad-formulas-and-suspended-structures). Historical contract retained below.

Decision: Export TriadQuality (major/minor/diminished/augmented), triadPitchClasses(root: PitchClass, quality: TriadQuality): readonly PitchClass[], and triadNoteSpellings(root: NoteSpelling, quality: TriadQuality): readonly NoteSpelling[] from a separate portable triads module. Require both arguments. Return exactly three tones in root-third-fifth role order, without bass, register, or inversion semantics. Numeric results wrap modulo twelve without sorting.

Rationale: The four supported qualities are explicit musical constructions, independent of a key, selected scale, voicing, or fingering. One internal DegreeFormula table uses 1/3/5, 1/flat-3/5, 1/flat-3/flat-5, and 1/3/sharp-5 for both outputs through existing converters. This preserves letter roles without another spelling algorithm or rejecting a valid triad because an unrelated scale tone cannot be spelled. For example, G-triple-sharp major's triad fits the current range even though its full scale does not.

Consequences: Retain typed numeric/spelled root boundaries. Unsupported runtime qualities, including aliases and inherited-property names, throw RangeError. Spelling preserves exact accidentals through +/-3; any unrepresentable required tone throws RangeError without fallback, omissions, or partial output. Numeric output is independent of spelling limits. Each call returns fresh readonly-by-type arrays and spelling objects without runtime freezing or input mutation. Existing public contracts remain unchanged, with sibling-only domain dependencies.

Seventh chords, symbol parsing, chord identification, scale harmonization, registered output, inversions, voicing, Fretboard, Playability, UI, AI, and new dependencies remain outside this increment. The deferred error-classification improvement remains open. Earlier chord exclusions describe preceding increments; construction of these four triad qualities is now implemented.

Recorded: 2026-10-21. Authority: User's selection of numeric and spelled output, approval of the basic-triad plan, and explicit implementation request. See the [triad effort](../plans/basic-triad-construction.md).

## D041: Seventh chords from explicit root and quality

Status: Superseded by [D044](#d044-seventh-formulas-and-suspended-structures). Historical contract retained below.

Decision: Export SeventhChordQuality, seventhChordPitchClasses(root: PitchClass, quality: SeventhChordQuality): readonly PitchClass[], and seventhChordNoteSpellings(root: NoteSpelling, quality: SeventhChordQuality): readonly NoteSpelling[] from a separate portable seventh-chords module. Require both arguments and return exactly four tones in root-third-fifth-seventh role order, without bass, register, inversion, or voicing semantics. Numeric results wrap modulo twelve without sorting.

Catalog: Exact identifiers are major-seventh, dominant-seventh, minor-seventh, half-diminished-seventh, diminished-seventh, minor-major-seventh, augmented-major-seventh, and augmented-seventh. They combine major/major-7, major/minor-7, minor/minor-7, diminished/minor-7, diminished/diminished-7, minor/major-7, augmented/major-7, and augmented/minor-7 respectively. Here the first term names the triad quality; the seventh is a root-relative role, retaining its letter even when enharmonic to another interval. No symbols, aliases, or implicit seventh convention are accepted.

Rationale: One private definition table composes existing triad constructors and a seventh DegreeFormula, avoiding duplicated triad/spelling rules and unrelated scale constraints. C diminished seventh retains B-double-flat rather than A; the two augmented variants explicitly distinguish major and minor sevenths. Some representable triads require an unsupported seventh: G-triple-sharp major seventh and C-double-flat diminished seventh are rejected, while G-triple-sharp dominant seventh fits without requiring a whole major scale.

Consequences: Preserve typed numeric/spelled root boundaries and existing public signatures. Unknown qualities, including inherited-property names, and required accidentals beyond +/-3 throw RangeError without fallback, omission, or partial output. Numeric output is independent of spelling limits. Return fresh readonly-by-type arrays and note objects without runtime freezing or input mutation, using only sibling domain dependencies. Existing triad implementation and completed plans remain unchanged.

Broader chord extensions, symbol parsing, identification, harmonization, registered output, inversions, voicing, Fretboard, Playability, UI, AI, and dependencies remain outside this increment. The deferred error-classification trigger remains open. Earlier seventh-chord exclusions describe preceding increments; these eight constructions are now implemented.

Recorded: 2026-10-21. Authority: User's eight-quality selection, approval of the seventh-chord plan, and explicit implementation request. See the [seventh-chord effort](../plans/seventh-chord-construction.md).

## D042: Shared chord formulas with unregistered compound roles

Status: Accepted. Additive foundation using D036 conversion and D039 accidental limits.

Decision: `chordPitchClasses(root, formula)` and `chordNoteSpellings(root, formula)` resolve nonempty custom `ChordFormula` arrays. Each readonly role has a positive safe-integer `number` and an `Accidental` alteration (-3..3). Compound numbers remain distinct in formulas but reduce to simple roles only for resolution through existing degree converters; 2 and 9 therefore share pitch class and spelling without specifying octaves. Preserve order, duplicate roles and enharmonic collisions, with no root or third requirement. Malformed formulas and unrepresentable required spellings throw `RangeError`. Numeric construction remains independent of spelling limits; inputs are preserved and outputs are independent and readonly by type, without runtime freezing.

Rationale: Role identity is distinct from register and sounding equivalence. A chord-specific number supports arbitrary compound roles without widening DegreeFormula or duplicating pitch and spelling rules. No named catalog or universal chord representation is required for custom formulas.

Consequences: Export ChordDegreeFormula, ChordFormula and the two resolvers from the existing chord folder. Keep simple-degree APIs and notation unchanged. Root inputs retain their typed boundary; role arrays and fields receive runtime validation. No parsing, identification, omissions, realization or instrument/application integration is added.

Recorded: 2026-10-26. Authority: User approval and explicit implementation request for the shared chord roadmap. See the [foundation effort](../plans/shared-chord-formulas.md).

## D043: Triad formulas and suspended structures

Status: Accepted. Replaces D040; preserves its four qualities, constructors, typed roots, exact spelling/error behavior and output isolation.

Decision: Add triadFormula(quality): ChordFormula returning independent arrays and role objects. TriadQuality includes major, minor, diminished, augmented, sus2 (1/2/5) and sus4 (1/4/5). Suspended entries are three-tone structures rather than tertian triads; no third is required. Both existing constructors resolve the selected formula through D042.

Rationale: One formula catalog supports direct inspection and composition by later chord families, without category-specific arithmetic or spelling.

Consequences: Retain unsupported-quality RangeError, exact spellings through +/-3, numeric independence, no input mutation, readonly-by-type results and no runtime freezing. Preserve current folders and historical plans. No realization, symbols, inference or dependencies are added.

Recorded: 2026-10-26. Authority: Approved chord roadmap and explicit implementation request. See the [triad adaptation](../plans/triad-formulas-and-suspensions.md).

## D044: Seventh formulas and suspended structures

Status: Accepted. Replaces D041 while retaining all eight previous quality identifiers, constructor signatures, typed roots, error/spelling rules and output isolation.

Decision: Add seventhChordFormula(quality): ChordFormula, composing independent triadFormula roles and a copied seventh role. Add dominant-seventh-sus2 (1/2/5/flat-7) and dominant-seventh-sus4 (1/4/5/flat-7). Both constructors resolve the formula through D042 instead of composing constructed tones.

Rationale: Shared role composition avoids parallel construction logic and preserves suspended letter identity.

Consequences: Ten qualities return four formula-ordered tones, with no bass, register or voicing semantics. Preserve readonly-by-type independent results, numeric independence, RangeError and exact spellings within +/-3. No parsing, inference or dependencies are added.

Recorded: 2026-10-26. Authority: Approved chord roadmap and explicit implementation request. See the [seventh adaptation](../plans/seventh-formulas-and-suspensions.md).

## D045: Added-tone and sixth chord formulas

Status: Accepted. Additive catalog using D042/D043.

Decision: `added-tone-chords.ts` exports `AddedToneChordQuality`, `addedToneChordFormula`, `addedToneChordPitchClasses` and `addedToneChordNoteSpellings`. Seven qualities are major-add2 (1/3/5/2), major-add9 (1/3/5/9), minor-add9 (1/flat-3/5/9), major-add11 (1/3/5/11), major-sixth (1/3/5/6), minor-sixth (1/flat-3/5/6) and major-sixth-ninth (1/3/5/6/9). Compose independent triad formulas with copied added roles; all actual pitch/spelling construction uses D042. No seventh is implied, and add2/add9 retain distinct role numbers without implying register.

Rationale: Added tones retain the underlying third, distinguishing additions from suspensions, and omit the seventh present in named extensions.

Consequences: Preserve typed roots, independent readonly-by-type unfrozen formulas and outputs, exact spelling through +/-3, numeric independence and RangeError for unknown qualities or required unrepresentable spellings. No symbol parser, inference, omissions or realization is introduced.

Recorded: 2026-10-26. Authority: Approved chord roadmap and explicit implementation request. See the [added-tone effort](../plans/added-tone-chord-construction.md).

## D046: Complete named extended chord formulas

Status: Accepted. Additive catalog using D042 and D044.

Decision: `extended-chords.ts` exports `ExtendedChordQuality`, `extendedChordFormula`, `extendedChordPitchClasses` and `extendedChordNoteSpellings`. Dominant, major and minor ninth/eleventh/thirteenth qualities compose their corresponding seventh formulas with roles 9, 9/11, or 9/11/13. These are complete theoretical constructions, retaining the third and natural eleventh rather than applying voicing omissions. Formula roles do not specify register; formula retrieval and constructed outputs remain independent and readonly by type.

Rationale: Shared seventh-role composition makes complete chord identity inspectable independently of practical tone selection and guitar realization. Major extensions use major triads and major sevenths; minor extensions use minor triads and minor sevenths; all unaltered ninths/elevenths/thirteenths are major/perfect-relative.

Consequences: Preserve all existing root/quality and spelling/error conventions, including +/-3 final accidentals, numeric independence, no partial output, no input mutation and no runtime freezing. No symbol parsing, omission rules, register, voicing or new dependencies are added.

Recorded: 2026-10-26. Authority: Approved chord roadmap and explicit implementation request. See the [extended-chord effort](../plans/extended-chord-construction.md).

## D047: Five selected altered extended constructions

Status: Accepted. Additive extension of D046.

Decision: Five selected alterations extend the same ExtendedChordQuality catalog: dominant-flat-ninth (1/3/5/flat-7/flat-9), dominant-sharp-ninth (1/3/5/flat-7/sharp-9), dominant-sharp-eleventh (1/3/5/flat-7/9/sharp-11), dominant-flat-thirteenth (1/3/5/flat-7/9/11/flat-13), and major-sharp-eleventh (1/3/5/7/9/sharp-11). Each private definition replaces one extension in an existing complete formula, without retaining its natural counterpart. Dominant-flat-thirteenth retains natural 11. All fourteen extended qualities share the same three public APIs and D042 tone resolver; no public alteration-composition API is added.

Rationale: A small named catalog handles the selected constructions while custom formulas independently support arbitrary valid roles and alterations. Deriving each altered formula from a base avoids duplicated seventh and extension definitions.

Consequences: Preserve complete formula order, exact role letters, +/-3 final accidental limits, typed roots, independent readonly-by-type outputs and numeric independence. No natural counterpart is silently appended, and no omission or realization rule is inferred. Invalid selectors and required unrepresentable spellings retain RangeError behavior.

Recorded: 2026-10-26. Authority: User-confirmed five formulas, approved chord roadmap and explicit implementation request. See the [altered-extension effort](../plans/altered-extended-chord-construction.md).

## D048: Seven-note collection harmonization

Status: Accepted. Additive capability using D036 and D042-D044.

Decision: Derive tertian triads and seventh chords on one degree or all seven degrees of existing seven-note collections. `HarmonizableCollection` excludes the two pentatonic identifiers and includes existing `MinorMode` descriptors. Require an explicit triad/seventh kind. Export formula, numeric and spelled selected-degree helpers plus full-sequence counterparts from `scale-harmonization.ts`. Results carry degree, kind, exact root-relative formula and a required quality field containing an existing triad/seventh identifier or undefined. Numeric/spelled results additionally carry root and ordered tones; discriminated kinds narrow quality types.

Rationale: Alternate collection positions with octave continuation determine third/fifth/seventh roles independently of a named chord catalog. Existing degree helpers supply collection roles and roots, while shared chord resolvers own tone construction. Exact catalog-formula matching supplies useful labels without making names a prerequisite or introducing general chord identification.

Consequences: Return seven entries in collection-degree order for full sequences. Minor-mode descriptors use their own supplied tonic and distinguish rotation degree from chord degree. Ascending melodic-minor collections stay fixed. Selected spelling checks only requested chord tones; full spelling rejects any unavailable required tone without partial output. Preserve +/-3 accidental limits, numeric independence, typed tonic boundaries, RangeError for invalid selectors/degrees/kinds or unrepresentable required output, and fresh readonly-by-type unfrozen results. No symbols, Roman numerals, harmonic function, custom/pentatonic harmonization, register, inversions, guitar rules, UI, AI or dependencies are introduced.

Recorded: 2026-10-26. Authority: User selected both query forms and formula/quality output, then explicitly requested implementation of the approved plan. See the [harmonization effort](../plans/scale-harmonization.md).

## D049: Structured chord descriptions with specified bass

Status: Accepted. Additive contract using D042, integrated with D043-D048.

Decision: Export readonly numeric and spelled chord descriptions containing required root/formula and optional specified bass. `createPitchClassChordDescription` and `createSpelledChordDescription` validate and copy formulas and supplied spellings without resolving derived tones. `chordDescriptionPitchClasses` accepts either representation; `chordDescriptionNoteSpellings` requires spelled input. Both resolve only formula tones through existing low-level capabilities, preserving order, compound roles, duplicates and enharmonic roles. Named constructors and harmonization use these descriptions internally with unchanged APIs and returned values.

Rationale: A small root/formula contract connects existing construction to later symbols and realization without making a quality label, registered bass, voicing or fingering part of musical identity. Optional bass expresses intent: missing bass means unspecified, and explicit root bass or non-chord bass is retained separately without changing the construction formula.

Consequences: Export shared `validateChordFormula(formula): void` from the formula module, preserving its nonempty-array, positive safe-integer role-number, +/-3 alteration and sparse/malformed-input RangeError rules. Root and bass retain typed input boundaries. Factories omit bass for undefined arguments, copy all musical fields and return unfrozen readonly-by-type descriptions. Derived spelling limits apply only during spelled tone resolution; numeric resolution of spelled descriptions remains independent of those limits. Do not infer or append bass, reorder tones, normalize roles, infer qualities, or select register/voicing. Dependency direction is named construction to descriptions to low-level formulas, without reverse imports or new dependencies.

Symbols, inversion/bass-membership analysis, registered realization, omissions, identification, guitar rules, UI and AI remain outside this increment. Actual sounding bass continues to mean lowest registered pitch.

Recorded: 2026-10-26. Authority: User selected both representations, the shared construction path and deferred derived spelling checks, then explicitly requested implementation of the approved plan. See the [description effort](../plans/structured-chord-descriptions.md).

## D050: Bounded chord-symbol grammar and canonical formatting

Status: Accepted. Additive notation adapter over D042-D049.

Decision: Export parseChordSymbol(text): SpelledChordDescription and formatChordSymbol(description, notation = unicode) from chord-symbols.ts. Use private exhaustive suffix tables backed by existing formula getters for all 37 named qualities, with the six aliases documented in the [complete grammar](ARCHITECTURE.md#chord-symbol-grammar). Root/bass reuse existing uppercase note spelling and accidental tokens, suffixes are case-sensitive, outer whitespace is trimmed and internal whitespace rejected. Support optional terminal note slash bass while retaining 6/9 as a complete suffix.

Rationale: A bounded notation vocabulary connects musician-readable symbols to existing structured intent without adding musical construction rules or a general alteration language. Canonical 9(#11)/maj9(#11) makes the catalog's included ninth explicit. Exact ordered formula matching preserves compound-role, duplicate and enharmonic distinctions rather than inferring identity from pitch classes.

Consequences: Parse canonical suffixes and only sus, 7sus, °, °7, ø7 and 7(#5) aliases, including Unicode single accidentals in the defined suffix positions. Unicode output is default; ASCII is explicit. Preserve root/bass spelling and explicit root/non-chord bass, normalize aliases and natural tokens, and keep bass separate from formula tones. Parsing and formatting do not resolve tones or impose derived spelling limits. Unsupported/malformed input symbols throw SyntaxError. Formatting malformed/unmatched formulas or invalid notation throws RangeError; supplied spellings retain typed boundaries and numeric-only descriptions are excluded. No public suffix registry, new dependencies, changed constructors or harmonization APIs, or reverse dependencies are introduced.

Arbitrary custom symbols/alterations, omissions, polychords, Roman numerals, register, inversion analysis, voicing, identification, guitar behavior, UI and AI remain outside this increment. Reference examples illustrate broader conventions and do not implicitly expand the parser grammar.

Recorded: 2026-10-26. Authority: User selected small aliases, Unicode default, exact formulas and canonical sharp-eleventh symbols, then explicitly requested implementation of the approved plan. See the [symbol effort](../plans/chord-symbols.md).

## D051: Explicit registered voicings and root-position realization

Status: Accepted. Additive realization capability using D021, D036, D042 and D049.

Decision: Export numeric/spelled voicing records containing explicit nonempty registered tone lists, with validating copy factories. Preserve supplied order, repeated tones, enharmonic spellings and negative registers. Add rootPositionChordRegisteredPitches(description, root) and rootPositionChordRegisteredNotes(description, root), requiring an explicit registered root matching the description, an unaltered formula role 1, and no formula tone below the anchor. Preserve full role distances, formula order and duplicates; do not insert a missing root, sort output or adjust octave placement. Numeric construction accepts either description representation; spelled construction requires exact root spelling.

Rationale: Supplied musical data and a narrow deterministic construction provide registered pitches for later analysis and realization without selecting arbitrary voicings or instrument policies. Root-relative role 2 and compound 9 share pitch class but map to different registers. Written octave belongs to the note letter, preserving B-sharp/C-flat crossings and exact diminished-seventh roles.

Consequences: Reject incompatible specified bass rather than ignore it or generate an inversion. Numeric bass comparison uses pitch classes; spelled comparison requires exact root spelling. C/B-sharp can therefore succeed numerically and reject in spelled construction. Reuse formula/degree/register/spelling capabilities, with exact BigInt intermediate arithmetic and safe displacement/coordinate/octave checks. Numeric realization remains independent of derived spelling limits; spelled realization verifies its coordinates against numeric output. Invalid/empty/sparse voicings, malformed or unsupported root-position formulas, root/bass mismatches and representation limits throw RangeError. Supplied note letters/accidentals retain typed boundaries; arrays and every note are independently copied, readonly by type and unfrozen.

Voicing records do not infer chord identity or validate coverage, omissions, inversion, bass, fingering or playability. Existing constructors, descriptions, symbols and harmonization remain unchanged. Arbitrary voicing generation, richer voicing representations, analysis, identification, Fretboard, Playability, UI, audio and AI remain deferred.

Recorded: 2026-10-26. Authority: User selected explicit nonempty tone lists, both representations, restrictive root-position handling and exact spelled bass matching, then explicitly requested implementation of the approved plan. See the [realization effort](../plans/registered-chord-realization.md).

## D052: Known-chord bass, inversion, and voicing analysis

Status: Accepted. Additive analysis using D042, D049 and D051.

Decision: Export `analyzeRegisteredPitchVoicing` and `analyzeRegisteredNoteVoicing` from `chord-voicing-analysis.ts`. Analyze supplied registered voicings against known descriptions without changing either representation. Numeric matching uses pitch classes and accepts either description representation; spelled matching requires exact letter/accidental independently of octave. `optionalFormulaIndices` explicitly permits omissions by zero-based formula position; every other role is required. Return copied per-position coverage, required/optional omissions, unmatched and unexpected tone indices, allowed specified-bass occurrences, identity doublings, sounding bass, specified-bass agreement, conventional inversion and spacing measurements.

Rationale: Known musical identity and explicit sounding notes are sufficient to describe a voicing without inferring harmony or instrument policy. Formula roles retain their meaning, while equivalent roles may share occurrence evidence. Coverage does not impose the root-position constructor's compound-register convention. Separate unmatched versus unexpected tones permits requested non-chord bass without silently changing chord construction.

Consequences: Bass is the minimum sounding coordinate with every tied original index. Specified-bass agreement requires all lowest tones to match in the selected representation. Only unmatched lowest occurrences matching specified bass are allowed; upper non-chord repetitions remain unexpected. Conventional inversion requires exactly one unaltered role 1 and one each of 3/5, optionally 7, regardless of formula order or catalog name; alterations of roles 3/5/7 are supported. Classification depends on the lowest sounding registered pitch and its matched musical role, not the total number of sounding notes: doublings and voicings with four or more sounding notes do not change a uniquely determined inversion. Suspended and other structures outside these supported three- and four-role tertian patterns retain bass and chord-tone membership analysis without conventional inversion numbering. Extended tertian chords such as C9, C11 and C13 likewise receive no inversion numbering; their inversion-naming conventions remain an [open decision](ARCHITECTURE.md#open-architectural-questions). Unsupported structures, non-chord bass and ambiguous roles/tied spellings are explicit statuses. A non-chord bass such as F-sharp in C/F-sharp is not a conventional inversion. Omissions and unexpected upper tones do not suppress a uniquely determined inversion. Doubling groups all repeated supplied identities, including non-chord identities. Stable sounding order, span and adjacent gaps preserve repeated tones and zero gaps. Invalid formulas, supplied voicings, optional indices/options and unrepresentable distances throw `RangeError`; typed root/spelling boundaries, readonly-by-type independent unfrozen outputs and existing APIs are preserved.

No chord identification, automatic omissions, close/open classification, voicing generation, instrument rules, ergonomic verdict, UI, AI or dependencies are added. Earlier analysis exclusions describe previous increments.

Recorded: 2026-10-26. Authority: User selected optional formula positions, separate numeric/exact-spelled matching, spacing measurements, structural tertian inversions and independent incomplete-voicing analysis, then explicitly requested implementation of the approved plan. See the [analysis effort](../plans/chord-voicing-analysis.md).

## D053: Exact catalog chord identification

Status: Accepted. Additive identification using D043-D049 and D051; D052 inversion limits remain unchanged.

Decision: Export `identifyChordsFromPitchClasses`, `identifyChordsFromNoteSpellings`, `identifyChordsFromRegisteredPitches` and `identifyChordsFromRegisteredNotes` from `chord-identification.ts`. Return every supported root/quality whose complete pitch-class set equals the input, ignoring order, register, spelling and duplicate occurrences. Each candidate has a numeric root/formula description without specified bass and discriminated family/quality metadata. Registered results also return lowest sounding coordinate/class/tied source indices and each candidate's matching bass formula positions. Numeric and spelled inputs use the same pitch-class matching; no root spelling is selected.

Rationale: Exact equality provides a bounded deterministic identification capability while preserving genuine ambiguity such as C6/Am7, add2/add9 and symmetric roots. Observed bass is evidence about supplied notes, distinct from specified-bass intent and contextual harmonic preference. Existing numeric construction remains the authority for catalog membership and existing spelling tools remain explicit presentation choices.

Consequences: Enumerate all 37 qualities at twelve roots using private exhaustive identifier tables and existing formula getters, without a public registry or symbol-layer refactor. Return candidates ordered by numeric root, then family triad/seventh/added-tone/extended, then alphabetic quality identifier, without confidence ranking. Registered adapters validate through existing voicing factories and compare coordinates without computing spacing. Empty/non-array/sparse/missing-entry collections, invalid numeric classes and existing registered limits throw `RangeError`; valid unmatched input returns no candidates while retaining registered bass evidence. Preserve typed spelling boundaries, fresh independently copied readonly-by-type unfrozen results, and all existing APIs. No inferred missing roots, optional omissions, approximate/custom-catalog matching, non-chord slash-bass inference, automatic spelling, inversion status/generation, extended-inversion naming, instrument behavior, UI, AI or dependencies are added. Earlier identification exclusions describe preceding increments.

Recorded: 2026-10-26. Authority: User selected all four input forms, numeric identities and registered bass evidence only, then explicitly requested implementation of the approved plan. See the [identification effort](../plans/chord-identification.md).
