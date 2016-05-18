[![Issue Stats](http://issuestats.com/github/Microsoft/TypeScript-Runtime/badge/pr)](http://issuestats.com/github/microsoft/typescript-runtime)
[![Issue Stats](http://issuestats.com/github/Microsoft/TypeScript-Runtime/badge/issue)](http://issuestats.com/github/microsoft/typescript-runtime)

# Runtime

This is a runtime library for [TypeScript](http://www.typescriptlang.org/) that contains all of the TypeScript helper functions.

# Installing

For the latest stable version:

```
npm install tslib
```

# Usage

Set the `noEmitHelpers` compiler option on the command line or in your tsconfig.json:
```
tsc --noEmitHelpers
```

Import tslib in your TypeScript sources:
```ts
import * as tslib from "tslib";

const __extends = tslib.__extends;
const __awaiter = tslib.__awaiter;

...
```

Or use it globally on the web via `<script src="tslib.js"></script>`:

```ts
// <reference path="tslib.global.d.ts" />
var __extends = __tslib.__extends;
var __awaiter = __tslib.__awaiter;

...
```

## Contribute

There are many ways to [contribute](https://github.com/Microsoft/TypeScript/blob/master/CONTRIBUTING.md) to TypeScript.
* [Submit bugs](https://github.com/Microsoft/TypeScript/issues) and help us verify fixes as they are checked in.
* Review the [source code changes](https://github.com/Microsoft/TypeScript/pulls).
* Engage with other TypeScript users and developers on [StackOverflow](http://stackoverflow.com/questions/tagged/typescript).
* Join the [#typescript](http://twitter.com/#!/search/realtime/%23typescript) discussion on Twitter.
* [Contribute bug fixes](https://github.com/Microsoft/TypeScript/blob/master/CONTRIBUTING.md).
* Read the language specification ([docx](http://go.microsoft.com/fwlink/?LinkId=267121), [pdf](http://go.microsoft.com/fwlink/?LinkId=267238)).


## Documentation

*  [Quick tutorial](http://www.typescriptlang.org/Tutorial)
*  [Programming handbook](http://www.typescriptlang.org/Handbook)
*  [Language specification](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md)
*  [Homepage](http://www.typescriptlang.org/)