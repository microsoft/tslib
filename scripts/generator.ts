import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as ts from "typescript";

const rootDir = path.resolve(__dirname, `..`);
const srcDir = path.resolve(rootDir, `src`);
const copyrightNotice = fs.readFileSync(path.resolve(rootDir, "CopyrightNotice.txt"), "utf8");
const umdGlobalsExporter = fs.readFileSync(path.resolve(srcDir, "umdGlobals.js"), "utf8");
const umdExporter = fs.readFileSync(path.resolve(srcDir, "umd.js"), "utf8");
const tslibFile = path.resolve(srcDir, "tslib.js");
const indentStrings: string[] = ["", "    "];
const MAX_SMI_X86 = 0x3fff_ffff;

const enum LibKind {
    Umd,
    UmdGlobal,
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
            for (const lineText of lines) {
                const line = indentation ? lineText.slice(indentation) : lineText;
                if (!this.pendingNewLines && this.output.length > 0) {
                    this.writeLine();
                }
                this.writeLine(line);
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
    const sourceFiles = parseSources();
    generateSingleFileVariations(sourceFiles, rootDir);
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

function parse(file: string) {
    const sourceText = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.ES3, /*setParentNodes*/ true, ts.ScriptKind.JS);
    return sourceFile;
}

function parseSources() {
    const sourceFiles: ts.SourceFile[] = [];
    sourceFiles.push(parse(tslibFile));
    return sourceFiles;
}

function generateSingleFileVariations(sourceFiles: ts.SourceFile[], outDir: string) {
    generateSingleFile(sourceFiles, path.resolve(outDir, "tslib.js"), LibKind.UmdGlobal);
    generateSingleFile(sourceFiles, path.resolve(outDir, "tslib.umd.js"), LibKind.Umd);
    generateSingleFile(sourceFiles, path.resolve(outDir, "tslib.es6.js"), LibKind.ES2015);
}

function generateSingleFile(sourceFiles: ts.SourceFile[], outFile: string, libKind: LibKind) {
    const bundle = ts.createBundle(sourceFiles);
    const output = write(bundle, libKind);
    mkdirpSync(path.dirname(outFile));
    fs.writeFileSync(outFile, output, "utf8");
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

function write(source: ts.Bundle, libKind: LibKind) {
    const globalWriter = new TextWriter();
    const bodyWriter = new TextWriter();
    const exportWriter = new TextWriter();
    let sourceFile: ts.SourceFile | undefined;

    return writeBundle(source);

    function writeBundle(node: ts.Bundle) {
        switch (libKind) {
            case LibKind.Umd:
            case LibKind.UmdGlobal:
                return writeUmdBundle(node);
            case LibKind.ES2015:
                return writeES2015Bundle(node);
        }
    }

    function writeUmdBundle(node: ts.Bundle) {
        visit(node);
        const writer = new TextWriter();
        writer.writeLines(copyrightNotice);
        writer.writeLines(globalWriter.toString());
        writer.writeLines(libKind === LibKind.UmdGlobal ? umdGlobalsExporter : umdExporter);
        writer.writeLine(`(function (exporter) {`);
        writer.indent++;
        writer.writeLines(bodyWriter.toString());
        writer.writeLine();
        writer.writeLines(exportWriter.toString());
        writer.indent--;
        writer.writeLine(`});`);
        return writer.toString();
    }

    function writeES2015Bundle(node: ts.Bundle) {
        visit(node);
        const writer = new TextWriter();
        writer.writeLines(copyrightNotice);
        writer.writeLines(bodyWriter.toString());
        return writer.toString();
    }

    function visit(node: ts.Node) {
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

    function visitFunctionDeclaration(node: ts.FunctionDeclaration) {
        if (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) {
            if (libKind === LibKind.Umd || libKind === LibKind.UmdGlobal) {
                exportWriter.writeLine(`exporter("${ts.idText(node.name)}", ${ts.idText(node.name)});`);
                const parametersText = sourceFile.text.slice(node.parameters.pos, node.parameters.end);
                const bodyText = node.body.getText();
                if (libKind === LibKind.UmdGlobal) {
                    globalWriter.writeLine(`var ${ts.idText(node.name)};`);
                    bodyWriter.writeLines(`${ts.idText(node.name)} = function (${parametersText}) ${bodyText};`);
                }
                else {
                    bodyWriter.writeLines(`function ${ts.idText(node.name)}(${parametersText}) ${bodyText}`);
                }
                bodyWriter.writeLine();
                return;
            }
        }
        bodyWriter.writeLines(node.getText());
        bodyWriter.writeLine();
    }

    function visitVariableStatement(node: ts.VariableStatement) {
        if (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) {
            if (node.declarationList.declarations.length > 1) {
                reportError(node, `Only single variables are supported on exported variable statements.`);
                return;
            }

            const variable = node.declarationList.declarations[0];
            if (variable.name.kind !== ts.SyntaxKind.Identifier) {
                reportError(variable.name, `Only identifier names are supported on exported variable statements.`);
                return;
            }

            if (!variable.initializer) {
                reportError(variable.name, `Exported variables must have an initializer.`);
                return;
            }

            if (libKind === LibKind.Umd || libKind === LibKind.UmdGlobal) {
                if (libKind === LibKind.UmdGlobal) {
                    globalWriter.writeLine(`var ${ts.idText(variable.name)};`);
                    bodyWriter.writeLines(`${ts.idText(variable.name)} = ${variable.initializer.getText()};`);
                }
                else if (ts.isFunctionExpression(variable.initializer)) {
                    const parametersText = sourceFile.text.slice(variable.initializer.parameters.pos, variable.initializer.parameters.end);
                    const bodyText = variable.initializer.body.getText();
                    bodyWriter.writeLines(`function ${ts.idText(variable.name)}(${parametersText}) ${bodyText}`);
                    bodyWriter.writeLine();
                }
                else {
                    bodyWriter.writeLines(`var ${ts.idText(variable.name)} = ${variable.initializer.getText()};`);
                }
                bodyWriter.writeLine();
                exportWriter.writeLine(`exporter("${ts.idText(variable.name)}", ${ts.idText(variable.name)});`);
                return;
            }

            if (ts.isFunctionExpression(variable.initializer)) {
                const parametersText = sourceFile.text.slice(variable.initializer.parameters.pos, variable.initializer.parameters.end);
                const bodyText = variable.initializer.body.getText();
                bodyWriter.writeLines(`export function ${ts.idText(variable.name)}(${parametersText}) ${bodyText}`);
                bodyWriter.writeLine();
                return;
            }
        }

        bodyWriter.writeLines(node.getText());
        bodyWriter.writeLine();
    }
}
