import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as ts from "typescript";

const rootDir = path.resolve(__dirname, `..`);
const srcDir = path.resolve(rootDir, `src`);
const copyrightNotice = fs.readFileSync(path.resolve(rootDir, "CopyrightNotice.txt"), "utf8").trim();
const tslibFile = path.resolve(srcDir, "tslib.js");
const indentStrings: string[] = ["", "    "];
const MAX_SMI_X86 = 0x3fff_ffff;

const enum LibKind {
    CommonJS,
    Amd,
    Umd,
    UmdGlobal,
    Global,
    ES2015
}

class TextWriter {
    public indent = 0;
    private output = "";
    private pendingNewLines = 0;

    write(s: string) {
        if (s && s.length) {
            this.writePendingNewLines();
            this.output += s;
        }
    }

    writeLine(s?: string) {
        this.write(s);
        this.pendingNewLines++;
    }

    writeLines(s: string): void {
        if (s) {
            const lines = s.split(/\r\n?|\n/g);
            const indentation = guessIndentation(lines);
            let firstLine = true;
            for (const lineText of lines) {
                const line = indentation ? lineText.slice(indentation) : lineText;
                if (!line.trim() && firstLine) continue;
                if (!this.pendingNewLines && this.output.length > 0) {
                    this.writeLine();
                }
                this.writeLine(line);
                firstLine = false;
            }
        }
    }

    toString() {
        return this.output;
    }

    private writePendingNewLines() {
        if (this.pendingNewLines > 0) {
            do {
                this.output += "\n";
                this.pendingNewLines--;
            }
            while (this.pendingNewLines > 0);
            this.output += getIndentString(this.indent);
        }
    }
}

main();

function main() {
    const options: ts.CompilerOptions = {
        allowJs: true,
        noResolve: true,
        noEmit: true,
        target: ts.ScriptTarget.ES3,
        types: []
    };
    const host = ts.createCompilerHost(options, /*setParentNodes*/ true);
    const program = ts.createProgram({
        rootNames: [tslibFile],
        options,
        host,
    });
    generateSingleFileVariations(program, rootDir);
}

function getIndentString(level: number) {
    if (indentStrings[level] === undefined) {
        indentStrings[level] = getIndentString(level - 1) + indentStrings[1];
    }
    return indentStrings[level];
}

function guessIndentation(lines: string[]) {
    let indentation = MAX_SMI_X86;
    for (const line of lines) {
        if (!line.length) {
            continue;
        }
        let i = 0;
        for (; i < line.length && i < indentation; i++) {
            if (!/^[\s\r\n]/.test(line.charAt(i))) {
                break;
            }
        }
        if (i < indentation) {
            indentation = i;
        }
        if (indentation === 0) {
            return 0;
        }
    }
    return indentation === MAX_SMI_X86 ? undefined : indentation;
}

function mkdirpSync(dir: string) {
    try {
        fs.mkdirSync(dir);
    }
    catch (e) {
        if (e.code === "EEXIST") return;
        if (e.code === "ENOENT") {
            const parent = path.dirname(dir);
            if (parent && parent !== dir) {
                mkdirpSync(parent);
                fs.mkdirSync(dir);
                return;
            }
        }
        throw e;
    }
}

function generateSingleFileVariations(program: ts.Program, outDir: string) {
    generateSingleFile(program, path.resolve(outDir, "tslib.js"), LibKind.UmdGlobal);
    generateSingleFile(program, path.resolve(outDir, "tslib.umd.js"), LibKind.Umd);
    generateSingleFile(program, path.resolve(outDir, "tslib.cjs.js"), LibKind.CommonJS);
    generateSingleFile(program, path.resolve(outDir, "tslib.amd.js"), LibKind.Amd);
    generateSingleFile(program, path.resolve(outDir, "tslib.global.js"), LibKind.Global);
    generateSingleFile(program, path.resolve(outDir, "tslib.es6.js"), LibKind.ES2015);
}

function generateSingleFile(program: ts.Program, outFile: string, libKind: LibKind) {
    const sourceFiles = program.getSourceFiles().filter(file => path.extname(file.fileName) === ".js");
    const bundle = ts.createBundle(sourceFiles);
    const output = write(bundle, program.getTypeChecker(), libKind);
    mkdirpSync(path.dirname(outFile));
    fs.writeFileSync(outFile, output, "utf8");

    const htmlOutFile = outFile.replace(/\.js$/, ".html");
    fs.writeFileSync(htmlOutFile, `<script src="${path.basename(outFile)}"></script>`);
}

function formatMessage(node: ts.Node, message: string) {
    const sourceFile = node.getSourceFile();
    if (sourceFile) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        return `${sourceFile.fileName}(${line + 1}, ${character + 1}): ${message}`;
    }
    return message;
}

function reportError(node: ts.Node, message: string) {
    console.error(formatMessage(node, message));
}

function write(source: ts.Bundle, checker: ts.TypeChecker, libKind: LibKind) {
    const globalWriter = new TextWriter();
    const bodyWriter = new TextWriter();
    const exportWriter = new TextWriter();
    const unknownGlobals = new Set<string>();
    const rewriteExports = libKind === LibKind.Umd || libKind === LibKind.UmdGlobal || libKind === LibKind.CommonJS || libKind === LibKind.Amd;
    const useExporter = libKind === LibKind.Umd || libKind === LibKind.UmdGlobal;
    const useExports = libKind === LibKind.CommonJS || libKind === LibKind.Amd;
    const useGlobals = libKind === LibKind.UmdGlobal || libKind === LibKind.Global;
    let knownLocals = new Set<string>();
    let sourceFile: ts.SourceFile | undefined;

    return writeBundle(source);

    function writeBundle(node: ts.Bundle) {
        switch (libKind) {
            case LibKind.Umd:
            case LibKind.UmdGlobal:
                return writeUmdBundle(node);
            case LibKind.Amd:
                return writeAmdBundle(node);
            case LibKind.CommonJS:
                return writeCommonJSBundle(node);
            case LibKind.ES2015:
            case LibKind.Global:
                return writeES2015OrGlobalBundle(node);
        }
    }

    function writeHeader(writer: TextWriter) {
        writer.writeLines(copyrightNotice);
        writeLintGlobals(writer);
        writer.writeLine();
    }

    function writeLintGlobals(writer: TextWriter) {
        if (unknownGlobals.size > 0) {
            writer.writeLine(`/* global ${[...unknownGlobals].join(", ")} */`);
        }
    }

    function writeUmdHeader(writer: TextWriter) {
        writer.writeLines(`
            (function (factory) {
                if (typeof define === "function" && define.amd) {
                    define("tslib", ["exports"], function (exports) { factory(createExporter(exports)); });
                }
                else if (typeof module === "object" && typeof module.exports === "object") {
                    factory(createExporter(module.exports));
                }
                function createExporter(exports) {
                    if (typeof Object.create === "function") {
                        Object.defineProperty(exports, "__esModule", { value: true });
                    }
                    else {
                        exports.__esModule = true;
                    }
                    return function (id, v) { return exports[id] = v; };
                }
            })`);
    }

    function writeUmdGlobalHeader(writer: TextWriter) {
        writer.writeLines(`
            (function (factory) {
                var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
                if (typeof define === "function" && define.amd) {
                    define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
                }
                else if (typeof module === "object" && typeof module.exports === "object") {
                    factory(createExporter(root, createExporter(module.exports)));
                }
                else {
                    factory(createExporter(root));
                }
                function createExporter(exports, previous) {
                    if (exports !== root) {
                        if (typeof Object.create === "function") {
                            Object.defineProperty(exports, "__esModule", { value: true });
                        }
                        else {
                            exports.__esModule = true;
                        }
                    }
                    return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
                }
            })`);
    }

    function writeUmdBundle(node: ts.Bundle) {
        if (libKind === LibKind.UmdGlobal) {
            unknownGlobals.add("global");
        }
        
        unknownGlobals.add("define").add("module");
        visit(node);
        const writer = new TextWriter();
        writeHeader(writer);
        writer.writeLines(globalWriter.toString());
        if (libKind === LibKind.Umd) {
            writeUmdHeader(writer);
        }
        else {
            writeUmdGlobalHeader(writer);
        }

        writer.writeLine(`(function (exporter) {`);
        writer.indent++;
        writer.writeLines(bodyWriter.toString());
        writer.writeLine();
        writer.writeLines(exportWriter.toString());
        writer.indent--;
        writer.writeLine(`});`);
        return writer.toString();
    }

    function writeAmdBundle(node: ts.Bundle) {
        unknownGlobals.add("define");
        visit(node);
        const writer = new TextWriter();
        writeHeader(writer);
        writer.writeLine(`define("tslib", ["exports"], function (exports) {`);
        writer.indent++;
        writer.writeLines(bodyWriter.toString());
        writer.writeLine();
        writer.writeLines(exportWriter.toString());
        writer.indent--;
        writer.writeLine(`});`);
        return writer.toString();
    }

    function writeCommonJSBundle(node: ts.Bundle) {
        visit(node);
        const writer = new TextWriter();
        writeHeader(writer);
        writer.writeLines(bodyWriter.toString());
        writer.writeLine();
        writer.writeLines(exportWriter.toString());
        return writer.toString();
    }

    function writeES2015OrGlobalBundle(node: ts.Bundle) {
        visit(node);
        const writer = new TextWriter();
        writeHeader(writer);
        writer.writeLines(bodyWriter.toString());
        return writer.toString();
    }

    function visit(node: ts.Node) {
        visitNames(node);
        switch (node.kind) {
            case ts.SyntaxKind.Bundle: return visitBundle(<ts.Bundle>node);
            case ts.SyntaxKind.SourceFile: return visitSourceFile(<ts.SourceFile>node);
            case ts.SyntaxKind.VariableStatement: return visitVariableStatement(<ts.VariableStatement>node);
            case ts.SyntaxKind.FunctionDeclaration: return visitFunctionDeclaration(<ts.FunctionDeclaration>node);
            default:
                reportError(node, `${ts.SyntaxKind[node.kind]} not supported at the top level.`);
                return undefined;
        }
    }

    function visitBundle(node: ts.Bundle) {
        node.sourceFiles.forEach(visit);
    }

    function visitSourceFile(node: ts.SourceFile) {
        sourceFile = node;
        node.statements.forEach(visit);
    }

    function isExport(node: ts.Node) {
        return !!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export);
    }

    function visitFunctionDeclaration(node: ts.FunctionDeclaration) {
        if (isExport(node) && rewriteExports) {
            const nameText = ts.idText(node.name);
            const parametersText = sourceFile.text.slice(node.parameters.pos, node.parameters.end);
            const bodyText = node.body.getText();
            if (useGlobals) {
                globalWriter.writeLine(`var ${nameText};`);
                bodyWriter.writeLines(`${nameText} = function (${parametersText}) ${bodyText};`);
            }
            else {
                bodyWriter.writeLines(`function ${nameText}(${parametersText}) ${bodyText}`);
            }
            if (useExporter) exportWriter.writeLine(`exporter(${JSON.stringify(nameText)}, ${nameText});`);
            if (useExports) exportWriter.writeLine(`exports.${nameText} = ${nameText};`);
        }
        else {
            bodyWriter.writeLines(node.getText());
        }
        bodyWriter.writeLine();
    }

    function checkVariableStatement(node: ts.VariableStatement) {
        if (isExport(node)) {
            if (node.declarationList.declarations.length > 1) {
                reportError(node, `Only single variables are supported on exported variable statements.`);
                return false;
            }

            const variable = node.declarationList.declarations[0];
            if (variable.name.kind !== ts.SyntaxKind.Identifier) {
                reportError(variable.name, `Only identifier names are supported on exported variable statements.`);
                return false;
            }

            if (!variable.initializer) {
                reportError(variable.name, `Exported variables must have an initializer.`);
                return false;
            }
        }
        return true;
    }

    function visitVariableStatement(node: ts.VariableStatement) {
        if (!checkVariableStatement(node)) return;
        if (isExport(node) && rewriteExports) {
            const variable = node.declarationList.declarations[0] as ts.VariableDeclaration & { name: ts.Identifier };
            const nameText = ts.idText(variable.name);
            if (useGlobals) {
                globalWriter.writeLine(`var ${nameText};`);
                bodyWriter.writeLines(`${nameText} = ${variable.initializer.getText()};`);
            }
            else {
                bodyWriter.writeLines(`var ${nameText} = ${variable.initializer.getText()};`);
            }
            if (useExporter) exportWriter.writeLine(`exporter(${JSON.stringify(nameText)}, ${nameText});`);
            if (useExports) exportWriter.writeLine(`exports.${nameText} = ${nameText};`);
        }
        else {
            bodyWriter.writeLines(node.getText());
        }        
        bodyWriter.writeLine();
    }

    function visitNames(node: ts.Node) {
        if (!node) return;
        if (ts.isIdentifier(node)) return visitIdentifier(node);
        ts.forEachChild(node, visitNames);
    }

    function visitIdentifier(node: ts.Identifier) {
        const nameText = ts.idText(node);
        const parent = node.parent;
        if (ts.isPropertyAccessExpression(parent) && parent.name === node ||
            ts.isPropertyAssignment(parent) && parent.name === node ||
            unknownGlobals.has(nameText)) return;
        
        const sym = checker.getSymbolAtLocation(node);
        if (!sym) unknownGlobals.add(nameText);
    }
}
