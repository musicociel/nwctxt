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

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const nwctxt = require("../../src").lowlevel;

const originalFile = fs.readFileSync(path.join(__dirname, "file.nwctxt"), "utf-8");
const originalClip = `!NoteWorthyComposerClip(2.75,Single)
|Clef|Type:Treble
|Key|Signature:Bb,Eb,Ab,Db|Tonic:A
|Tempo|Base:Half|Tempo:52|Pos:12|Placement:AsStaffSignature
|TimeSig|Signature:AllaBreve
|User|ChordPlay.nw|Pos:7|Name:Fm|Span:3
|Note|Dur:Half|Pos:-3
|Note|Dur:Half|Pos:1
!NoteWorthyComposerClip-End
`;

const parsedFile = nwctxt.parser.parse(originalFile);
const parsedClip = nwctxt.parser.parse(originalClip);

assert.equal(parsedFile.version, "2.75");
assert.equal(parsedFile.clip, false);
assert.equal(parsedFile.extra, null);
assert.equal(parsedFile.instructions[1].name, "SongInfo");
assert.equal(parsedFile.instructions[1].fields[0].name, "Title");
assert.equal(parsedFile.instructions[1].fields[0].value, "Test: \"with\" { } | [ ] \\ / 'special' _ - `chars`");
assert.equal(parsedFile.instructions[1].fields[0].quoted, true);

assert.equal(parsedClip.version, "2.75");
assert.equal(parsedClip.clip, true);
assert.equal(parsedClip.extra, "Single");
assert.equal(parsedClip.instructions[0].name, "Clef");
assert.equal(parsedClip.instructions[0].fields[0].name, "Type");
assert.equal(parsedClip.instructions[0].fields[0].value, "Treble");
assert.equal(parsedClip.instructions[0].fields[0].quoted, false);

const generatedFile = nwctxt.generator.generate(parsedFile);
const generatedClip = nwctxt.generator.generate(parsedClip);

assert.equal(originalFile.replace(/\r\n/g, "\n"), generatedFile.replace(/\r\n/g, "\n"));
assert.equal(originalClip.replace(/\r\n/g, "\n"), generatedClip.replace(/\r\n/g, "\n"));
