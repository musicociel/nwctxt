# nwctxt

[![Build Status](https://travis-ci.org/davdiv/nwctxt.svg?branch=master)](https://travis-ci.org/davdiv/nwctxt)

Parser and generator for the `.nwctxt` format used by [Note Worthy Composer](https://noteworthycomposer.com/).

## Installation

```
npm install --save nwctxt
```

## Usage

### Normal API

#### Parser

```js
import { readFileSync } from "fs";
import { parser } from "nwctxt";

// Parses myFile.nwctxt:
const fileContent = readFileSync("myFile.nwctxt", "utf-8");
const parsedFile = parser.parse(fileContent);
```

Examples of `nwctxt` files and their equivalent `json` representation returned by the parser are available in [the test/files folder](test/files).

#### Generator

```js
import { writeFileSync } from "fs";
import { generator } from "nwctxt";

// Generates myNewFile.nwctxt:
const newFileContent = generator.generate(parsedFile);
writeFileSync("myNewFile.nwctxt", newFileContent, "utf-8");
```

### Lower level API

The lower level API is similar to the normal API but works with a simpler representation of `nwctxt` files, containing a simple array of instructions, without separating the different staffs. It is used internally by the normal API.

#### Parser

```js
import { readFileSync } from "fs";
import { lowlevel } from "nwctxt";

// Parses myFile.nwctxt:
const fileContent = readFileSync("myFile.nwctxt", "utf-8");
const parsedFile = lowlevel.parse(fileContent);

// parsedFile contains:
// parsedFile.version: Note Worthy Composer version as a string (e.g: "2.75")
// parsedFile.clip: true if the parsed content is in the clipboard format (!NoteWorthyComposerClip),
//                  false otherwise (!NoteWorthyComposer)
// parsedFile.extra: Extra information after Note Worthy Composer version (e.g. "Single")
// parsedFile.instructions: array of line objects with the following structure:
// parsedFile.instructions[0].name: Name of the command (such as "AddStaff")
// parsedFile.instructions[0].fields: array of parameters with the following structure:
// parsedFile.instructions[0].fields[0].name: Name of the parameter
// parsedFile.instructions[0].fields[0].quoted: Whether the value is quoted
// parsedFile.instructions[0].fields[0].value: Value of the parameter
```

#### Generator

```js
import { writeFileSync } from "fs";
import { lowlevel } from "nwctxt";

// Generates myNewFile.nwctxt:
const newFileContent = lowlevel.generate(parsedFile);
writeFileSync("myNewFile.nwctxt", newFileContent, "utf-8");
```

## License

[MIT License](./LICENSE)
