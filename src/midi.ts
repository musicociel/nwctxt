import type { NWCTXTFile, NWCTXTMusicItem, NWCTXTPosition } from "./types";
import {
  clefBaseNotes,
  clefToBaseNote,
  computeDuration,
  computeTempoDuration,
  defaultDynVel,
  defaultDynamic,
  defaultNoteAccidentals,
  defaultTempo,
  defaultTimeSignature,
  durations,
  dynamicStyles,
  keyToAccidentals,
  noteInfo,
  resolveTimeSignature
} from "./utils";

export interface MidiEvents {
  noteOn(channel: number, midiNote: number, velocity: number): void;
  noteOff(channel: number, midiNote: number, velocity: number): void;
  setTempo(microsecondsPerBeat: number): void;
  timeSignature(numerator: number, denominator: number, metronome: number, thirtyseconds: number): void;
  programChange(channel: number, value: number): void;
  controller(channel: number, controllerType: number, value: number): void;
}

export class TimingState {
  midiEvents: Partial<MidiEvents> | undefined;
  tempo = defaultTempo;
  timeSignature = defaultTimeSignature;

  apply(item: NWCTXTMusicItem) {
    switch (item.name) {
      case "Tempo": {
        this.tempo = { Tempo: item.fields.Tempo, Base: item.fields.Base };
        this.midiEvents?.setTempo?.((durations["4th"] * 60000000) / computeTempoDuration(this.tempo));
        break;
      }
      case "TimeSig": {
        this.timeSignature = resolveTimeSignature(item.fields.Signature);
        this.midiEvents?.timeSignature?.(this.timeSignature[0], this.timeSignature[1], 24, 8);
        break;
      }
    }
  }
}

export interface CurrentNote {
  channel: number;
  midiNote: number;
  tied: boolean;
  totalDuration: number;
  remainingDuration: number;
}

const compareNotes = (a: CurrentNote, b: CurrentNote): number => {
  let res = a.remainingDuration - b.remainingDuration;
  if (res === 0) {
    res = (a.tied ? 2 : 1) - (b.tied ? 2 : 1);
  }
  return res;
};

const insertNote = (currentNotes: CurrentNote[], newNote: CurrentNote) => {
  let notPlaying = true;
  let insertionIndex = 0;
  for (let i = currentNotes.length - 1; i >= 0; i--) {
    const curNote = currentNotes[i];
    if (insertionIndex === 0 && compareNotes(curNote, newNote) < 0) {
      insertionIndex = i + 1;
    }
    if (curNote.midiNote === newNote.midiNote && curNote.channel === newNote.channel) {
      notPlaying = false;
      if (insertionIndex === 0) {
        // the already playing note is supposed to last longer than the new note, just do nothing!
        return notPlaying;
      }
      // the already playing note was supposed to stop quicker than the new note, remove the previous entry
      // before adding the new one
      currentNotes.splice(i, 1);
      insertionIndex--;
      break;
    }
  }
  currentNotes.splice(insertionIndex, 0, newNote);
  return notPlaying;
};

export class StaffState {
  midiEvents: Partial<Pick<MidiEvents, "noteOn" | "noteOff" | "programChange">> | undefined;
  clefBaseNote = clefBaseNotes.Treble;
  baseAccidentals = defaultNoteAccidentals;
  currentAccidentals = defaultNoteAccidentals;
  currentNotes: CurrentNote[] = [];
  dynVel = defaultDynVel;
  patch = 0;
  transpose = 0;
  dynamic = dynamicStyles[defaultDynamic];

  constructor(public channel = 0) {}

  applyDelay(delay: number, removeTiedNotes = false) {
    const currentNotes = this.currentNotes;
    for (let i = 0, l = currentNotes.length; i < l; i++) {
      const currentNote = currentNotes[i];
      currentNote.remainingDuration -= delay;
      if ((currentNote.remainingDuration === 0 && (removeTiedNotes || !currentNote.tied)) || currentNote.remainingDuration < 0) {
        currentNotes.splice(i, 1);
        this.midiEvents?.noteOff?.(currentNote.channel, currentNote.midiNote, 0);
        i--;
        l--;
      }
    }
  }

  addNote(position: NWCTXTPosition, duration: number) {
    // TODO: accidentals with tied notes
    const info = noteInfo(position, this.clefBaseNote, this.currentAccidentals);
    if (position.accidental) {
      const currentAccidentals = { ...this.currentAccidentals };
      currentAccidentals[info.noteName] = position.accidental;
      this.currentAccidentals = currentAccidentals;
    }
    const newNote = {
      channel: this.channel,
      midiNote: info.midiNote + this.transpose,
      tied: position.tie,
      totalDuration: duration,
      remainingDuration: duration
    };
    const isNewNote = insertNote(this.currentNotes, newNote);
    if (isNewNote) {
      const velocity = this.dynVel[this.dynamic];
      this.midiEvents?.noteOn?.(newNote.channel, newNote.midiNote, velocity);
    }
  }

  apply(item: NWCTXTMusicItem): number {
    switch (item.name) {
      case "Clef":
        this.clefBaseNote = clefToBaseNote(item.fields);
        break;
      case "Key":
        this.baseAccidentals = keyToAccidentals(item.fields);
        this.currentAccidentals = this.baseAccidentals;
        break;
      case "Bar":
        this.currentAccidentals = this.baseAccidentals;
        break;
      case "Note": {
        const dur = computeDuration(item.fields.Dur);
        this.addNote(item.fields.Pos, dur);
        return dur;
      }
      case "Chord": {
        const dur = computeDuration(item.fields.Dur);
        for (const pos of item.fields.Pos) {
          this.addNote(pos, dur);
        }
        if (item.fields.Pos2 && item.fields.Dur2) {
          const dur2 = computeDuration(item.fields.Dur2);
          for (const pos of item.fields.Pos2) {
            this.addNote(pos, dur2);
          }
        }
        return dur;
      }
      case "Rest":
        return computeDuration(item.fields.Dur);
      case "RestChord": {
        const dur2 = computeDuration(item.fields.Dur2);
        for (const pos of item.fields.Pos2) {
          this.addNote(pos, dur2);
        }
        return computeDuration(item.fields.Dur);
      }
      case "Instrument":
        if (item.fields.Trans != null) {
          this.transpose = item.fields.Trans;
        }
        if (item.fields.DynVel) {
          this.dynVel = item.fields.DynVel;
        }
        if (item.fields.Patch != null) {
          this.patch = item.fields.Patch;
          this.midiEvents?.programChange?.(this.channel, this.patch);
        }
        break;
      case "Dynamic":
        this.dynamic = dynamicStyles[item.fields.Style];
    }
    return 0;
  }
}

export const playMidi = function* (file: NWCTXTFile, midiEvents: Partial<MidiEvents>) {
  const musicState = new TimingState();
  musicState.midiEvents = midiEvents;
  const staffInfoArray = file.staffs
    .filter((staff) => !staff.properties.StaffProperties?.Muted)
    .map((staff, index) => {
      const staffState = new StaffState();
      staffState.midiEvents = midiEvents;
      staffState.channel = (staff.properties.StaffProperties?.Channel ?? index) - 1;
      if (staff.properties.StaffInstrument) {
        staffState.apply({ name: "Instrument", fields: staff.properties.StaffInstrument });
      }
      midiEvents.controller?.(staffState.channel, 7, staff.properties.StaffProperties?.Volume ?? 127);
      midiEvents.controller?.(staffState.channel, 10, staff.properties.StaffProperties?.StereoPan ?? 64);
      return {
        staffState,
        music: staff.music,
        nextIndex: 0,
        delay: 0
      };
    });
  while (true) {
    let nextDelay = Infinity;
    for (const staff of staffInfoArray) {
      while (staff.delay === 0 && staff.nextIndex < staff.music.length) {
        const item = staff.music[staff.nextIndex];
        musicState.apply(item);
        staff.delay = staff.staffState.apply(item);
        staff.nextIndex++;
      }
      staff.staffState.applyDelay(0, true);
      if (staff.delay === 0 && staff.staffState.currentNotes.length > 0) {
        staff.delay = staff.staffState.currentNotes[0].remainingDuration;
      }
      if (staff.delay > 0) {
        nextDelay = Math.min(nextDelay, staff.delay);
      }
    }
    if (nextDelay === Infinity) {
      return;
    }
    yield nextDelay;
    for (const staff of staffInfoArray) {
      staff.delay -= nextDelay;
      staff.staffState.applyDelay(nextDelay);
    }
  }
};
