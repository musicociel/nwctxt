/*
 * MIT License
 *
 * Copyright (c) 2023 DivDE <divde@musicociel.fr>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as lowlevelParser from "./lowlevel/parser";
import { createProcessField, createProcessInstruction } from "./createProcessors";
import type { LowLevelNWCTXTField, LowLevelNWCTXTFile, LowLevelNWCTXTInstruction } from "./lowlevel/types";
import type { NWCTXTFile, NWCTXTBaseMusicItem, NWCTXTStaff, NWCTXTPosition, NWCTXTMusicItem, NWCTXTDuration, NWCTXTFontConfig } from "./types";

const onlyBlank = /^\s*$/;

type ProcessField = (instruction: LowLevelNWCTXTInstruction, field: LowLevelNWCTXTField) => any;

export const defaultProcessField: ProcessField = (instruction, field) => {
  const value = field.value;
  if (field.quoted) {
    return value;
  } else if (value === "Y") {
    return true;
  } else if (value === "N") {
    return false;
  } else {
    const tryNumber = onlyBlank.test(value) ? NaN : Number(value);
    return isNaN(tryNumber) ? value : tryNumber;
  }
};

const posField = /^([bvxn#])?(-?\d+)([a-z])?(\^)?$/i;

const singlePos = (value: string): NWCTXTPosition => {
  const parsedPos = posField.exec(value);
  if (!parsedPos) {
    throw new Error(`Unrecognized position: ${value}`);
  }
  return {
    accidental: parsedPos[1] || null,
    position: Number(parsedPos[2]),
    head: parsedPos[3] || "",
    tie: !!parsedPos[4]
  };
};

const processSinglePosField: ProcessField = (instruction, field) => {
  return singlePos(field.value);
};

const splitArray: ProcessField = (instruction, field) => {
  return field.value.split(",");
};

const processMultiPosField: ProcessField = (instruction, field) => {
  return field.value.split(",").map(singlePos);
};

const processDur: ProcessField = (instruction, field): NWCTXTDuration => {
  const parts = field.value.split(",");
  const res: NWCTXTDuration = {
    Dur: parts.shift()!
  };
  for (const part of parts) {
    (res as any)[part] = true;
  }
  return res;
};

export const processFieldMap: Record<string, ProcessField> = {
  "Note|Pos": processSinglePosField,
  "Chord|Pos": processMultiPosField,
  "Chord|Pos2": processMultiPosField,
  "Note|Dur": processDur,
  "Chord|Dur": processDur,
  "Rest|Dur": processDur,
  "Key|Signature": splitArray
};

export const processField = createProcessField(processFieldMap, defaultProcessField);

export function aggregateFields(instruction: LowLevelNWCTXTInstruction): NWCTXTBaseMusicItem {
  const fieldsArray = instruction.fields;
  const fieldsObject: Record<string, any> = {};
  for (const field of fieldsArray) {
    const fieldName = field.name || "";
    if (fieldName in fieldsObject) {
      throw new Error(`Duplicate field: ${fieldName}`);
    }
    fieldsObject[fieldName] = processField(instruction, field);
  }
  return {
    name: instruction.name,
    fields: fieldsObject
  };
}

function emptyStaff(): NWCTXTStaff {
  return {
    properties: {},
    music: [],
    lyrics: []
  };
}

function getCurrentStaff(song: NWCTXTFile): NWCTXTStaff {
  const staffs = song.staffs;
  if (staffs.length === 0) {
    staffs.push(emptyStaff());
  }
  return staffs[staffs.length - 1];
}

const storeInstructionOn = (rawInstruction: LowLevelNWCTXTInstruction, object: { properties: Record<string, any> }) => {
  const instruction = aggregateFields(rawInstruction);
  const properties = object.properties;
  let fields = properties[instruction.name];
  if (!fields) {
    fields = properties[instruction.name] = {};
  }
  Object.assign(fields, instruction.fields);
};
const storeInstructionOnRoot = storeInstructionOn;

const storeInstructionOnStaff = (instruction: LowLevelNWCTXTInstruction, song: NWCTXTFile) => {
  storeInstructionOn(instruction, getCurrentStaff(song));
};

type ProcessInstruction = (instruction: LowLevelNWCTXTInstruction, song: NWCTXTFile) => void;

export const defaultProcessInstruction: ProcessInstruction = (instruction, song) => {
  getCurrentStaff(song).music.push(aggregateFields(instruction) as NWCTXTMusicItem);
};

export const processInstructionMap: Record<string, ProcessInstruction> = {
  SongInfo: storeInstructionOnRoot,
  Editor: storeInstructionOnRoot,
  PgSetup: storeInstructionOnRoot,
  PgMargins: storeInstructionOnRoot,
  Font: function (instruction, song) {
    const fields = aggregateFields(instruction).fields as NWCTXTFontConfig & { Style?: keyof typeof song.fonts };
    const style = fields.Style!;
    delete fields.Style;
    song.fonts[style] = fields;
  },
  AddStaff: function (instruction, song) {
    song.staffs.push(emptyStaff());
    storeInstructionOnStaff(instruction, song);
  },
  StaffProperties: storeInstructionOnStaff,
  StaffInstrument: storeInstructionOnStaff,
  Lyrics: storeInstructionOnStaff,
  Lyric1: function (rawInstruction, song) {
    const instruction = aggregateFields(rawInstruction);
    const lyrics = getCurrentStaff(song).lyrics;
    const verseNumber = Number(instruction.name.slice(5)) - 1;
    if (!lyrics[verseNumber]) {
      lyrics[verseNumber] = {};
    }
    Object.assign(lyrics[verseNumber], instruction.fields);
  }
};

export const processInstruction = createProcessInstruction(processInstructionMap, defaultProcessInstruction);

export function aggregateInstructions(parsedContent: LowLevelNWCTXTFile): NWCTXTFile {
  const song: NWCTXTFile = {
    version: parsedContent.version,
    clip: parsedContent.clip,
    extra: parsedContent.extra,
    fonts: {},
    properties: {},
    staffs: []
  };
  for (const instruction of parsedContent.instructions) {
    processInstruction(instruction, song);
  }
  return song;
}

export function parse(fileContent: string): NWCTXTFile {
  const parsedFile = lowlevelParser.parse(fileContent);
  return aggregateInstructions(parsedFile);
}
