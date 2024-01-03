import { inflate } from "pako";

const compressedNWC = "[NWZ]\0";
const uncompressedNWC = "[NoteWorthy ArtWare]\0\0\0[NoteWorthy Composer]\0";
const nwctxtHeader = "!NoteWorthyComposer(";

const compareStartBytes = (content: Uint8Array, comparison: string) => {
  const length = comparison.length;
  if (content.length < length) {
    return false;
  }
  for (let i = 0; i < length; i++) {
    if (content[i] !== comparison.charCodeAt(i)) return false;
  }
  return true;
};

export const extractNWCTXT = (content: Uint8Array) => {
  if (compareStartBytes(content, compressedNWC)) {
    content = inflate(content.subarray(compressedNWC.length));
  }
  if (compareStartBytes(content, uncompressedNWC)) {
    content = content.subarray(uncompressedNWC.length);
  }
  const textDecoder = new TextDecoder();
  const text = textDecoder.decode(content);
  const headerPosition = text.indexOf(nwctxtHeader);
  if (headerPosition === -1) {
    throw new Error("Unknown file content");
  }
  return text.substring(headerPosition);
};
