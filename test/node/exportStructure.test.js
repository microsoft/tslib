import assert from "node:assert";
import { test } from "node:test";

import * as tslibJs from "tslib/tslib.js";
import * as tslibEs6Js from "tslib/tslib.es6.js";
import * as tslibEs6Mjs from "tslib/tslib.es6.mjs";
import * as tslibModulesIndex from "tslib/modules/index.js";

test("all helpers available as named exports", () => {
  compareKeys("tslib.js", tslibJs, "tslib.es6.js", tslibEs6Js);
  compareKeys("tslib.js", tslibJs, "tslib.es6.mjs", tslibEs6Mjs);
  compareKeys("tslib.js", tslibJs, "modules/index.js", tslibModulesIndex);
});

test("default export contains all named exports", () => {
  assert.ok(tslibJs.default);
  compareKeys("tslib.js (default export)", tslibJs.default, "tslib.js (namespace)", tslibJs);
  assert.ok(tslibEs6Js.default);
  compareKeys("tslib.es6.js (default export)", tslibEs6Js.default, "tslib.es6.js (namespace)", tslibEs6Js);
  assert.ok(tslibEs6Mjs.default);
  compareKeys("tslib.es6.mjs (default export)", tslibEs6Mjs.default, "tslib.es6.mjs (namespace)", tslibEs6Mjs);
});

/**
 * @param {string} name1
 * @param {object} tslib1
 * @param {string} name2
 * @param {object} tslib2
 */
function compareKeys(name1, tslib1, name2, tslib2) {
  const difference = new Set(Object.keys(tslib1)).symmetricDifference(new Set(Object.keys(tslib2)));
  difference.delete("__esModule");
  difference.delete("default"); // Asserted separately where expected
  const messages = Array.from(difference).map(missing => `'${missing}' missing in ${missing in tslib1 ? name2 : name1}`);
  if (messages.length > 0) {
    assert.fail(`Mismatch between ${name1} and ${name2}:\n\n  ${messages.join("\n  ")}\n`);
  }
}