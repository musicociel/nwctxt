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

import { describe, it, expect, afterAll } from "vitest";
import schema from "../dist/schema.json";
import * as nwctxt from "../src";

import fs from "fs";
import path from "path";

import Ajv from "ajv";
const ajv = new Ajv();

const validate = ajv.compile<nwctxt.NWCTXTFile>(schema);
const filesFolder = path.join(__dirname, "files");
const nwctxtExtension = /\.nwctxt$/i;

describe(`parser/generator on files in ${filesFolder}`, () => {
  fs.readdirSync(filesFolder).forEach((nwctxtFile) => {
    if (nwctxtExtension.test(nwctxtFile)) {
      it(nwctxtFile, async () => {
        // Check the parser:
        const nwctxtFileContent = await fs.promises.readFile(path.join(filesFolder, nwctxtFile), "utf-8");
        if (nwctxtFile === "empty.nwctxt") {
          expect(nwctxtFileContent.replace(/\r\n/g, "\n")).toBe(nwctxt.emptyNWCTXT.replace(/\r\n/g, "\n"));
        }
        const parseResult = nwctxt.parser.parse(nwctxtFileContent);
        const jsonFileContent = JSON.stringify(parseResult);
        await expect(parseResult).toMatchFileSnapshot(path.join(filesFolder, nwctxtFile.replace(nwctxtExtension, ".txt")));
        const isValid = validate(parseResult);
        expect(isValid, JSON.stringify(validate.errors, null, " ")).toBe(true);
        if (nwctxtFile === "empty.nwctxt") {
          expect(parseResult).toStrictEqual(nwctxt.createSong());
        }

        // Check the generator (with the help of the parser):
        const generatedContent = nwctxt.generator.generate(JSON.parse(jsonFileContent));
        const secondParseResult = nwctxt.parser.parse(generatedContent);
        expect(secondParseResult).toStrictEqual(JSON.parse(jsonFileContent));
      });
    }
  });

  afterAll(async () => {
    const fieldsByInstruction = nwctxt.parser.fieldsByInstruction;
    let content = "";
    for (const [instruction, fields] of fieldsByInstruction.entries()) {
      content += `export interface NWCTXT${instruction} {\n`;
      content += `    name: ${JSON.stringify(instruction)};\n`;
      content += `    fields: {\n`;
      for (const [fieldName, s] of fields.entries()) {
        content += `        /**\n`;
        for (const example of s.values()) {
          if (example.length < 100) {
            content += `         * @example ${example}\n`;
          }
        }
        content += `         */\n`;
        content += `        ${JSON.stringify(fieldName)}?: any;\n`;
      }
      content += `    }\n`;
      content += `}\n\n`;
    }
    await fs.promises.writeFile("out-types.ts", content);
  });
});
