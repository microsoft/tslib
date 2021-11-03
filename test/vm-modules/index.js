import fs from "node:fs"
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modulerefContents = fs.readFileSync(resolve(__dirname, "../../modules/index.js"), {encoding: "utf8"});
const tslibjsContents = fs.readFileSync(resolve(__dirname, "../../tslib.js"), {encoding: "utf8"});
const contextifiedObject = vm.createContext({});

async function linker(specifier, referencingModule) {
  if (specifier === '../tslib.js') {
    return new vm.SourceTextModule(tslibjsContents, { context: referencingModule.context });
  }
  throw new Error(`Unable to resolve dependency: ${specifier}`);
}

const m = new vm.SourceTextModule(modulerefContents, { context: contextifiedObject })

await m.link(linker);
await m.evaluate();
