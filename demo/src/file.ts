import { asReadable, computed, writable } from "@amadeus-it-group/tansu";
import { write } from "midifile-ts";
import type { NWCTXTFile } from "nwctxt";
import { playMidi } from "nwctxt/midi";
import { extractNWCTXT } from "nwctxt/nwc";
import { parse } from "nwctxt/parser";
import { ticksPerBeat } from "nwctxt/utils";
import { MidiEventsLog } from "./midiEventsLog";
import { resolveStorePromise, toBlobURL } from "./storeUtils";

export const file$ = writable(null as File | null);
export const writableFileContentPromise$ = computed(() => asyncOpenFile(file$()));
export const fileContentPromise$ = asReadable(writableFileContentPromise$);
export const fileContent$ = resolveStorePromise(fileContentPromise$);

const readFile = (file: File) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(new Uint8Array(fileReader.result as ArrayBuffer));
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });

const asyncOpenFile = async (file: File | null) => {
  if (!file) {
    return null;
  }
  const fileContent = await readFile(file);
  const nwcTxt = extractNWCTXT(fileContent);
  return parse(nwcTxt);
};

export const toMidiFile = (fileContent: NWCTXTFile | null) => {
  if (!fileContent) {
    return null;
  }
  const midiEventsLog = new MidiEventsLog();
  for (const delay of playMidi(fileContent, midiEventsLog)) {
    midiEventsLog.applyDelay(delay);
  }
  midiEventsLog.endOfTrack();
  console.log("Midi file content", midiEventsLog.midiEvents);
  const binaryFile = write([midiEventsLog.midiEvents], ticksPerBeat);
  return new Blob([binaryFile], { type: "audio/midi" });
};

export const midiFileBlob$ = computed(() => toMidiFile(fileContent$()));
export const midiFileURL$ = toBlobURL(midiFileBlob$);
