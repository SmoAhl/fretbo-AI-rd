import { registeredPitchAtLocation, type Fretboard, type FretboardLocation } from "../domain/fretboard/fretboard.js";
import { formatRegisteredNote } from "../domain/music-theory/pitch-pitch-classes-and-spelling/note-text.js";
import { noteFromRegisteredPitch, type SpellingPolicy } from "../domain/music-theory/pitch-pitch-classes-and-spelling/spelling-selection.js";

export type NoteLabelRequest = FretboardLocation & { spelling?: SpellingPolicy };
export type NoteLabel = FretboardLocation & { text: string };

export function noteLabelAtLocation(board: Fretboard, { stringId, fret, spelling = "sharps" }: NoteLabelRequest): NoteLabel {
  const location = { stringId, fret };
  const pitch = registeredPitchAtLocation(board, location);
  return { ...location, text: formatRegisteredNote(noteFromRegisteredPitch(pitch, spelling)) };
}

export function denseNoteLabels(board: Fretboard): NoteLabel[] {
  return board.strings.flatMap(({ id }) => Array.from({ length: board.fretCount + 1 }, (_, fret) =>
    noteLabelAtLocation(board, { stringId: id, fret }),
  ));
}
