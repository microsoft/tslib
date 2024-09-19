import { describe } from "node:test";

import * as tslibJs from "tslib/tslib.js";
import * as tslibEs6Js from "tslib/tslib.es6.js";
import * as tslibEs6Mjs from "tslib/tslib.es6.mjs";

/**
 * @template {keyof tslibJs} K
 * @param {K} helperName 
 * @param {(helper: tslibJs[K]) => any} test 
 */
export function testHelper(helperName, test) {
  describe(helperName, () => {
    describe("tslib.js", () => {
      test(tslibJs[helperName]);
    });
    describe("tslib.es6.js", () => {
      test(tslibEs6Js[helperName]);
    });
    describe("tslib.es6.mjs", () => {
      test(tslibEs6Mjs[helperName]);
    });
  });
}
