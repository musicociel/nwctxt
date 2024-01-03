const endOfLine = /\r\n/g;
export const normalizeEndOfLine = (text: string) => text.replace(endOfLine, "\n");
