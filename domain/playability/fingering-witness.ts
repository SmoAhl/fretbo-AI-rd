import { type Fretboard, type StringId } from "../fretboard/fretboard.js";
import { resolveChordShape, type ChordShapeInstance } from "./chord-shape.js";

export type FrettingFinger = 1 | 2 | 3 | 4;

/** One held stop or continuous barre, in absolute board coordinates. */
export type FingerContact = Readonly<{
  finger: FrettingFinger;
  fret: number;
  fromPosition: number;
  toPosition: number;
}>;

/** Association keys carry no approval; geometry is supplied separately. */
export type FingeringWitness = Readonly<{
  id: string;
  instanceId: string;
  contacts: readonly FingerContact[];
}>;

export type SoundingFinger = Readonly<{
  stringId: StringId;
  position: number;
  fret: number;
  finger: FrettingFinger | 0;
}>;

export type FingeringWitnessValidation =
  | Readonly<{ status: "invalid"; reasons: readonly string[] }>
  | Readonly<{
    status: "valid";
    witness: FingeringWitness;
    soundingFingers: readonly SoundingFinger[];
    contactSpan: number | null;
  }>;

/** Check discrete contact consistency, not reach, muting technique or approval.
 * Contacts are copied in finger order; sounding stops use physical-position order.
 * Invalid candidates return findings; malformed boards retain Fretboard errors.
 */
export function validateFingeringWitness(
  board: Fretboard,
  instance: ChordShapeInstance,
  witness: FingeringWitness,
): FingeringWitnessValidation {
  const shape = resolveChordShape(board, instance);
  if (shape.status === "invalid") return shape;
  const invalid = (reason: string): FingeringWitnessValidation => ({ status: "invalid", reasons: [reason] });
  if (typeof witness !== "object" || witness === null || Array.isArray(witness)
    || typeof witness.id !== "string" || witness.instanceId !== shape.instance.id) {
    return invalid("Witness must have a string ID and reference the supplied instance.");
  }
  if (!Array.isArray(witness.contacts) || witness.contacts.length > 4) {
    return invalid("Witness requires a dense array with at most four finger contacts.");
  }
  const fingers = new Set<FrettingFinger>();
  const contacts: FingerContact[] = [];
  for (let index = 0; index < witness.contacts.length; index += 1) {
    if (!Object.hasOwn(witness.contacts, index)) return invalid("Contacts must be dense.");
    const contact = witness.contacts[index];
    if (typeof contact !== "object" || contact === null || Array.isArray(contact)) {
      return invalid("Each contact must be a record.");
    }
    const { finger, fret, fromPosition, toPosition } = contact;
    if (!Number.isInteger(finger) || finger < 1 || finger > 4 || fingers.has(finger)) {
      return invalid("Fingers 1 through 4 may each hold exactly one contact.");
    }
    if (!Number.isSafeInteger(fret) || fret <= 0 || fret > board.fretCount) {
      return invalid("Contact frets must be positive safe integers within the board.");
    }
    if (!Number.isSafeInteger(fromPosition) || !Number.isSafeInteger(toPosition)
      || fromPosition < 1 || toPosition < fromPosition || toPosition > shape.instance.strings.length) {
      return invalid("Contact intervals must be inclusive ordered physical positions on the board.");
    }
    fingers.add(finger);
    contacts.push({ finger, fret, fromPosition, toPosition });
  }
  contacts.sort((a, b) => a.finger - b.finger);
  const soundingFingers: SoundingFinger[] = [];
  for (const string of shape.instance.strings) {
    const covering = contacts.filter((c) => c.fromPosition <= string.position && c.toPosition >= string.position);
    // Two digits cannot own the same discrete contact, even beneath a higher stop.
    if (new Set(covering.map((c) => c.fret)).size !== covering.length) {
      return invalid(`Different fingers overlap at the same fret on position ${string.position}.`);
    }
    if (string.state === "open") {
      if (covering.length !== 0) return invalid(`Contact obstructs open position ${string.position}.`);
      soundingFingers.push({ stringId: string.stringId, position: string.position, fret: 0, finger: 0 });
    } else if (string.state === "fretted") {
      const highest = covering.reduce<FingerContact | undefined>((stop, c) =>
        stop === undefined || c.fret > stop.fret ? c : stop, undefined);
      if (highest === undefined || highest.fret !== string.fret) {
        return invalid(`Highest contact must supply the selected stop on position ${string.position}.`);
      }
      soundingFingers.push({ stringId: string.stringId, position: string.position, fret: string.fret, finger: highest.finger });
    }
    // Neither silent state adds a tone. A muted declaration does not prove a muting technique.
  }
  const frets = contacts.map((c) => c.fret);
  return {
    status: "valid",
    witness: { id: witness.id, instanceId: witness.instanceId, contacts },
    soundingFingers,
    contactSpan: frets.length === 0 ? null : Math.max(...frets) - Math.min(...frets),
  };
}
