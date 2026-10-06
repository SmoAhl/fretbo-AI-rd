# Simplify domain references for a discrete fretboard


This ExecPlan follows [.agent/PLANS.md](../.agent/PLANS.md). It records the documentation refactoring requested on 2026-10-06.

## Purpose / Big Picture


Give coding agents concise domain knowledge for musical objects, discrete fretboard locations, and practically sensible chord fingerings. Preserve the user's manual deletions. Remove citations, obsolete terminology, and superseded guidance without introducing runtime behavior or speculative requirements.

## Progress


- [x] 2026-10-06T09:11:24Z: Read current instructions, references, architecture, decisions, protocol, and remaining plan; inspected the user's diff and deleted-plan scope.
- [x] 2026-10-06T09:16:17Z: Rewrote the three references around construction rules, discrete mapping, and chord grip validation/ranking.
- [x] 2026-10-06T09:18:27Z: Aligned repository guidance, recorded D019, and condensed the older plan as historical.
- [x] 2026-10-06T09:20:30Z: Checked documentation structure, links, retained calculations, terminology, deleted-plan state, and final diffs; all checks passed.

## Surprises & Discoveries


Manual deletions left source labels and links to removed geometry and example sections. Architecture still linked to the deleted hand-feasibility plan. The remaining plan explicitly says it is outdated but still contains obsolete requirements. The tracked checkout has the application bootstrap and no implemented domain modules.

## Decision Log


2026-10-06, user: model a discrete fretboard and practical chord fingerings; scales and melodies require locations only. Domain references contain the knowledge needed to derive answers, rather than exhaustive answers or earlier investigation history.

2026-10-06, Codex: retain compact scale/mode/chord construction tables and one barre example; remove harmonization result tables and instrument measurements. Preserve candidate-generation ownership and concrete grip/ranking parameters as unresolved implementation choices.

## Outcomes & Retrospective


The three references now express musical content, discrete pitch locations, and practical chord fingering validation/ranking. Their combined word count fell from about 7,430 in the user's edited starting files to about 3,220. Repository guidance agrees with this scope, the older plan is historical, and the deleted plan remains absent. All documentation checks passed; application code and dependencies were unchanged. Concrete grip limits, ranking parameters, and candidate-generation ownership remain undecided.

## Context and Orientation


The user had modified six Markdown files and deleted `plans/playability-hand-feasibility.md` before this task. Those edits are the starting point, not material to restore. `AGENTS.md` owns working instructions; architecture owns responsibilities and implementation status; decisions owns persistent choices. The current task changes documentation only.

## Plan of Work


First, simplify the existing references, preserving required concepts and useful convention distinctions. Then align AGENTS, architecture, README, decisions, and the remaining historical plan. Remove obsolete external attribution from the plan protocol while preserving its workflow. Finally, audit local navigation, Markdown structure, retained domain examples, and the combined diff. Each stage is reviewable without application changes.

## Concrete Steps


Work in `C:\Users\simoa\Documents\fretbo-AI-rd`. Git needs the existing per-command ownership exception:

    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd status --short
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --check
    git -c safe.directory=C:/Users/simoa/Documents/fretbo-AI-rd diff --stat

Use existing Node or PowerShell for temporary documentation checks; do not add tooling or dependencies. Read new files directly because unstaged diffs omit untracked files.

## Validation and Acceptance


Resolve local links and heading anchors, check table columns and whitespace, and scan for remaining citations or obsolete terminology. Recompute retained pitch and construction examples. Confirm the deleted plan stays absent, no application files change, and the three references preserve the requested responsibilities. Application tests and builds are unnecessary for this documentation-only task.

## Idempotence and Recovery


Read and validation commands are repeatable. Preserve existing user changes; amend documents in place without resetting the checkout or restoring deleted files. Recheck status if the working tree changes during the effort.

## Artifacts and Notes


A temporary Node audit passed strict UTF-8 decoding and structural checks across all ten current Markdown files, resolved 69 local links and anchors, and checked 11 tables. It independently recomputed 29 scale, mode, chord, and pitch-mapping rows, plus enharmonic and pentatonic checks. It found no external URLs or reference citations and confirmed the deleted plan was absent. Terminology searches and direct document/diff review found no remaining obsolete domain guidance. `git diff --check` passed. No application tests or builds were run for this documentation-only scope.

## Interfaces and Dependencies


No code interfaces, runtime dependencies, simulations, thresholds, scoring weights, or candidate-generation algorithms are introduced.

Revision note: 2026-10-06, Codex: completed reference simplification, aligned repository guidance, preserved the user's deletions, and recorded successful documentation validation.
