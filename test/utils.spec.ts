import { expect, it } from "vitest";
import { clefBaseNotes, computeDuration, computeTempoDuration, noteInfo, clefToBaseNote, keyToAccidentals } from "../src/utils";

it("computeDuration/computeTempoDuration", () => {
  const smallestUnit = computeDuration({ Base: "32nd", Triplet: true });
  expect(smallestUnit).toEqual(Math.floor(smallestUnit)); // expect the smallest unit to be an integer
  const tempo120 = computeTempoDuration({ Base: "Quarter", Tempo: 120 });
  expect(tempo120).not.toBe(0);
  expect(computeDuration({ Base: "4th" }) * 120).toEqual(tempo120);
  expect(computeDuration({ Base: "Half" }) * 60).toEqual(tempo120);
  expect(computeDuration({ Base: "Whole" }) * 30).toEqual(tempo120);
  expect(computeDuration({ Base: "8th" }) * 240).toEqual(tempo120);
  expect(computeDuration({ Base: "16th" }) * 480).toEqual(tempo120);
  expect(computeDuration({ Base: "32nd" }) * 960).toEqual(tempo120);
  expect(computeDuration({ Base: "64th" }) * 1920).toEqual(tempo120);
  expect(computeDuration({ Base: "4th", Dotted: true }) * 80).toEqual(tempo120);
  expect(computeDuration({ Base: "Half", Dotted: true }) * 40).toEqual(tempo120);
  expect(computeDuration({ Base: "Whole", Dotted: true }) * 20).toEqual(tempo120);
  expect(computeDuration({ Base: "8th", Dotted: true }) * 160).toEqual(tempo120);
  expect(computeDuration({ Base: "16th", Dotted: true }) * 320).toEqual(tempo120);
  expect(computeDuration({ Base: "32nd", Dotted: true }) * 640).toEqual(tempo120);
  expect(computeDuration({ Base: "64th", Dotted: true }) * 1280).toEqual(tempo120);
  expect(computeDuration({ Base: "4th", Triplet: true }) * 180).toEqual(tempo120);
  expect(computeDuration({ Base: "Half", Triplet: true }) * 90).toEqual(tempo120);
  expect(computeDuration({ Base: "Whole", Triplet: true }) * 45).toEqual(tempo120);
  expect(computeDuration({ Base: "8th", Triplet: true }) * 360).toEqual(tempo120);
  expect(computeDuration({ Base: "16th", Triplet: true }) * 720).toEqual(tempo120);
  expect(computeDuration({ Base: "32nd", Triplet: true }) * 1440).toEqual(tempo120);
  expect(computeDuration({ Base: "64th", Triplet: true }) * 2880).toEqual(tempo120);
  expect(computeDuration({ Base: "Half" }) * 100).toEqual(computeTempoDuration({ Base: "Half", Tempo: 100 }));
  expect(computeDuration({ Base: "8th" }) * 120).toEqual(computeTempoDuration({ Base: "Eighth", Tempo: 120 }));
  expect(computeDuration({ Base: "4th", Dotted: true }) * 60).toEqual(computeTempoDuration({ Base: "Quarter Dotted", Tempo: 60 }));
  expect(computeDuration({ Base: "Half", Dotted: true }) * 110).toEqual(computeTempoDuration({ Base: "Half Dotted", Tempo: 110 }));
  expect(computeDuration({ Base: "8th", Dotted: true }) * 70).toEqual(computeTempoDuration({ Base: "Eighth Dotted", Tempo: 70 }));
  const tempo175 = computeTempoDuration({ Base: "Quarter", Tempo: 175 });
  expect(tempo175).not.toBe(0);
  expect(computeDuration({ Base: "4th", DblDotted: true }) * 100).toEqual(tempo175);
  expect(computeDuration({ Base: "Half", DblDotted: true }) * 50).toEqual(tempo175);
  expect(computeDuration({ Base: "Whole", DblDotted: true }) * 25).toEqual(tempo175);
  expect(computeDuration({ Base: "8th", DblDotted: true }) * 200).toEqual(tempo175);
  expect(computeDuration({ Base: "16th", DblDotted: true }) * 400).toEqual(tempo175);
  expect(computeDuration({ Base: "32nd", DblDotted: true }) * 800).toEqual(tempo175);
  expect(computeDuration({ Base: "64th", DblDotted: true }) * 1600).toEqual(tempo175);
});

it("noteInfo/clefToBaseNote", () => {
  expect(noteInfo({ position: 1, accidental: "#", head: "", tie: false })).toEqual({ midiNote: 73, noteName: "C", accidental: "#", octave: 6 });
  expect(noteInfo({ position: 1, accidental: "#", head: "", tie: false }, clefToBaseNote({ Type: "Treble", OctaveShift: "Octave Up" }))).toEqual({
    midiNote: 73 + 12,
    noteName: "C",
    accidental: "#",
    octave: 7
  });
  expect(noteInfo({ position: 1, accidental: "#", head: "", tie: false }, clefToBaseNote({ Type: "Treble", OctaveShift: "Octave Down" }))).toEqual({
    midiNote: 73 - 12,
    noteName: "C",
    accidental: "#",
    octave: 5
  });
  expect(noteInfo({ position: 2, accidental: "b", head: "", tie: false })).toEqual({ midiNote: 73, noteName: "D", accidental: "b", octave: 6 });
  expect(noteInfo({ position: 2, accidental: "b", head: "", tie: false }, clefBaseNotes.Bass)).toEqual({
    midiNote: 52,
    noteName: "F",
    accidental: "b",
    octave: 4
  });
  expect(noteInfo({ position: 1, accidental: "", head: "", tie: false }, clefBaseNotes.Bass)).toEqual({
    midiNote: 52,
    noteName: "E",
    accidental: "",
    octave: 4
  });
  expect(noteInfo({ position: 2, accidental: "", head: "", tie: false }, clefBaseNotes.Bass)).toEqual({
    midiNote: 53,
    noteName: "F",
    accidental: "",
    octave: 4
  });
  expect(
    noteInfo({ position: 2, accidental: "", head: "", tie: false }, clefBaseNotes.Bass, keyToAccidentals({ Signature: ["F#"], Tonic: "G" }))
  ).toEqual({
    midiNote: 54,
    noteName: "F",
    accidental: "#",
    octave: 4
  });
});
