import { writable, asReadable } from "@amadeus-it-group/tansu";
import { extractNWCTXT } from "nwctxt/nwc";
import { parse } from "nwctxt/parser";
import type { NWCTXTFile } from "nwctxt";

const writableFileContentPromise$ = writable(null as Promise<NWCTXTFile> | null);
export const fileContentPromise$ = asReadable(writableFileContentPromise$);

const readFile = (file: File) =>
  new Promise<Uint8Array>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(new Uint8Array(fileReader.result as ArrayBuffer));
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });

const asyncOpenFile = async (file: File) => {
  const fileContent = await readFile(file);
  const nwcTxt = extractNWCTXT(fileContent);
  return parse(nwcTxt);
};

export const openFile = (file: File) => {
  writableFileContentPromise$.set(asyncOpenFile(file));
};
