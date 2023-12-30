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

// Small command line tool allowing to test the parser/generator on a set of files.

import assert from "assert";
import fs from "fs";
import * as nwctxt from "../../src";

function createChecker(parse, generate) {
  return function (fileContent) {
    const parsedFile1 = parse(fileContent);
    const generatedFile = generate(parsedFile1);
    const parsedFile2 = parse(generatedFile);
    assert.deepStrictEqual(parsedFile1, parsedFile2);
  };
}

const checker = createChecker(nwctxt.parser.parse, nwctxt.generator.generate);
const lowLevelChecker = createChecker(nwctxt.lowlevel.parse, nwctxt.lowlevel.generate);

let errors = 0;
let successes = 0;
process.argv.slice(2).forEach((fileName) => {
  process.stdout.write(`Checking ${fileName}\n`);
  const fileContent = fs.readFileSync(fileName, "utf-8");
  try {
    checker(fileContent);
    successes++;
  } catch (e) {
    errors++;
    process.stderr.write(`With ${fileName}: ${e}\n`);
    try {
      lowLevelChecker(fileContent);
      process.stderr.write(`Low-level check successful\n`);
    } catch (e) {
      process.stderr.write(`Low-level check also failing\n`);
    }
  }
});

process.stderr.write(errors > 0 ? `${errors} error(s) (and ${successes} successful checks)!\n` : `Success (${successes} file(s) checked)\n`);
process.exit(errors > 0 ? -1 : 0);
