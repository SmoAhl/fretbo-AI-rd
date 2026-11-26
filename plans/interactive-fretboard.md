# Draw and explore a 17-fret guitar neck


This living ExecPlan follows the [planning protocol](../.agent/PLANS.md) and covers milestones 1–2 of the [standalone UI v1 roadmap](../docs/ui/README.md). Documentation is approved. Implementation requires a separate explicit request.

## Purpose / Big Picture


A guitarist will be able to inspect the sound at any location on a six-string neck and compare several locations, including two that sound the same pitch. First review a static drawing that stays legible up to fret 17. Then review the complete path from a click, tap or keypress to a selected location and its note. Subsequent explorer modes belong to separate work.

## Progress


- [x] 2026-11-24T08:54Z — Demonstrated the first slice on `codex/interactive-fretboard` from `7fb4dc6`: the home page heading above one responsive rosewood rectangle.
- [x] 2026-11-24T09:06Z — Adjusted the rectangle to sit centered near the bottom. The heading keeps its original width and top spacing. The space between them grows with the viewport height.
- [x] 2026-11-24T09:51Z — Developer approved the bottom-centered placement. Added six silver strings using physical positions 1–6.
- [x] Developer approved the six strings and their thickness progression.
- [x] Developer approved the ivory nut at x=20–52. Added six tuning labels derived from the configured registered pitches.
- [x] Developer accepted fret wires and tuning labels. UI v1 phone review uses landscape orientation.
- [x] 2026-11-26T08:30Z — Implemented the shared domain label path and the dense review route on `codex/interactive-fretboard`.
- [ ] Milestone 1 — IN PROGRESS. Developer review of the static SVG checkpoint is pending.
- [ ] Milestone 2 — NOT STARTED. Implement free selection and inspection; complete the interaction review with the developer.

## Surprises & Discoveries


The first browser runs stopped during the production build. Turbopack reported a CSS worker connection failure before Playwright created a trace. Preserving the old generated build cache and retrying outside the sandbox with a fresh cache allowed both tests to run.

2026-11-26 — The checked-out baseline `cde6c95` contained the sparse route only. Its hardcoded E♭4 was at B-string fret 5, which sounds E4. The earlier dense results below are historical. Connecting the Fretboard runtime required extending the existing Turbopack aliases for native ESM imports. The first dense browser trace showed the widest text bounds crossing circle edges at the existing size. Reducing the shared marker text from 16 to 15 SVG units resolved the failure. The sandbox browser run left its preview on port 3100. The preview was stopped and the retry used the installed Chromium outside the sandbox.

## Decision Log


2026-11-26, project owner — Show every fret number by default alongside the existing landmark dots. The later review places 0 above the nut. Annotation controls remain future work.

2026-11-26, implementation — The application passes its standard six-string tuning and 17 frets to `createFretboard` once. Tuning labels, sparse location requests and the dense pattern all share Fretboard pitch lookup and Music Theory spelling and formatting. The SVG uses physical string position for rows and addresses markers by string ID and fret. The dense route uses a 920 px minimum landscape board width so full-density labels stay readable with board-local scrolling.

2026-11-25, project owner — UI v1 treats phone use as landscape, as recorded in the UI roadmap. For the current portrait review prototype, tuning text rotates with the fretboard. Adapting the phone workbench and its acceptance checks to landscape remains work for a subsequent authorized slice.

2026-11-24 - Use FINAL_FRET_WIDTH_RATIO = 0.84 for 17 linearly narrowing spaces. Boundaries run from the nut edge at x=52 to the wood end at x=1180. Phone orientation follows the developer request, with the nut above the fretted neck. A bottom-aligned 72dvh vertical scroll area retains readable labels at 0.75 scale. The complete final space is accessible by scrolling.

Deferred follow-up - Label octave number toggle belongs to the later label-preference step and requires that step's implementation authorization.

2026-11-24, project owner: Align the nut with the wood's left edge at x=20 and widen it from 8 to 32 SVG units. The fretted area begins at x=52. Future circular open-string tuning labels belong to the left of the nut.

2026-11-24, project owner: Revisit string spacing and board width once note labels are visible and their clearance can be judged.

2026-11-23, project owner: Use standard tuning and 17 frets plus open strings for UI v1. Earlier board lengths were alternatives. Set the count in the application board configuration.

2026-11-23, project owner: Taper belongs to SVG presentation. Choose the initial taper during implementation and review its actual dimensions and tradeoffs. Readability, touch accuracy and consistent marker size take priority over matching a physical guitar's proportions.

2026-11-23, project owner: Use one keyboard tab stop and retain each selection's physical identity. This makes 108 locations navigable and allows independent selections on the same string or at the same sounding pitch.

## Outcomes & Retrospective


2026-11-26 — Moved 0 above the nut and raised the number row, using 18 SVG unit bold text and added space inside the desktop scroll container. `npm run test:e2e -- e2e/home.spec.ts` passed 7 tests in 22.9 seconds with installed Chromium outside the sandbox. `npm run typecheck` and `git diff --check` passed. The sandbox could not launch Chromium and its preview was stopped before the successful run. Updated dense screenshots at `.local/neck-review/dense-1280-start.png`, `dense-844-start.png` and `dense-844-end.png` await visual review.

2026-11-26 — Added fret numbers 0–17 in all three static views, centered from the open column and existing wire boundaries. The row scrolls with the board. The first browser runs found text-bound alignment differences and clipping above the scroll area; the row was positioned and sized to fit. `npm run test:e2e -- e2e/home.spec.ts` passed 7 tests in 32.8 seconds using installed Chromium outside the sandbox. `npm run typecheck` and `git diff --check` passed. Dense review captures are `.local/neck-review/dense-1280-start.png`, `dense-844-start.png` and `dense-844-end.png`. Milestone 1 awaits visual approval.

2026-11-26 — Open locations now share one persistent domain-derived tuning label per string. Sparse activates the two outer labels and dense activates all six; fretted labels start at fret 1. Active labels use the marker background with dark text, while inactive labels retain their dark background and white text. `npm run test:e2e -- e2e/home.spec.ts` passed 7 tests in 25.5 seconds using installed Chromium outside the sandbox. `npm run typecheck` and `git diff --check` passed. The first sandbox browser run could not launch Chromium and left its Next preview on port 3100; it was stopped before the successful run. Screenshots at `.local/neck-review/notes-sparse-1280.png`, `notes-sparse-844.png`, `dense-1280-start.png` and `dense-844-start.png` show the nut area. Milestone 1 remains pending developer review.

2026-11-26 — The current branch renders six regular tuning labels at `/`, eleven markers at `/?review=sparse`, and 108 markers at `/?review=dense`. Sparse B-string fret 4 displays E♭4 and dense displays D♯4 at the same location. Dense B-string fret 5 and high-E fret 17 display E4 and A5. The taper remains 0.84. First and last fret widths are approximately 53.85 and 45.23 CSS px at desktop, and 53.17 and 44.66 CSS px at phone width. The browser measured marker-to-boundary clearances for frets 1, 12 and 17 of 14.97, 12.01 and 10.67 px at 1280 × 800, and 14.78, 11.85 and 10.52 px at 844 × 390. At phone width the board scrolls through 127 px inside a 793 px viewport. Both wires bounding fret 17 are visible at the end and the page has no horizontal overflow. The developer checkpoint remains open.

Current review screenshots are `.local/neck-review/dense-1280-start.png`, `dense-844-start.png` and `dense-844-end.png`. The source changes are in `app/page.tsx`, `app/note-label-data.ts`, `app/note-label-layout.ts`, `app/sparse-note-fixture.ts`, `app/fret-wire-layout.ts` and `next.config.ts`. Coverage is in `tests/note-label-layout.test.ts`, `tests/fret-wire-layout.test.ts` and `e2e/home.spec.ts`. `docs/ARCHITECTURE.md`, `docs/STATUS.md` and `docs/ui/README.md` describe the static workbench's current responsibilities and milestone status.

Current verification passed on 2026-11-26. `npm test -- tests/note-label-layout.test.ts tests/fret-wire-layout.test.ts` passed 3 tests, including a board with IDs out of physical order. `npm run test:e2e -- e2e/home.spec.ts` passed 7 Chromium tests in 20.7 seconds using the installed Playwright browser outside the sandbox. `npm run typecheck` and `git diff --check` passed. Inspected the desktop capture and both phone captures at browser zoom 100%.
2026-11-25 — Added a second review-only route, `/?review=dense`, with 108 static labels covering open strings and frets 1–17 on all six physical rows. The normal page remains empty of note markers and `/?review=sparse` is unchanged. Dense review keeps the sparse marker size and gives the board a 920 px minimum width in a contained horizontal scroller below desktop width. At 1280 × 800, the scroll area measured 932/932 px (scroll/client); at landscape 844 × 390 it measured 920/793 px and reached fret 17 at scrollLeft 127 px. At normal zoom, circles measured 22.40 px desktop and 22.12 px phone; text bounds measured 16 px at both sizes. Text-to-wire clearance for frets 1/12/17 on the two outer strings measured 18.62/16.44/13.54 px desktop and 18.27/16.14/13.35 px phone. Browser assertions found no overlapping note circles, text overflow from circles, or labels clipped by the SVG; phone labels outside the initial horizontal viewport were reachable by board-local scrolling, with no page-wide overflow. The first dense E2E attempt exposed a test-boundary mistake for fret 0 (using the nut's right edge instead of its left edge); the retained trace was inspected, the assertion corrected, and the final run passed. `npm test -- tests/note-label-layout.test.ts` passed (2 tests), `npm run test:e2e -- e2e/home.spec.ts` passed (6 tests), `npm run typecheck` and `git diff --check` passed. Screenshots at normal browser zoom: `.local/neck-review/dense-1280.png`, `dense-844-start.png` and `dense-844-end.png`. Milestone 1 and its visual checkpoint remain pending developer review.

2026-11-26 — Repository UI guidance clarified that the workbench and review fixtures derive displayed musical and instrument facts through Music Theory and Fretboard using one shared board configuration. Fixtures choose locations or density. The UI mentor skill and UI roadmap own this workflow rule.

2026-11-25 — Added an opt-in sparse note-label review fixture at `/?review=sparse`; the normal `/` remains free of note markers. Eleven static labels cover open strings and frets 1, 3, 5, 12 and 17 on the outer strings, including E♭4. Locations use physical string rows and shared fret boundaries; open notes use the center of the dedicated open-string column. The fixture hides the regular tuning labels while active so its two open-string examples do not overlap them. At 1280 × 800, circles measured 22.40 CSS px and text boxes 16.00 px; minimum boundary clearance was 4.48 px overall, with frets 1/12/17 at 14.97/12.01/10.67 px. At landscape 844 × 390, circles measured 14.77 px and text boxes 10.00 px; minimum boundary clearance was 2.70 px overall, with frets 1/12/17 at 9.62/7.67/6.78 px. Inspected empty and sparse screenshots at both sizes. `npm test -- tests/note-label-layout.test.ts` passed (1 test), `npm run test:e2e -- e2e/home.spec.ts` passed (5 tests), `npm run typecheck` passed and `git diff --check` passed. The first sandbox browser launch could not find Chromium; rerunning the same E2E command outside the managed sandbox used the installed browser and passed. Screenshots: `.local/neck-review/notes-empty-1280.png`, `notes-sparse-1280.png`, `notes-empty-844.png` and `notes-sparse-844.png`. Visual approval is pending.

2026-11-25 — Added warm landmark dots at frets 3, 5, 7, 9, 12, 15 and 17, centered from the shared fret boundaries. Single dots sit at the midpoint of strings 3 and 4. At fret 12, the pair sits on strings 2 and 5 per developer direction. Dots use r=7 SVG units, leaving visible clearance from the middle strings. The open-string and landmark circles now have distinct data attributes so tests and future code can select each purpose explicitly. Inspected desktop 1280 × 800 and landscape phone 844 × 390 screenshots. `npm run test:e2e -- e2e/home.spec.ts` passed all 4 tests in 20.2 seconds, `npm run typecheck` passed, and `git diff --check` passed. Screenshots are .local/neck-review/landmarks-final-1280.png and landmarks-final-844.png. Visual review is pending.

2026-11-25 — Rotated tuning text with the portrait fretboard and inspected the 390 × 844 screenshot. All 3 home browser tests passed in 20.3 seconds, including text orientation; typecheck passed. UI v1 landscape phone use is documented in the roadmap.

2026-11-25 — Final review checks passed. The focused Vitest test passed (1 test), Playwright passed all 3 home tests in 19.7 seconds, and typecheck passed. Desktop checks cover all wire extents; phone checks cover upright label alignment and the complete final fret after vertical scrolling. Inspected retained traces for stroke-bounds assertion failures and corrected measurements to use line center geometry. Removed stray JSX text from the intermediate edit. Final screenshots are .local/neck-review/final-1280.png, final-390.png and final-phone-end.png. The phone scroll area ends 4 CSS px above the viewport bottom. Visual approval remains pending.


2026-11-24 - Corrected the missing nut-side boundary, final wire placement and phone orientation. The earlier scroll failure was caused by the test scrolling to the end before asserting an initial scroll position of zero. Separate desktop and portrait assertions now verify the correct axes and access to the entire final space. Chromium passed 3 tests in 17.3 seconds; typecheck and the focused Vitest case passed. Developer visual approval is pending.

Rendered fret widths for 1, 12 and 17 were 53.85 / 47.92 / 45.23 CSS px at 1280 - 800 and 54.09 / 48.14 / 45.44 CSS px at 390 - 844 (measured vertically). A temporary browser-only SVG width giving a 1071 CSS px fretted span produced 68.47 / 60.94 / 57.52 px, matching the requested approximate references. Screenshots are stored locally in .local/neck-review/frets-1280.png, frets-390.png and frets-phone-end.png.

2026-11-24 — Inspected the complete tuning column at normal zoom. At 1280 × 800 the font, circle diameter and row spacing measured 13.44, 22.40 and 23.89 CSS px. At 390 × 844 they measured 13.27, 22.12 and 23.59 CSS px. A 920 px minimum SVG width retains phone legibility. The board scrolls locally from the labels to the far edge. Desktop wood placement is preserved by widening the viewBox equally on both sides and increasing the desktop SVG width proportionally. The initial 936 px minimum caused a 4.16 px desktop gutter mismatch in the Playwright trace. After correction both Chromium tests passed in 17.4 seconds and typecheck passed.

2026-11-24 — Revised nut placement awaits visual approval. The nut measured 23.89 CSS px wide at 1280 × 800 and 9.77 CSS px at 390 × 844. The wood and nut shared their left edge and all six strings crossed the nut. Both Chromium tests passed in 16.5 seconds and typecheck passed.

2026-11-24 — Adjusted the six non-scaling silver strokes from 1 px at high E to 3.5 px at low E in 0.5 px steps. Captured the development preview at 1280 × 800 and 390 × 844. Both Chromium tests passed in 18.0 seconds and typecheck passed. The developer approved the strings.

2026-11-24 — Added the warm ivory nut from x=101 to x=109. Inspected desktop (1280 × 800) and phone (390 × 844) screenshots. Chromium verified the computed fill, flush top and bottom edges, and each string as the topmost shape at its crossing. The existing placement and string checks passed. `npm run test:e2e -- e2e/home.spec.ts` passed both tests in 18.0 seconds. `npm run typecheck` passed.

2026-11-24T09:51Z — Inspected full-page screenshots at 1280 × 800 and 390 × 844. Both show six separate strokes across the wood. The five gaps are 32 SVG units and the outer string centers are 20 units from the wood edges. `npm run test:e2e -- e2e/home.spec.ts` passed both Chromium tests in 17.3 seconds, including the existing placement checks. `npm run typecheck` passed. The initial production build failed resolving a domain runtime import before browser startup. The static drawing now uses the domain string type directly.

2026-11-24T08:54Z — `npm run test:e2e -- e2e/home.spec.ts` passed both Chromium tests in 24.9 seconds. The resize check found the whole rectangle within the viewport at both sizes and verified its bounds against the viewBox within half a CSS pixel. `npm run typecheck` passed. The development preview returned HTTP 200 at `/` with the title FretboAIrd.

2026-11-24T09:06Z — Placement review: `npm run test:e2e -- e2e/home.spec.ts` passed both Chromium tests in 14.0 seconds. Increasing height from 800 to 920 at width 1280 moved the rectangle down 120 CSS pixels while preserving its width and bottom gap. At phone width the heading and whole rectangle were visible with equal 17.83 px side gutters and zero horizontal overflow. `npm run typecheck` passed after the overflow assertion was updated to read the root element through a Playwright locator.

## Context and Orientation

At planning time `app/page.tsx` is a placeholder, with layout and styling in `app/layout.tsx` and `app/globals.css`. [D014–D018](../docs/DECISIONS.md#d014-react-for-application-ui-and-interaction) establish React, Next.js, generic controls and custom SVG in one application package. The [architecture](../docs/ARCHITECTURE.md) keeps musical and instrument rules independent of that stack.

The nut is the boundary before fret 1. Position 0 represents a sounding open string. In standard tuning strings 6 to 1 sound E2, A2, D3, G3, B3 and E4. Display string 1 (high E) at the top and the nut on the left. A fret space is the area between adjacent wires, with the nut serving as the first boundary. Each of six strings has 18 locations, giving 108 distinct string/fret addresses.

## Plan of Work


**Milestone 1 — Landscape SVG foundation.** Keep the page shell and render the board using explicit board data and supplied marker fixtures. Draw a dark rosewood-inspired neck, metallic strings and fret wires, open-string column headed 0, readable tuning labels and fret annotations (numbers above the spaces, landmark dots, or off). Derive rows from physical string positions. Keep IDs for addressing. Put example markers in review fixtures so the ordinary entry view can start empty.

Make spacing configurable in presentation code. Establish enough width at the narrowest fret for the widest supported label (including accidental and octave), clearance and an adequate touch target. Choose a gentle progressive taper working back toward fret 1. Calculate wire boundaries once and place each marker at the midpoint of its space. Use the corresponding full string/fret cell for targeting. Keep marker diameter and label size consistent. Provide a minimum readable board width and horizontal scroll on smaller screens. The open column has its own center and target.

**Checkpoint 1 — before starting interaction.** Show the developer an empty board, sparse open/edge markers and a dense fixture. At frets 1, 12 and 17 compare label clearance, centers and target boundaries on desktop and at phone width. Walk from one input location through its wire coordinates to its rendered marker and hit area. Report the chosen taper, first/last fret widths and the observed tradeoff between guitar proportions, readability, touch targets and scrolling. Record feedback and resolve or explicitly agree on any change before starting milestone 2.

**Milestone 2 — Free selection and inspection.** Add client-side selection state, Clear selection and an inspector listing string, fret, note and octave. Toggle by string ID and fret. Permit multiple selections per string and distinct locations for one registered pitch. Use the entire cell even where there is no marker. Draw focus and selection independently. Clear removes all manual selections; later generated overlays will have their own state.

Use roving tabindex: one location has tabIndex 0 and the other 107 have -1. Tab and Shift+Tab enter or leave the board. Left/right move one fret including the open column, up/down move to the adjacent physical string, and movement stops at the edges. Moving focus alone preserves selections. Reveal the entire newly focused cell when it leaves the visible area. Enter and Space toggle exactly once. Give locations accessible names and expose their selection state even when markers have no visible text.

**Checkpoint 2 — before later explorer work.** Show pointer, touch and keyboard operation on desktop and a narrow viewport. Trace one cell event through domain lookup to selection state and the inspector. Explain the check protecting physical identity, capture the developer's observations and record any outstanding verification. Later milestones need their own implementation scope.

## Concrete Steps


For future authorized implementation, work at the repository root with Node 24.x and the project's npm dependencies available. Inspect `git status --short --branch` and relevant work before editing. Create a feature branch such as `codex/interactive-fretboard` from the agreed main revision (or resume its existing reviewed state). Compare any requested visual alternatives using identical fixtures and viewport sizes.

Develop milestone 1, then run focused geometry tests with the existing Vitest runner (`npm test -- <actual-test-path>`, substituting the path created during implementation). Use `npm run dev` and the local URL it prints for checkpoint 1. After that review, develop milestone 2, run its focused selection tests and check the interaction in the browser. Run `npm run typecheck` and `npm run build` to verify integration. Expected results are passing assertions and successful checks; record actual commands and outcomes when run.

## Validation and Acceptance


For milestone 1, use a fixture with nonsequential IDs whose ID order differs from physical order. Check correct rows, monotonically narrowing spaces, centered markers, visible final wire and open tuning with and without markers. Inspect both outer strings and the dense accidental-plus-octave cases at frets 1, 12 and 17. On a phone-width viewport verify scrolling reaches the complete final cell while preserving label and marker size.

For milestone 2, toggle open high E and B-string fret 5 independently: both inspectors' entries must read E4. Select two frets on one string and clear. Select high E at fret 17 and expect A5. Check mouse and touch at frets 1, 12 and 17 with the dense fixture, including adjacent-cell accuracy. Toggle an unmarked location. Starting outside the board, Tab in, arrow to an offscreen fret 17, verify scrolling and focus, toggle with Enter and Space and Tab out in one step. Repeat in reverse with Shift+Tab. Confirm focus movement preserves the selected set. Record how touch was checked and distinguish emulation from a real device.

## Idempotence and Recovery


Fixtures are deterministic and free selection is session-local. Reload for the empty starting state and repeat the same inputs. If taper changes move a marker or shrink its target, adjust the shared cell geometry and repeat the same fixture comparisons before continuing. Resume from recorded progress and the reviewed branch diff; preserve user edits.

## Artifacts and Notes


Before the placement adjustment, the SVG measured 624 × 124.80 CSS pixels at 1280 × 800 and 342 × 68.39 at 390 × 844. The original phone screenshot is preserved at `.local/neck-review/initial-390x844.png`.

For the placement review, the local production preview returned HTTP 200. Full-page screenshots are in `.local/neck-review/layout-<width>x<height>.png`. At 1920 × 920 the visible rectangle measured 1299.18 px wide with a 26.40 px bottom gap. At 1280 × 800 it measured 866.07 px with an 18.93 px gap. At 390 × 844 it measured 354.34 px with a 10.11 px gap.

## Interfaces and Dependencies


Use `createFretboard` and `registeredPitchAtLocation(board, { stringId, fret })` from [Fretboard](../domain/fretboard/fretboard.ts). Use existing [Music Theory spelling and register operations](../docs/MUSIC_THEORY_V1.md) to name the pitch with octave. The application supplies explicit instrument data, owns selected locations and coordinates lookup. The board receives string/marker data, draws by physical position, maintains keyboard focus and emits locations. Keep pitch arithmetic out of SVG. Playability search, server operations and new public engine interfaces are unnecessary for this workflow.

Revision note: 2026-11-23 — Recorded the approved foundation and selection plan for later implementation and collaborative review.

Revision note: 2026-11-24 — Recorded the first visible slice and its browser checks for developer review.

## Proposed implementation prompt


```text
When explicitly authorized, implement milestones 1–2 following
plans/interactive-fretboard.md, its acceptance criteria and AGENTS.md.
Use a feature branch. Deliver the 17-fret landscape SVG, then free
selection, inspection and accessible keyboard, mouse and touch operation.
Preserve domain ownership, a configurable gentle taper, readable markers
and usable targets through fret 17. Review the static fixtures and taper
with the developer before interaction work. Review the location-to-pitch
walkthrough and actual browser results before any later explorer work.
Complete relevant checks, affected documentation and completion reporting.
Leave all subsequent roadmap milestones for separate authorization.
```
