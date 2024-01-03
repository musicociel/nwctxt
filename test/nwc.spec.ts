import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { emptyNWCTXT } from "../src";
import { extractNWCTXT } from "../src/nwc";
import { normalizeEndOfLine } from "./endOfLines";

const filesFolder = path.join(__dirname, "nwc");

describe(`extractNWCTXT on files in ${filesFolder}`, () => {
  fs.readdirSync(filesFolder).forEach((nwcFile) => {
    it(nwcFile, async () => {
      const fullFilePath = path.join(filesFolder, nwcFile);
      const nwcFileContent = await fs.promises.readFile(fullFilePath);
      const nwcTxtFileContent = extractNWCTXT(nwcFileContent);
      expect(normalizeEndOfLine(nwcTxtFileContent)).toBe(normalizeEndOfLine(emptyNWCTXT));
    });
  });
});
