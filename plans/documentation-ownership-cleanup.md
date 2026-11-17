# Consolidate documentation ownership and navigation


This plan follows [.agent/PLANS.md](../.agent/PLANS.md). Status: Completed historical effort. Current guidance is maintained in the owning documents.

## Purpose / Big Picture


Make repository documentation a reliable foundation for human readers and AI agents: a short entry point, explicit current contracts, clear architectural boundaries, and separately labeled historical evidence. The user authorized the cleanup recommended in the preceding review on 2026-11-17. Preserve domain knowledge, accepted rationale and unique contract details. Change Markdown only; no domain implementation, dependencies, staging or commits are authorized by this effort.

## Progress


- [x] 2026-11-17T07:42:09Z: Established clean baseline `09b627c`; inspected instructions, protocol, documentation structure and the reference-ID maintenance commit.
- [x] 2026-11-17T07:52:39Z: Consolidated entry points, status, architecture and engine contracts; updated ownership through D057.
- [x] 2026-11-17T07:52:39Z: Archived dated onboarding evidence, labeled 36 completed efforts, indexed decisions/plans and migrated affected links.
- [x] 2026-11-17T07:55:56Z: Validated links/anchors, retained contracts and decision history, unchanged runnable examples, Markdown whitespace and final scope; inspected the four new files directly.

## Surprises & Discoveries


The README still calls Playability unimplemented. Onboarding explains that discrepancy instead of repairing it. Its 2026-11-11 snapshot also predates commit `0f5a256`, which stores explicit reference geometry IDs and adds regression tests. Architecture mixes detailed API contracts with system boundaries. There are 36 existing plans, whose historical scope must not be read as today's backlog.

## Decision Log


2026-11-17, documentation author, under the user's approved cleanup: retain existing engine-guide, reference, decision and plan paths. Move detailed API descriptions from architecture into the engine guides, grouped by subject. Add a documentation index and one current status page. Preserve historical findings and run evidence in their owning plan. Add a persistent documentation-ownership decision because this changes D007's placement of current implementation descriptions. Do not alter musical or software contracts.

## Outcomes & Retrospective


All three milestones are complete. README is 519 words and architecture 1,673 words. The detailed contracts remain available in maintained engine guides with reading maps; onboarding retains teaching examples. Current status, accepted rationale and historical evidence have distinct owners. All 36 original plans are labeled completed history, and this effort is complete. No implementation, dependency, staging or commit changes were made. No cleanup follow-up remains; the existing error-classification and search-oracle recommendations remain visible in status without expanding their scope.

## Context and Orientation


One private Next.js package contains three deterministic domain areas. Music Theory owns musical content; Fretboard owns discrete pitch locations; Playability owns geometry/contact validation, musical assessment and bounded reviewed-pattern search. General solving, ranking and the product UI remain absent. `AGENTS.md` owns working instructions, references own domain knowledge, and accepted decisions explain persistent choices. Existing v1 guides provide consumer contracts; onboarding explains algorithms and examples. Source/tests establish actual behavior; approved contracts and decisions establish intended behavior. Any disagreement must be investigated rather than silently resolved by treating stale prose as executable truth.

## Plan of Work


Milestone 1 establishes the reading path: rewrite the root README, add `docs/README.md` and `docs/STATUS.md`, and simplify architecture while transferring its detailed contracts to the existing v1 guides. Correct present-tense claims against source and the latest maintenance evidence. Verify that unique API details and boundaries survive.

Milestone 2 separates history: preserve the onboarding discrepancy ledger and verification snapshot in its existing plan, remove the superseded onboarding status file, index decisions by topic and plans by activity, and label completed plans historical without rewriting their execution history. Update agent instructions and all affected links, including anchors.

Milestone 3 validates the whole Markdown graph, entry-point size, moved-content coverage, unchanged executable examples, and Markdown-only scope. Inspect new files directly and review diffs. Record actual checks and limitations here.

## Concrete Steps


Work from the repository root. Use `git status --short`, `rg --files`, targeted reads and `git show` to inspect evidence. Use an ephemeral Python standard-library script to check local Markdown links and heading anchors; no checker dependency is installed. Run `git diff --check` and inspect newly created files. Compare fenced TypeScript examples with baseline blobs from `git show HEAD:<path>`; execute examples only if their code changes. Review `git diff --stat` and `git status --short` for Markdown-only scope. Application tests/builds are unnecessary unless executable content or behavior changes.

## Validation and Acceptance


A newcomer can find setup, current scope, contracts, domain knowledge, rationale and history without contradictory instructions. README stays near 400–600 words. All local Markdown destinations and heading anchors resolve. All architecture contract paragraphs are either retained in the appropriate engine guide or deliberately consolidated with equivalent existing content, with evidence recorded below. Historical snapshots are explicitly dated and excluded from current follow-ups. Runnable examples remain unchanged or are revalidated. No production code, configuration or dependencies change.

## Idempotence and Recovery


These are reversible Markdown changes. Inspect diffs before retrying transformations, and never overwrite unrelated user work. Preserve source history and stable decision IDs. No database, external application or runtime migration applies.

## Artifacts and Notes


Baseline README is approximately 3,700 words and architecture 10,500 words. Final audit passed 800 local Markdown links, including 276 heading references, across 59 Markdown files. Fence balance, conflict markers, trailing whitespace and `git diff --check` passed. All 59 moved Music Theory detail blocks were retained; all 56 previous decision bodies/IDs remain intact apart from navigation and explicitly added interpretation notes. Twenty existing TypeScript blocks are unchanged and one README block was relocated unchanged. The diff contains 50 tracked Markdown paths and four new Markdown files; nothing is staged.

Content routing: all Music Theory API prose and chord tables from Architecture are transferred to the Music Theory contract guide under subject headings. The former root README TypeScript example is relocated unchanged. Fretboard details were already covered by its guide (board validation, IDs/positions, strict regions, BigInt bounds, complete ordering/caps and consumer obligations), so duplicate architecture prose was removed. Playability geometry, contact and reference integrity contracts moved to its guide; existing template/search/assessment sections already cover that API. Architecture retains boundaries, data preservation, intended runtime paths, validation principles and open choices. Status owns capability/follow-up lists; the original onboarding plan now owns its discrepancy ledger and historical verification. The three domain references retain their knowledge, with future-engine wording corrected in Playability.

Source-change check: current reference records and regression tests confirm explicit stable IDs. Existing onboarding and Playability TypeScript examples are unchanged (20 fenced blocks); the root README example is retained unchanged in the Music Theory guide. No runnable example code has been edited. Application tests, type checking, production build and runtime example execution were not rerun: source, configuration and example code are unchanged. This validates the documentation migration, not a new full behavioral audit. A strict history-comparison check initially flagged D037 because its destination moved from Architecture to status; review confirmed the navigation-only difference and corrected its label. The final comparison permits navigation changes and explicit interpretation notes while requiring all historical decision prose to remain intact.

## Interfaces and Dependencies


Only documentation paths, heading links and ownership guidance change. Existing public domain APIs, package scripts, dependency versions and test behavior remain intact. Navigation uses ordinary Markdown; no generated documentation framework is introduced.


Revision note: 2026-11-17. Completed the user-authorized documentation cleanup and recorded actual verification; future capability work requires its own scope.
