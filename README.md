# Runtime

This is a runtime library for [TypeScript](http://www.typescriptlang.org/) that contains all of the TypeScript helper functions.

# Installing

For the latest stable version:

## npm

```sh
npm install tslib
```

## bower

```sh
bower install tslib
```

# Usage

Set the `importHelpers` compiler option on the command line:

```
tsc --importHelpers file.ts
```

or in your tsconfig.json:

```json
{
    "compilerOptions": {
        "importHelpers": true
    }
}
```

#### For bower users

You will need to add a `paths` mapping for `tslib`, e.g.:

```json
{
    "compilerOptions": {
        "module": "amd",
        "importHelpers": true,
        "baseUrl": "./",
        "paths": {
            "tslib" : ["bower_components/tslib/tslib.d.ts"]
        }
    }
}
```

# Contribute

There are many ways to [contribute](https://github.com/Microsoft/TypeScript/blob/master/CONTRIBUTING.md) to TypeScript.
* [Submit bugs](https://github.com/Microsoft/TypeScript/issues) and help us verify fixes as they are checked in.
* Review the [source code changes](https://github.com/Microsoft/TypeScript/pulls).
* Engage with other TypeScript users and developers on [StackOverflow](http://stackoverflow.com/questions/tagged/typescript).
* Join the [#typescript](http://twitter.com/#!/search/realtime/%23typescript) discussion on Twitter.
* [Contribute bug fixes](https://github.com/Microsoft/TypeScript/blob/master/CONTRIBUTING.md).
* Read the language specification ([docx](http://go.microsoft.com/fwlink/?LinkId=267121), [pdf](http://go.microsoft.com/fwlink/?LinkId=267238)).

# Documentation

* [Quick tutorial](http://www.typescriptlang.org/Tutorial)
* [Programming handbook](http://www.typescriptlang.org/Handbook)
* [Language specification](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md)
* [Homepage](http://www.typescriptlang.org/)
