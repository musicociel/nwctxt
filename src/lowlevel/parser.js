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

const lineBreak = /\r?\n/;
const header = /^!NoteWorthyComposer(Clip)?\(([^),]+)(?:,([^)]*))?\)$/;
const escapeSequence = /\\(.)/g;
const replacement = {
  "\"": "\"",
  "\'": "\'",
  "n": "\n",
  "r": "\r",
  "}": "|",
  "]": "\\"
};

class ParseError extends Error {}
exports.ParseError = ParseError;

function escapeSequenceReplacer(all, escapedChar) {
  const res = replacement[escapedChar];
  if (!res) {
    throw new ParseError(escapedChar);
  }
  return res;
}

function processQuotedValue(value) {
  return value.replace(escapeSequence, escapeSequenceReplacer);
}

exports.parse = function (text) {
  const instructions = [];
  const result = {
    instructions: instructions
  };
  const lines = text.split(lineBreak);
  let state = 0; // 0 = before header, 1 = between header and footer, 2 = after footer
  let expectedFooter;
  for (const line of lines) {
    if ((line.length === 0 && state > 0) || line[0] === "#") {
      // comment
      continue;
    } else if (line[0] === "|" && state === 1) {
      const lineParts = line.split("|");
      const fields = [];
      const item = {
        name: lineParts[1],
        fields: fields
      };
      for (const part of lineParts.slice(2)) {
        const colon = part.indexOf(":");
        let value = colon > -1 ? part.slice(colon + 1) : part;
        const quoted = value.length >= 2 && value[0] == "\"" && value[value.length - 1] == "\"";
        if (quoted) {
          value = processQuotedValue(value.slice(1, -1));
        }
        const field = {
          name: colon > -1 ? part.slice(0, colon) : null,
          value: value,
          quoted: quoted
        };
        fields.push(field);
      }
      instructions.push(item);
      continue;
    } else if (state == 0) {
      const matchLine = header.exec(line);
      if (matchLine) {
        result.clip = !! matchLine[1];
        result.version = matchLine[2];
        result.extra = matchLine[3] || null;
        expectedFooter = `!NoteWorthyComposer${result.clip ? "Clip" : ""}-End`;
        state = 1;
        continue;
      }
    } else if (state == 1 && line === expectedFooter) {
      state = 2;
      continue;
    }
    // unexpected case:
    throw new ParseError(line);
  }
  return result;
};
