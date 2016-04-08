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

const lowlevelGenerator = require("./lowlevel/generator");

const quotedFields = {
  "SongInfo|Title": true,
  "SongInfo|Author": true,
  "SongInfo|Lyricist": true,
  "SongInfo|Copyright1": true,
  "SongInfo|Copyright2": true,
  "SongInfo|Comments": true,
  "Font|Typeface": true,
  "AddStaff|Name": true,
  "AddStaff|Label": true,
  "AddStaff|Group": true
};
exports.quotedFields = quotedFields;

function areQuotesNeeded(instructionName, fieldName) {
  if (fieldName === "Text") {
    return true;
  }
  return quotedFields[`${instructionName}|${fieldName}`] || false;
}
exports.areQuotesNeeded = areQuotesNeeded;

function separateFields(instruction) {
  const fieldsMap = instruction.fields;
  const fields = [];
  for (const fieldName of Object.keys(fieldsMap)) {
    const curField = {
      name: fieldName,
      value: String(fieldsMap[fieldName]),
      quoted: areQuotesNeeded(instruction.name, fieldName)
    };
    fields.push(curField);
  }
  return {
    name: instruction.name,
    fields: fields
  };
}
exports.separateFields = separateFields;

function appendProperties(properties, instructions) {
  for (const instructionName of Object.keys(properties)) {
    instructions.push(separateFields({
      name: instructionName,
      fields: properties[instructionName]
    }));
  }
}

function appendFonts(fonts, instructions) {
  for (const style of Object.keys(fonts)) {
    instructions.push(separateFields({
      name: "Font",
      fields: Object.assign({
        "Style": style
      }, fonts[style])
    }));
  }
}

function appendLyrics(lyrics, instructions) {
  let number = 1;
  for (const verse of lyrics) {
    instructions.push(separateFields({
      name:`Lyric${number}`,
      fields: verse
    }));
    number++;
  }
}

function appendMusic(music, instructions) {
  for (const instruction of music) {
    instructions.push(separateFields(instruction));
  }
}

function separateInstructions(song) {
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
    instructions: instructions
  };
}
exports.separateInstructions = separateInstructions;

exports.generate = function (song) {
  return lowlevelGenerator.generate(separateInstructions(song));
};
