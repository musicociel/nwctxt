const os = require("os");

/** @type import("prettier").Options */
module.exports = {
  printWidth: 150,
  singleQuote: false,
  endOfLine: os.EOL === "\r\n" ? "crlf" : "lf",
  trailingComma: "none"
};
