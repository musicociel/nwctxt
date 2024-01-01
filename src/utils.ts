import type { NWCTXTAccidental, NWCTXTClef, NWCTXTDuration, NWCTXTKey, NWCTXTNoteName, NWCTXTPosition, NWCTXTTempo } from "./types";

// Durations:

export const durations: Record<NWCTXTDuration["Base"], number> = {
  "64th": 12,
  "32nd": 24,
  "16th": 48,
  "8th": 96,
  "4th": 192,
  Half: 384,
  Whole: 768
};

export const computeDuration = (duration: NWCTXTDuration) => {
  let res = durations[duration["Base"]];
  if (duration["Triplet"]) {
    res = (res * 2) / 3;
  }
  if (duration.DblDotted) {
    res = (res * 7) / 4;
  } else if (duration.Dotted) {
    res = (res * 3) / 2;
  }
  return res;
};

// Tempo:

export const tempoBases: Record<NonNullable<NWCTXTTempo["fields"]["Base"]>, number> = {
  "Eighth Dotted": (durations["8th"] * 3) / 2,
  Eighth: durations["8th"],
  Half: durations["Half"],
  "Half Dotted": (durations["Half"] * 3) / 2,
  Quarter: durations["4th"],
  "Quarter Dotted": (durations["4th"] * 3) / 2
};

export const defaultTempo: Pick<NWCTXTTempo["fields"], "Base" | "Tempo"> = { Tempo: 120 };
export const computeTempoDuration = (tempo = defaultTempo) => tempo.Tempo * tempoBases[tempo["Base"] ?? "Quarter"];

// Clefs:

/**
 * Maps each clef to the corresponding note at position 0 (which is on the middle bar of the staff).
 *
 * @remarks The value in the map is not a MIDI note number (which is based on a 12-notes octave),
 * but a note number based on a 7-notes octave. Only note 0 corresponds to MIDI note 0.
 */
export const clefBaseNotes: Record<NWCTXTClef["fields"]["Type"], number> = {
  Treble: 5 * 7 + 6, // middle bar in the staff is B4
  Bass: 4 * 7 + 1, // middle bar in the staff is D3
  Alto: 5 * 7 + 0, // middle bar in the staff is C4 (middle C)
  Tenor: 4 * 7 + 5, // middle bar in the staff is B3
  Percussion: 4 * 7 + 1 // same as Bass, middle bar in the staff is D3
};

export const octaveShifts: Record<NonNullable<NWCTXTClef["fields"]["OctaveShift"]> | "None", number> = {
  None: 0,
  "Octave Down": -7,
  "Octave Up": 7
};

export const clefToBaseNote = (clef: NWCTXTClef["fields"]) => clefBaseNotes[clef.Type] + octaveShifts[clef.OctaveShift ?? "None"];

// Keys/notes:

export const noteNames: NWCTXTNoteName[] = ["C", "D", "E", "F", "G", "A", "B"];
export const defaultNoteAccidentals: Record<NWCTXTNoteName, NWCTXTAccidental> = { C: "", D: "", E: "", F: "", G: "", A: "", B: "" };
export const accidentals: Record<NWCTXTAccidental, number> = { v: -2, b: -1, n: 0, "": 0, "#": 1, x: 2 };
export const musicNoteOffsets = [0, 2, 4, 5, 7, 9, 11];

export const keyToAccidentals = (key: NWCTXTKey["fields"]) => {
  const accidentals: Record<NWCTXTNoteName, NWCTXTAccidental> = { ...defaultNoteAccidentals };
  for (const noteWithAccidental of key.Signature) {
    accidentals[noteWithAccidental[0] as NWCTXTNoteName] = (noteWithAccidental[1] ?? "") as NWCTXTAccidental;
  }
  return accidentals;
};

export const noteInfo = (position: NWCTXTPosition, clefBaseNote = clefBaseNotes.Treble, currentAccidentals = defaultNoteAccidentals) => {
  const absoluteNote = clefBaseNote + position.position;
  const noteInScale = absoluteNote % 7;
  const octave = (absoluteNote - noteInScale) / 7;
  const noteName = noteNames[noteInScale];
  const accidental = position.accidental || currentAccidentals[noteName];
  const midiNote = octave * 12 + musicNoteOffsets[noteInScale] + accidentals[accidental];
  return { octave, noteName, accidental, midiNote };
};
