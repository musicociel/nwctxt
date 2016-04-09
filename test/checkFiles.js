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

const assert = require("assert");
const nwctxt = require("../dist/nwctxt");

const fs = require("fs");
const path = require("path");
const filesFolder = path.join(__dirname, "files");
const nwctxtExtension = /\.nwctxt$/i;
let foundEmptyNWCTXT = false;

process.stderr.write(`Testing the parser/generator on files in ${filesFolder}:\n`);
fs.readdirSync(filesFolder).forEach(function (nwctxtFile) {
  if (nwctxtExtension.test(nwctxtFile)) {
    process.stderr.write(`- ${nwctxtFile}\n`);

    // Check the parser:

    const nwctxtFileContent = fs.readFileSync(path.join(filesFolder, nwctxtFile), "utf-8");
    if (nwctxtFile === "empty.nwctxt") {
      foundEmptyNWCTXT = true;
      assert.strictEqual(nwctxtFileContent, nwctxt.emptyNWCTXT);
    }
    const jsonFile = path.join(filesFolder, nwctxtFile.replace(nwctxtExtension, ".json"));
    let jsonFileContent = null;
    const parseResult = nwctxt.parser.parse(nwctxtFileContent);
    if (nwctxtFile === "empty.nwctxt") {
      assert.deepStrictEqual(parseResult, nwctxt.createSong());
    }
    try {
      jsonFileContent = fs.readFileSync(jsonFile, "utf-8");
    } catch (e) {
      process.stderr.write(`${jsonFile} is missing and will be generated.\n`);
    }
    if (jsonFileContent) {
      assert.deepStrictEqual(parseResult, JSON.parse(jsonFileContent));
    } else {
      jsonFileContent = JSON.stringify(parseResult, null, " ");
      fs.writeFileSync(jsonFile, jsonFileContent, "utf-8");
    }

    // Check the generator (with the help of the parser):

    const generatedContent = nwctxt.generator.generate(JSON.parse(jsonFileContent));
    const secondParseResult = nwctxt.parser.parse(generatedContent);
    assert.deepStrictEqual(secondParseResult, JSON.parse(jsonFileContent));
  }
});

assert.strictEqual(foundEmptyNWCTXT, true, "Did not find empty.nwctxt");
