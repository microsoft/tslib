import assert from "node:assert";
import { test } from "node:test";
import { testHelper } from "./testHelper.js";

testHelper("__rest", __rest => {
  test("copies an own __proto__ key as a data property", () => {
    const source = JSON.parse('{"a":1,"__proto__":{"polluted":true}}');
    const rest = __rest(source, ["a"]);
    assert.equal(Object.getPrototypeOf(rest), Object.prototype);
    assert.equal(rest.polluted, undefined);
    assert.deepEqual(Object.keys(rest), ["__proto__"]);
    assert.deepEqual(Object.getOwnPropertyDescriptor(rest, "__proto__"), { value: { polluted: true }, writable: true, enumerable: true, configurable: true });
  });
});
