# Standalone UI v1 roadmap

The first workbench lets a guitarist explore physical locations, individual notes, scales and chord tones across a landscape neck. This roadmap records the approved design. Implementation requires a separate request. The [interactive fretboard ExecPlan](../../plans/interactive-fretboard.md) covers the first two milestones. See [status](../STATUS.md) for delivered capabilities.

## Instrument and interaction

UI v1 assumes phones are used in landscape orientation. Design and acceptance review of the phone workbench use a horizontal viewport. The current portrait fretboard is an intermediate review prototype; its transition to the landscape phone workbench is tracked in the [ExecPlan](../../plans/interactive-fretboard.md).

Start with an empty, dark rosewood-inspired neck, metallic strings and fret wires, standard six-string tuning, high E at the top and the nut on the left. The open column (0) plus frets 1–17 give 108 locations. Show each string's tuning at the nut even when its open location is highlighted. Offer numbers above the fret spaces, landmark dots, or fret annotations off.

Fret spaces narrow progressively. Use a configurable presentation taper, preferably gentler than physical guitar proportions. Choose it by reviewing the narrowest fret with the widest supported label, including accidental and octave. Keep marker and text size consistent. Derive each marker's center and the full cell's hit area from the same wire and string geometry. Allow horizontal scrolling when readable labels, clearance or touch targets require more width than the screen provides.

Manual selection identifies individual string/fret locations. Users can toggle several locations on one string, or select a location outside the active overlay. The inspector gives string, fret, note and octave for each. **Clear selection** removes hand-picked locations and preserves the overlay. Changing musical view, root, tonic, note, scale or chord replaces the query and clears manual selections. Display preferences preserve the selected locations.

Keep root, manual selection and keyboard focus distinguishable. Use one roving tab stop across the board. Tab and Shift+Tab enter or leave it; arrows move by fret or adjacent physical string and stop at the edges. Reveal the entire focused cell when navigation moves outside the viewport. Enter and Space toggle the focused location. Moving focus alone preserves selections.

## Musical views

- **Notes.** Select a pitch class to highlight every occurrence, or use Show All Notes. Offer a sharp/flat preference for free exploration and optional octave numbers with note labels.
- **Scales.** Choose a spelled tonic and any of the seven diatonic modes or major/minor pentatonic. Identify major/Ionian and natural minor/Aeolian clearly. Display members across the entire board.
- **Chord tones.** Choose the root and a supported triad, suspended triad or seventh-chord quality (including supported suspended sevenths) independently of key. Mark every matching location as a tone alternative. This view makes no simultaneous-grip claim.

Offer notes, degrees, intervals and blank markers where a musical reference exists. Scale roles refer to the tonic and chord roles to the root. Preserve the original musical spelling and role when mapping a pitch class to locations. For example, F major retains B♭ even if free exploration uses sharps. An out-of-collection selection still has an inspectable pitch.

## Application boundaries

A Next.js page shell hosts one client-side React workbench with controls, a custom fretboard SVG and the selection inspector. The workbench coordinates the query, preferences and selections. Domain engines own all musical and instrument calculations: Music Theory owns musical identity and spelling, Fretboard owns instrument configuration, locations and registered pitches, and Playability owns chord-fingering validation and assessment. The UI derives displayed musical data through these engines using one shared board configuration. Review fixtures may select locations or a density pattern, but must derive note names and pitches from the engines rather than duplicate them as hand-authored values. SVG owns visual geometry, layout, focus, scrolling and location events. Draw rows by physical position and identify cells by string ID and fret. Keep ordinary note exploration and display changes independent of grip search. See [architecture](../ARCHITECTURE.md) for the dependency direction.

## Milestones and observable review

| Milestone | Implementation | What to demonstrate and verify |
| --- | --- | --- |
| 1. Landscape SVG foundation | NOT STARTED | Show empty, sparse and dense fixtures on desktop and a narrow screen. Check open strings and frets 1, 12 and 17, both outer strings, accidental-plus-octave labels and cell boundaries. Verify physical order with nonsequential IDs. Walk through one cell from wire positions to marker center and hit area. Report the taper tradeoff. |
| 2. Free selection and inspection | NOT STARTED | Toggle open high E and B-string fret 5 as independent E4 locations, several frets on one string, and Clear selection. Verify mouse and touch at 1, 12 and 17. Navigate to 17 by keyboard, bring the entire focused cell into view, toggle with Enter/Space and Tab out. Trace one event to domain lookup and inspector. |
| 3. Notes explorer | NOT STARTED | Compare one pitch class with domain search. Count 108 distinct locations in Show All Notes and inspect real spellings and octaves at full density. High E at fret 17 is A5. Verify musical query changes clear selections and label changes preserve them. |
| 4. Full-neck scale explorer | NOT STARTED | Exercise all nine collections. Compare B in D Dorian with B♭ in D Aeolian, the minor-pentatonic ♭3 label, and an out-of-scale selection. Check D natural minor against the [47-location fixture](../../tests/fretboard-music-theory.test.ts) through fret 12 inclusive, then verify mapping through fret 17. Trace one degree to its locations. |
| 5. Full-neck chord-tone explorer | NOT STARTED | Verify menu entries against the named catalog. Compare C major, Csus4 and C7: E belongs to C major, F replaces it in Csus4, and C7 includes B♭. Trace one formula role to every matching location. Check that a quality change clears manual selection. |
| 6. Integration, accessibility and responsive behavior | NOT STARTED | Exercise empty, single-note, dense, scale and chord views on desktop and phone. Verify accessible names and selection state, visible focus, scrolling both ways, touch accuracy, blank-marker inspection, labels at 1, 12 and 17, and understandable empty/error feedback. Run relevant Vitest tests, typecheck and production build. Record browser observations separately. |

Use a feature branch for authorized implementation. Review the static SVG with the developer before interaction work and the interactive board before explorer work. At each checkpoint show the behavior, walk through the responsible code and explain what check would catch a regression.

## Deferred features and open product question

Future instrument and display options include selectable neck lengths (12, 15, 22 or 24 frets), other finishes, string subsets and a gray nonmember background. Future musical workflows include CAGED forms, pentatonic positions, notes-per-string patterns, combined chord/scale overlays, theory circles, Roman numeral and Nashville-number views, broader chord menus and identification from manual selections. Audio, AI chat and persistence are later efforts.

A future reviewed-grip browser can use [Playability](../PLAYABILITY_V1.md) and display placements assessed as `recommendationEligible`. Keep its search tied to changes in search inputs. Broader fingering catalogs and ergonomic ranking remain separate work.

**Future product question:** Should players be able to keep hand-picked locations while comparing different musical queries? V1 clears them on a query change. Revisit after observing the comparison workflow.
