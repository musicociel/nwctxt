# nwctxt

Parser and generator for the `.nwctxt` format used by [Note Worthy Composer](https://noteworthycomposer.com/).

## Installation

```
npm install --save nwctxt
```

## Usage

### Low level API

```js
const fs = require("fs");
const nwctxt = require("nwctxt").lowlevel;

const fileContent = fs.readFileSync("myFile.nwctxt", "utf-8");
const parsedFile = nwctxt.parser.parse(fileContent);

// parsedFile contains:
// parsedFile.version: Note Worthy Composer version as a string (e.g: "2.75")
// parsedFile.clip: true if the parsed content is in the clipboard format (!NoteWorthyComposerClip),
//                  false otherwise (!NoteWorthyComposer)
// parsedFile.extra: Extra information after Note Worthy Composer version (e.g. "Single")
// parsedFile.content: array of line objects with the following structure:
// parsedFile.content[0].name: Name of the command (such as "AddStaff")
// parsedFile.content[0].params: array of parameters with the following structure:
// parsedFile.content[0].params[0].name: Name of the parameter
// parsedFile.content[0].params[0].quoted: Whether the value is quoted
// parsedFile.content[0].params[0].value: Value of the parameter

const newFileContent = nwctxt.generator.generate(parsedFile);
fs.writeFileSync("myNewFile.nwctxt", newFileContent, "utf-8");
```

## License

[MIT License](./LICENSE)
