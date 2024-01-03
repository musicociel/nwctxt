import type {
  NWCTXTAccidental,
  NWCTXTBar,
  NWCTXTClef,
  NWCTXTDuration,
  NWCTXTKey,
  NWCTXTNoteName,
  NWCTXTPosition,
  NWCTXTStaff,
  NWCTXTTempo,
  NWCTXTTimeSig
} from "./types";

// Durations:

export const ticksPerBeat = 480;

export const durations: Record<NWCTXTDuration["Base"], number> = {
  "64th": ticksPerBeat / 16,
  "32nd": ticksPerBeat / 8,
  "16th": ticksPerBeat / 4,
  "8th": ticksPerBeat / 2,
  "4th": ticksPerBeat,
  Half: 2 * ticksPerBeat,
  Whole: 4 * ticksPerBeat
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

// Time signature:

export const defaultTimeSignature: [number, number] = [4, 4];
export const timeSignatures: Record<string & NWCTXTTimeSig["fields"]["Signature"], [number, number]> = {
  AllaBreve: [2, 2],
  Common: [4, 4]
};
export const resolveTimeSignature = (signature: NWCTXTTimeSig["fields"]["Signature"]) =>
  typeof signature === "string" ? timeSignatures[signature] : signature;

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

export interface NoteInfo {
  octave: number;
  noteName: NWCTXTNoteName;
  accidental: NWCTXTAccidental;
  midiNote: number;
}

export const noteInfo = (position: NWCTXTPosition, clefBaseNote = clefBaseNotes.Treble, currentAccidentals = defaultNoteAccidentals): NoteInfo => {
  const absoluteNote = clefBaseNote + position.position;
  const noteInScale = absoluteNote % 7;
  const octave = (absoluteNote - noteInScale) / 7;
  const noteName = noteNames[noteInScale];
  const accidental = position.accidental || currentAccidentals[noteName];
  const midiNote = octave * 12 + musicNoteOffsets[noteInScale] + accidentals[accidental];
  return { octave, noteName, accidental, midiNote };
};

// Velocities:

export const dynamicStyles = { ppp: 0, pp: 1, p: 2, mp: 3, mf: 4, f: 5, ff: 6, fff: 7 };
export const defaultDynVel = [10, 30, 45, 60, 75, 92, 108, 127];
export const defaultDynamic = "fff";

// Ending bars:

export const endingBars: Record<NonNullable<NonNullable<NWCTXTStaff["properties"]["StaffProperties"]>["EndingBar"]>, NWCTXTBar["fields"]["Style"]> = {
  Double: "Double",
  "Master Repeat Close": "MasterRepeatClose",
  "Open (hidden)": "Transparent",
  "Section Close": "SectionClose",
  Single: "Single"
};
