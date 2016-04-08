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

const onlyBlank = /^\s*$/;

function aggregateInstructionFields(instruction) {
  const fieldsArray = instruction.fields;
  const fieldsObject = {};
  for (const field of fieldsArray) {
    if (field.name in fieldsObject) {
      throw new Error(`Duplicate field: ${field.name}`);
    }
    const value = field.value;
    const tryNumber = onlyBlank.test(value) ? NaN : Number(value);
    fieldsObject[field.name || ""] = isNaN(tryNumber) ? value : tryNumber;
  }
  return {
    name: instruction.name,
    fields: fieldsObject
  };
}
exports.aggregateInstructionFields = aggregateInstructionFields;

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
  instruction = aggregateInstructionFields(instruction);
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
  getCurrentStaff(song).music.push(aggregateInstructionFields(instruction));
}

const processInstructionMap = {
  "SongInfo": storeInstructionOnRoot,
  "Editor": storeInstructionOnRoot,
  "PgSetup": storeInstructionOnRoot,
  "PgMargins": storeInstructionOnRoot,
  "Font": function(instruction, song) {
    const fields = aggregateInstructionFields(instruction).fields;
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
    instruction = aggregateInstructionFields(instruction);
    const lyrics = getCurrentStaff(song).lyrics;
    const verseNumber = Number(instruction.name.slice(5)) - 1;
    if (!lyrics[verseNumber]) {
      lyrics[verseNumber] = {};
    }
    Object.assign(lyrics[verseNumber], instruction.fields);
  }
};
exports.processInstructionMap = processInstructionMap;

const lyricN = /^Lyric\d+$/;

function processInstruction(instruction, song) {
  let instructionKey = instruction.name;
  if (lyricN.test(instructionKey)) {
    instructionKey = "Lyric1";
  }
  const processFn = processInstructionMap[instructionKey] || defaultProcessInstruction;
  processFn(instruction, song);
}
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
