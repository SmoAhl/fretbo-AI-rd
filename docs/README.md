# Documentation

Use this index to find the document that owns the information you need. [Project overview and setup](../README.md) are at the repository root.

## Reading paths

| Task | Start here | Continue with |
| --- | --- | --- |
| Understand what works today | [Project status](STATUS.md) | The relevant engine contract below. |
| Learn the implementation | [Onboarding](onboarding/README.md) | Its algorithm chapters and [worked examples](onboarding/end-to-end-examples.md). |
| Use a domain capability | [Music Theory](MUSIC_THEORY_V1.md), [Fretboard](FRETBOARD_V1.md), [Playability](PLAYABILITY_V1.md) | Linked implementation and tests. |
| Understand musical or instrument rules | [Music Theory Reference](MUSIC_THEORY_REFERENCE.md), [Fretboard Reference](FRETBOARD_REFERENCE.md), [Playability Reference](PLAYABILITY_REFERENCE.md) | Relevant contract to distinguish knowledge from implemented support. |
| Change a boundary or understand rationale | [Architecture](ARCHITECTURE.md) | Relevant entries in the [decision index](DECISIONS.md#topic-index). |
| Implement or review a change | [Working instructions](../AGENTS.md) | Owning contract/reference, relevant decisions, source/tests and any active plan. |
| Resume or investigate an effort | [Plan index](../plans/README.md) | That effort's progress and evidence; current contracts for subsequent changes. |

For a quick human introduction, read status, architecture, then one complete worked example. For an AI task, select the relevant rows and sections rather than loading every document.

## Documentation ownership

| Document | Maintained responsibility |
| --- | --- |
| Root README | Product introduction, setup and entry points. |
| This index | Navigation and the ownership map. |
| [Status](STATUS.md) | Current project capability overview, missing areas and known follow-ups. |
| [Architecture](ARCHITECTURE.md) | System responsibilities, dependency direction, cross-layer data and open architectural questions. |
| Engine v1 guides | Current supported APIs, guarantees, limits and consumer handoffs. The v1 label bounds capability; these are maintained guides, not frozen snapshots. |
| Domain references | Domain definitions, construction rules, assumptions and convention distinctions. Coverage does not imply implemented support. |
| Onboarding | Explanations, algorithms and examples that teach the existing implementation. |
| [Decisions](DECISIONS.md) | Accepted persistent choices, rationale and explicit amendment/replacement links. |
| [AGENTS.md](../AGENTS.md) and [plan protocol](../.agent/PLANS.md) | Working rules and the ExecPlan threshold/protocol respectively. |
| Individual plans | Effort-specific context, progress, decisions, dated verification and historical findings. |

## Keeping the foundation trustworthy

Each detailed contract has one maintained home. Other documents may summarize it and link to it; they should not maintain competing specifications or independent status ledgers.

Source and tests establish executable behavior. Accepted decisions establish intended constraints and rationale; engine guides describe supported contracts. If these disagree, inspect the owning implementation and evidence, report the discrepancy, and resolve it within the requested scope. Neither stale prose nor an accidental implementation change silently redefines the accepted contract.

Update the affected contract when behavior changes, status when capability or outstanding work changes, and architecture when boundaries change. Update teaching examples when their behavior changes. Record run-specific counts and environment details in the effort's plan. Historical plans preserve what was known then and do not override current instructions or contracts.

Unresolved questions and deferred possibilities are not approved work. The [documentation ownership decision](DECISIONS.md#d057-maintained-documentation-ownership) records this division.

The [completion-reporting rules](../AGENTS.md#completion-reporting-for-every-task) require every task to make remaining work and next steps visible to the user, with categories, impact and owning locations. Reports link to the existing owners above; read-only tasks report findings without silently editing documents. Required unfinished work remains explicit rather than becoming an optional follow-up.
