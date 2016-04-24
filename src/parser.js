/*
 * MIT License
 *
 * Copyright (c) 2016 DivDE <divde@laposte.net>
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
const lowlevelParser = require("./lowlevel/parser");
const createProcessors = require("./createProcessors");

const onlyBlank = /^\s*$/;

function defaultProcessField(instruction, field) {
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
}
exports.defaultProcessField = defaultProcessField;

const posField = /^([bvxn#])?(-?\d+)([a-z])?(\^)?$/i;

function singlePos(value) {
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
}

function processSinglePosField(instruction, field) {
  return singlePos(field.value);
}

function splitArray(instruction, field) {
  return field.value.split(",");
}

function processMultiPosField(instruction, field) {
  return field.value.split(",").map(singlePos);
}

function processDur(instruction, field) {
  const parts = field.value.split(",");
  const res = {
    Dur: parts.shift()
  };
  for (const part of parts) {
    res[part] = true;
  }
  return res;
}

const processFieldMap = {
  "Note|Pos": processSinglePosField,
  "Chord|Pos": processMultiPosField,
  "Chord|Pos2": processMultiPosField,
  "Note|Dur": processDur,
  "Chord|Dur": processDur,
  "Rest|Dur": processDur,
  "Key|Signature": splitArray
};
exports.processFieldMap = processFieldMap;

const processField = createProcessors.createProcessField(processFieldMap, defaultProcessField);
exports.processField = processField;

function aggregateFields(instruction) {
  const fieldsArray = instruction.fields;
  const fieldsObject = {};
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
exports.aggregateFields = aggregateFields;

function emptyStaff() {
  return {
    properties: {},
    music: [],
    lyrics: []
  };
}

function getCurrentStaff(song) {
  const staffs = song.staffs;
  if (staffs.length === 0) {
    staffs.push(emptyStaff());
  }
  return staffs[staffs.length - 1];
}

function storeInstructionOn(instruction, object) {
  instruction = aggregateFields(instruction);
  const properties = object.properties;
  let fields = properties[instruction.name];
  if (!fields) {
    fields = properties[instruction.name] = {};
  }
  Object.assign(fields, instruction.fields);
}
const storeInstructionOnRoot = storeInstructionOn;

function storeInstructionOnStaff(instruction, song) {
  storeInstructionOn(instruction, getCurrentStaff(song));
}

function defaultProcessInstruction(instruction, song) {
  getCurrentStaff(song).music.push(aggregateFields(instruction));
}
exports.defaultProcessInstruction = defaultProcessInstruction;

const processInstructionMap = {
  "SongInfo": storeInstructionOnRoot,
  "Editor": storeInstructionOnRoot,
  "PgSetup": storeInstructionOnRoot,
  "PgMargins": storeInstructionOnRoot,
  "Font": function(instruction, song) {
    const fields = aggregateFields(instruction).fields;
    const style = fields.Style;
    delete fields.Style;
    song.fonts[style] = fields;
  },
  "AddStaff": function (instruction, song) {
    song.staffs.push(emptyStaff());
    storeInstructionOnStaff(instruction, song);
  },
  "StaffProperties": storeInstructionOnStaff,
  "StaffInstrument": storeInstructionOnStaff,
  "Lyrics": storeInstructionOnStaff,
  "Lyric1": function (instruction, song) {
    instruction = aggregateFields(instruction);
    const lyrics = getCurrentStaff(song).lyrics;
    const verseNumber = Number(instruction.name.slice(5)) - 1;
    if (!lyrics[verseNumber]) {
      lyrics[verseNumber] = {};
    }
    Object.assign(lyrics[verseNumber], instruction.fields);
  }
};
exports.processInstructionMap = processInstructionMap;

const processInstruction = createProcessors.createProcessInstruction(processInstructionMap, defaultProcessInstruction);
exports.processInstruction = processInstruction;

function aggregateInstructions (parsedContent) {
  const song = {
    version: parsedContent.version,
    clip: parsedContent.clip,
    extra: parsedContent.extra,
    fonts: {},
    properties: {},
    staffs: []
  };
  for (let instruction of parsedContent.instructions) {
    processInstruction(instruction, song);
  }
  return song;
}
exports.aggregateInstructions = aggregateInstructions;

function parse (fileContent) {
  const parsedFile = lowlevelParser.parse(fileContent);
  return aggregateInstructions(parsedFile);
}
exports.parse = parse;
