# Draw and explore a 17-fret guitar neck


This living ExecPlan follows the [planning protocol](../.agent/PLANS.md) and covers milestones 1–2 of the [standalone UI v1 roadmap](../docs/ui/README.md). Documentation is approved. Implementation requires a separate explicit request.

## Purpose / Big Picture


A guitarist will be able to inspect the sound at any location on a six-string neck and compare several locations, including two that sound the same pitch. First review a static drawing that stays legible up to fret 17. Then review the complete path from a click, tap or keypress to a selected location and its note. Subsequent explorer modes belong to separate work.

## Progress


- [x] 2026-11-24T08:54Z — Demonstrated the first slice on `codex/interactive-fretboard` from `7fb4dc6`: the home page heading above one responsive rosewood rectangle.
- [x] 2026-11-24T09:06Z — Adjusted the rectangle to sit centered near the bottom. The heading keeps its original width and top spacing. The space between them grows with the viewport height.
- [ ] Milestone 1 — IN PROGRESS. Developer review of the one-rectangle slice is pending. Further board geometry, fixtures and checks require approval to proceed.
- [ ] Milestone 2 — NOT STARTED. Implement free selection and inspection; complete the interaction review with the developer.

## Surprises & Discoveries


The first browser runs stopped during the production build. Turbopack reported a CSS worker connection failure before Playwright created a trace. Preserving the old generated build cache and retrying outside the sandbox with a fresh cache allowed both tests to run.

## Decision Log


2026-11-23, project owner: Use standard tuning and 17 frets plus open strings for UI v1. Earlier board lengths were alternatives. Set the count in the application board configuration.

2026-11-23, project owner: Taper belongs to SVG presentation. Choose the initial taper during implementation and review its actual dimensions and tradeoffs. Readability, touch accuracy and consistent marker size take priority over matching a physical guitar's proportions.

2026-11-23, project owner: Use one keyboard tab stop and retain each selection's physical identity. This makes 108 locations navigable and allows independent selections on the same string or at the same sounding pitch.

## Outcomes & Retrospective


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
