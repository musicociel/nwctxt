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
"use strict";

import * as lowlevelGenerator from "./lowlevel/generator";
import { createProcessField } from "./createProcessors";
import type { LowLevelNWCTXTField } from "./lowlevel/types";

export function defaultProcessField(instruction, field) {
  const value = field.value;
  if (value === true) {
    field.value = "Y";
  } else if (value === false) {
    field.value = "N";
  } else {
    field.value = String(value);
  }
}

function processQuotedField(instruction, field) {
  field.quoted = true;
}

function processPos(value) {
  return `${value.accidental || ""}${value.position}${value.head}${value.tie ? "^" : ""}`;
}

function processSinglePosField(instruction, field) {
  field.value = processPos(field.value);
}

function processMultiPosField(instruction, field) {
  field.value = field.value.map(processPos).join(",");
}

function processDur(instruction, field) {
  const value = field.value;
  const fields = Object.keys(value).filter((field) => value[field] === true);
  fields.unshift(value.Dur);
  field.value = fields.join(",");
}

function joinArray(instruction, field) {
  const value = field.value;
  field.value = value.join(",");
}

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
  "Note|Dur": processDur,
  "Chord|Dur": processDur,
  "Rest|Dur": processDur,
  "Key|Signature": joinArray
};

export const processField = createProcessField(processFieldMap, defaultProcessField);

export function separateFields(instruction) {
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
}

function appendProperties(properties, instructions) {
  for (const instructionName of Object.keys(properties)) {
    instructions.push(
      separateFields({
        name: instructionName,
        fields: properties[instructionName]
      })
    );
  }
}

function appendFonts(fonts, instructions) {
  for (const style of Object.keys(fonts)) {
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
}

function appendLyrics(lyrics, instructions) {
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
}

function appendMusic(music, instructions) {
  for (const instruction of music) {
    instructions.push(separateFields(instruction));
  }
}

export function separateInstructions(song) {
  const instructions = [];
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
}

export function generate(song) {
  return lowlevelGenerator.generate(separateInstructions(song));
}
