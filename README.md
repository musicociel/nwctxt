# nwctxt

Parser and generator for the `.nwctxt` format used by [Note Worthy Composer](https://noteworthycomposer.com/).

## Installation

```
npm install --save nwctxt
```

## Usage

### Normal API

#### Parser

```js
// Parses myFile.nwctxt:
const fileContent = require("fs").readFileSync("myFile.nwctxt", "utf-8");
const parsedFile = require("nwctxt").parser.parse(fileContent);
```

Examples of `nwctxt` files and their equivalent `json` representation returned by the parser are available in [the test/files folder](test/files).

#### Generator

```js
// Generates myNewFile.nwctxt:
const newFileContent = require("nwctxt").generator.generate(parsedFile);
require("fs").writeFileSync("myNewFile.nwctxt", newFileContent, "utf-8");
```

### Lower level API

The lower level API is similar to the normal API but works with a simpler representation of `nwctxt` files, containing a simple array of instructions, without separating the different staffs. It is used internally by the normal API.

#### Parser

```js
// Parses myFile.nwctxt:
const fileContent = require("fs").readFileSync("myFile.nwctxt", "utf-8");
const parsedFile = require("nwctxt").lowlevel.parser.parse(fileContent);

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
```

#### Generator

```js
// Generates myNewFile.nwctxt:
const newFileContent = require("nwctxt").lowlevel.generator.generate(parsedFile);
require("fs").writeFileSync("myNewFile.nwctxt", newFileContent, "utf-8");
```

## License

[MIT License](./LICENSE)
