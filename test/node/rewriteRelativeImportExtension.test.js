import assert from "node:assert";
import { test } from "node:test";
import { testHelper } from "./testHelper.js";

testHelper("__rewriteRelativeImportExtension", __rewriteRelativeImportExtension => {
  test("rewrites relative .ts to .js", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.ts"), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("../foo.ts"), "../foo.js");
    assert.equal(__rewriteRelativeImportExtension("../../foo.ts"), "../../foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo.TS"), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo.Ts"), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo/.hidden/foo.ts"), "./foo/.hidden/foo.js");
  });

  test("rewrites other TypeScript extensions", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.mts"), "./foo.mjs");
    assert.equal(__rewriteRelativeImportExtension("./foo.cts"), "./foo.cjs");
    assert.equal(__rewriteRelativeImportExtension("./foo.tsx"), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo.tsx", true), "./foo.jsx");
    assert.equal(__rewriteRelativeImportExtension("./foo.Tsx", true), "./foo.jsx");
    assert.equal(__rewriteRelativeImportExtension("./foo.d.css.mts"), "./foo.d.css.mjs");
    assert.equal(__rewriteRelativeImportExtension("./foo.d.tsx"), "./foo.d.js");
  });

  test("does not rewrite other extensions", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.js"), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo.mjs"), "./foo.mjs");
    assert.equal(__rewriteRelativeImportExtension("./foo.cjs"), "./foo.cjs");
    assert.equal(__rewriteRelativeImportExtension("./foo.jsx"), "./foo.jsx");
    assert.equal(__rewriteRelativeImportExtension("./foo.json"), "./foo.json");
    assert.equal(__rewriteRelativeImportExtension("./foo.css"), "./foo.css");
    assert.equal(__rewriteRelativeImportExtension("./foo"), "./foo");
    assert.equal(__rewriteRelativeImportExtension("./foo.d.php?q=1.ts"), "./foo.d.php?q=1.ts");
  });

  test("does not rewrite non-relative imports", () => {
    assert.equal(__rewriteRelativeImportExtension("foo.ts"), "foo.ts");
    assert.equal(__rewriteRelativeImportExtension("foo.mts"), "foo.mts");
    assert.equal(__rewriteRelativeImportExtension("foo.cts"), "foo.cts");
    assert.equal(__rewriteRelativeImportExtension("foo.tsx"), "foo.tsx");
    assert.equal(__rewriteRelativeImportExtension("foo.js"), "foo.js");
    assert.equal(__rewriteRelativeImportExtension("foo.mjs"), "foo.mjs");
    assert.equal(__rewriteRelativeImportExtension("foo.cjs"), "foo.cjs");
    assert.equal(__rewriteRelativeImportExtension("foo.jsx"), "foo.jsx");
    assert.equal(__rewriteRelativeImportExtension("foo.json"), "foo.json");
    assert.equal(__rewriteRelativeImportExtension("foo.css"), "foo.css");
    assert.equal(__rewriteRelativeImportExtension("foo"), "foo");
  });

  test("does not rewrite declaration file extensions", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.d.ts"), "./foo.d.ts");
    assert.equal(__rewriteRelativeImportExtension("./foo.d.mts"), "./foo.d.mts");
    assert.equal(__rewriteRelativeImportExtension("./foo.d.cts"), "./foo.d.cts");
    assert.equal(__rewriteRelativeImportExtension("./foo.d.css.ts"), "./foo.d.css.ts");
    assert.equal(__rewriteRelativeImportExtension("./foo.D.ts"), "./foo.D.ts");
  });
});
