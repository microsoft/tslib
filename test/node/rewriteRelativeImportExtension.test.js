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

  test("rewrites additional extensions literally", () => {
    const extensions = { ".gts": ".js", ".vue": ".js", ".v+ue": ".mjs", ".remove": "" };
    assert.equal(__rewriteRelativeImportExtension("./foo.gts", false, extensions), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("../nested/foo.vue", false, extensions), "../nested/foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo.v+ue", false, extensions), "./foo.mjs");
    assert.equal(__rewriteRelativeImportExtension("./foo.vvue", false, extensions), "./foo.vvue");
    assert.equal(__rewriteRelativeImportExtension("./foo.remove", false, extensions), "./foo");
  });

  test("matches additional extensions case-sensitively unless requested otherwise", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.GTS", false, { ".gts": ".js" }), "./foo.GTS");
    assert.equal(__rewriteRelativeImportExtension("./foo.GTS", false, { ".gts": ".js" }, false), "./foo.GTS");
    assert.equal(__rewriteRelativeImportExtension("./foo.GTS", false, { ".gts": ".js" }, true), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo.gts", false, { ".GTS": ".js" }, true), "./foo.js");
  });

  test("applies additional extensions before built-in rewrites without rewriting the output", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.ts", false, { ".ts": ".custom" }), "./foo.custom");
    assert.equal(__rewriteRelativeImportExtension("./foo.tsx", true, { ".tsx": ".custom" }), "./foo.custom");
    assert.equal(__rewriteRelativeImportExtension("./foo.gts", false, { ".gts": ".ts" }), "./foo.ts");
    assert.equal(__rewriteRelativeImportExtension("./foo.d.ts", false, { ".d.ts": ".js" }), "./foo.js");
  });

  test("preserves the original spelling for identity mappings", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.ts", false, { ".ts": ".ts" }), "./foo.ts");
    assert.equal(__rewriteRelativeImportExtension("./foo.TS", false, { ".ts": ".ts" }, true), "./foo.TS");
  });

  test("uses the first matching additional extension in enumeration order", () => {
    assert.equal(__rewriteRelativeImportExtension("./foo.vue.ts", false, { ".vue.ts": ".js", ".ts": ".mjs" }), "./foo.js");
    assert.equal(__rewriteRelativeImportExtension("./foo.vue.ts", false, { ".ts": ".mjs", ".vue.ts": ".js" }), "./foo.vue.mjs");
  });

  test("falls back to existing rewrites when no additional extension matches", () => {
    for (const extensions of [undefined, {}, { ".gts": ".js" }]) {
      assert.equal(__rewriteRelativeImportExtension("./foo.ts", false, extensions), "./foo.js");
      assert.equal(__rewriteRelativeImportExtension("./foo.mts", false, extensions), "./foo.mjs");
      assert.equal(__rewriteRelativeImportExtension("./foo.cts", false, extensions), "./foo.cjs");
      assert.equal(__rewriteRelativeImportExtension("./foo.tsx", true, extensions), "./foo.jsx");
      assert.equal(__rewriteRelativeImportExtension("./foo.d.ts", false, extensions), "./foo.d.ts");
    }
    assert.equal(__rewriteRelativeImportExtension("./foo.TS", false, { ".gts": ".js" }, false), "./foo.js");
  });

  test("does not apply additional extensions to non-relative or non-string imports", () => {
    const extensions = { ".gts": ".js" };
    for (const path of ["foo.gts", "/foo.gts", "https://example.com/foo.gts", "#foo.gts", null, undefined, 42, {}]) {
      assert.strictEqual(__rewriteRelativeImportExtension(path, false, extensions, true), path);
    }
  });
});
