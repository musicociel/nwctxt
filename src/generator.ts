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

import * as lowlevelGenerator from "./lowlevel/generator";
import { createProcessField } from "./createProcessors";
import type { LowLevelNWCTXTField, LowLevelNWCTXTFile, LowLevelNWCTXTInstruction } from "./lowlevel/types";
import type { NWCTXTFile, NWCTXTPosition, NWCTXTStaff } from "./types";

type FutureLowLevelNWCTXTField = Omit<LowLevelNWCTXTField, "value"> & { value: any };

export const defaultProcessField = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  const value = field.value;
  if (value === true) {
    field.value = "Y";
  } else if (value === false) {
    field.value = "N";
  } else {
    field.value = String(value);
  }
};

const processQuotedField = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  field.quoted = true;
};

const processPos = (value: NWCTXTPosition): string => {
  return `${value.accidental}${value.position}${value.head}${value.tie ? "^" : ""}`;
};

const processSinglePosField = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  field.value = processPos(field.value);
};

const processMultiPosField = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  field.value = field.value.map(processPos).join(",");
};

const optsValue = (value: Record<string, any>, excludeKey?: (key: string) => boolean) => {
  return Object.keys(value)
    .filter((field) => value[field] !== false && !excludeKey?.(field))
    .map((field) => {
      const valueField = value[field];
      return valueField === true ? field : `${field}=${valueField}`;
    });
};

const processOpts = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  field.value = optsValue(field.value).join(",");
};

const processDur = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  const value = field.value;
  const fields = optsValue(value, (field) => field === "Base");
  fields.unshift(value.Base);
  field.value = fields.join(",");
};

const joinArray = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  field.value = field.value.join(",");
};

const joinTimeSignature = (instruction: any, field: FutureLowLevelNWCTXTField) => {
  const value = field.value;
  field.value = typeof value === "string" ? value : value.join("/");
};

export const processFieldMap = {
  Text: processQuotedField,
  "SongInfo|Title": processQuotedField,
  "SongInfo|Author": processQuotedField,
  "SongInfo|Lyricist": processQuotedField,
  "SongInfo|Copyright1": processQuotedField,
  "SongInfo|Copyright2": processQuotedField,
  "SongInfo|Comments": processQuotedField,
  "Font|Typeface": processQuotedField,
  "AddStaff|Name": processQuotedField,
  "AddStaff|Label": processQuotedField,
  "AddStaff|Group": processQuotedField,
  "Note|Pos": processSinglePosField,
  "Chord|Pos": processMultiPosField,
  "Chord|Pos2": processMultiPosField,
  "RestChord|Pos2": processMultiPosField,
  Dur: processDur,
  Dur2: processDur,
  Opts: processOpts,
  "StaffProperties|WithNextStaff": processOpts,
  DynVel: joinArray,
  "Key|Signature": joinArray,
  "TimeSig|Signature": joinTimeSignature,
  "Ending|Endings": joinArray,
  "MPC|Pt1": joinArray,
  "MPC|Pt2": joinArray
};

export const processField = createProcessField(processFieldMap, defaultProcessField);

export const separateFields = (instruction: { fields: Record<string, any>; name: string }): LowLevelNWCTXTInstruction => {
  const fieldsMap = instruction.fields;
  const fields: LowLevelNWCTXTField[] = [];
  for (const fieldName of Object.keys(fieldsMap)) {
    const curField = {
      name: fieldName,
      value: fieldsMap[fieldName],
      quoted: false
    };
    processField(instruction, curField);
    fields.push(curField);
  }
  return {
    name: instruction.name,
    fields: fields
  };
};

const appendProperties = (properties: Record<string, any>, instructions: LowLevelNWCTXTInstruction[]) => {
  for (const instructionName of Object.keys(properties)) {
    instructions.push(
      separateFields({
        name: instructionName,
        fields: properties[instructionName]
      })
    );
  }
};

const appendFonts = (fonts: NWCTXTFile["fonts"], instructions: LowLevelNWCTXTInstruction[]) => {
  for (const style of Object.keys(fonts) as (string & keyof typeof fonts)[]) {
    instructions.push(
      separateFields({
        name: "Font",
        fields: Object.assign(
          {
            Style: style
          },
          fonts[style]
        )
      })
    );
  }
};

const appendLyrics = (lyrics: NWCTXTStaff["lyrics"], instructions: LowLevelNWCTXTInstruction[]) => {
  let number = 1;
  for (const verse of lyrics) {
    instructions.push(
      separateFields({
        name: `Lyric${number}`,
        fields: verse
      })
    );
    number++;
  }
};

const appendMusic = (music: NWCTXTStaff["music"], instructions: LowLevelNWCTXTInstruction[]) => {
  for (const instruction of music) {
    instructions.push(separateFields(instruction));
  }
};

export const separateInstructions = (song: NWCTXTFile): LowLevelNWCTXTFile => {
  const instructions: LowLevelNWCTXTInstruction[] = [];
  appendProperties(song.properties, instructions);
  appendFonts(song.fonts, instructions);
  for (const staff of song.staffs) {
    appendProperties(staff.properties, instructions);
    appendLyrics(staff.lyrics, instructions);
    appendMusic(staff.music, instructions);
  }
  return {
    clip: song.clip,
    version: song.version,
    extra: song.extra,
    instructions
  };
};

export function generate(song: NWCTXTFile): string {
  return lowlevelGenerator.generate(separateInstructions(song));
}
