// This file can only run on node 14+, it validates that all of the commonjs exports
// are correctly re-exported for es modules importers.

// ES Modules import via the ./modules folder
import * as esTSLib from "../../modules/index.js"

// Force a commonjs resolve
import { createRequire } from "module";
const commonJSTSLib = createRequire(import.meta.url)("../../tslib.js");

for (const key in commonJSTSLib) {
  if (commonJSTSLib.hasOwnProperty(key)) {
    if(!esTSLib[key]) throw new Error(`ESModules is missing ${key} - it needs to be re-exported in  ./modules/index.js`)
  }
}

console.log("All exports in commonjs are available for es module consumers.")
