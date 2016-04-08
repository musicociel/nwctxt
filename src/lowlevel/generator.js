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

const backslash = /\\/g;
const pipe = /\|/g;
const doubleQuote = /"/g;
const singleQuote = /'/g;
const cr = /\r/g;
const lf = /\n/g;

function quote(value) {
  return `"${value.replace(backslash, "\\]").replace(pipe, "\\}").replace(doubleQuote, "\\\"").replace(singleQuote, "\\\'").replace(cr, "\\r").replace(lf, "\\n")}"`;
}

function processLine (lineInfo) {
  const res = [`|${lineInfo.name}`];
  const fields = lineInfo.fields;
  fields.forEach(field => {
    res.push("|");
    if (field.name) {
      res.push(`${field.name}:`);
    }
    let value = field.value;
    if (field.quoted) {
      value = quote(value);
    }
    res.push(value);
  });
  return res.join("");
}

exports.generate = function (parsedFile) {
  const clip = parsedFile.clip ? "Clip" : "";
  const extra = parsedFile.extra ? `,${parsedFile.extra}` : "";
  return `!NoteWorthyComposer${clip}(${parsedFile.version}${extra})\r\n${parsedFile.instructions.map(processLine).join("\r\n")}\r\n!NoteWorthyComposer${clip}-End\r\n`;
};
