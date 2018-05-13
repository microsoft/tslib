import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as ts from "typescript";

const rootDir = path.resolve(__dirname, `..`);
const srcDir = path.resolve(rootDir, `src`);
const copyrightNotice = fs.readFileSync(path.resolve(rootDir, "CopyrightNotice.txt"), "utf8");
const umdGlobalsExporter = fs.readFileSync(path.resolve(srcDir, "umdGlobals.js"), "utf8");
const umdDepsExporter = fs.readFileSync(path.resolve(srcDir, "umdDeps.js"), "utf8");
const umdExporter = fs.readFileSync(path.resolve(srcDir, "umd.js"), "utf8");
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
    generateMultipleFileVariations(sourceFiles, rootDir + `/lib`);
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

function getSourceFileNames() {
    const configFile = path.resolve(srcDir, "jsconfig.json");
    const result = ts.parseConfigFileTextToJson(configFile, fs.readFileSync(configFile, "utf8"));
    if (result.error) {
        console.error(ts.formatDiagnosticsWithColorAndContext([result.error], {
            getCanonicalFileName: name => name,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => os.EOL
        }));
        process.exit();
    }

    return result.config.files as string[];
}

function parseSources() {
    const files = getSourceFileNames();
    const sourceFiles: ts.SourceFile[] = [];
    for (const file of files) {
        sourceFiles.push(parse(path.resolve(srcDir, file)));
    }
    return sourceFiles;
}

function generateSingleFileVariations(sourceFiles: ts.SourceFile[], outDir: string) {
    generateSingleFile(sourceFiles, outDir + `/tslib.js`, LibKind.UmdGlobal);
    generateSingleFile(sourceFiles, outDir + `/tslib.umd.js`, LibKind.Umd);
    generateSingleFile(sourceFiles, outDir + `/tslib.es6.js`, LibKind.ES2015);
}

function generateSingleFile(sourceFiles: ts.SourceFile[], outFile: string, libKind: LibKind) {
    const bundle = ts.createBundle(sourceFiles);
    const output = write(bundle, libKind);
    mkdirpSync(path.dirname(outFile));
    fs.writeFileSync(outFile, output, "utf8");
}

function generateMultipleFileVariations(sourceFiles: ts.SourceFile[], outDir: string) {
    generateMultipleFileVariation(sourceFiles, outDir, LibKind.Umd);
}

function generateMultipleFileVariation(sourceFiles: ts.SourceFile[], outDir: string, libKind: LibKind.Umd) {
    for (const sourceFile of sourceFiles) {
        const output = write(sourceFile, libKind);
        const outFile = path.resolve(outDir, path.basename(sourceFile.fileName));
        mkdirpSync(path.dirname(outFile));
        fs.writeFileSync(outFile, output, "utf8");
    }
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

function write(source: ts.Bundle | ts.SourceFile, libKind: LibKind) {
    const globalWriter = new TextWriter();
    const bodyWriter = new TextWriter();
    const exportWriter = new TextWriter();
    let dependencies: string[] | undefined;
    let sourceFile: ts.SourceFile | undefined;
    let isSingleFileEmit: boolean;
    let tempCounter = 0;

    switch (source.kind) {
        case ts.SyntaxKind.Bundle: return writeBundle(source);
        case ts.SyntaxKind.SourceFile: return writeSourceFile(source);
    }

    function writeBundle(node: ts.Bundle) {
        isSingleFileEmit = true;
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

    function writeSourceFile(node: ts.SourceFile) {
        isSingleFileEmit = false;
        switch (libKind) {
            case LibKind.Umd: return writeUmdSourceFile(node);
        }
    }

    function writeUmdSourceFile(node: ts.SourceFile) {
        visit(node);
        const writer = new TextWriter();
        writer.writeLines(copyrightNotice);
        writer.writeLines(dependencies ? umdDepsExporter : umdExporter);
        writer.writeLine(`(${dependencies ? `${JSON.stringify(dependencies)}, ` : ``}function (exporter${dependencies ? `, require` : ``}) {`);
        writer.indent++;
        writer.writeLines(bodyWriter.toString());
        writer.writeLines(exportWriter.toString());
        writer.indent--;
        writer.writeLine(`});`);
        return writer.toString();
    }

    function visit(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.Bundle: return visitBundle(<ts.Bundle>node);
            case ts.SyntaxKind.SourceFile: return visitSourceFile(<ts.SourceFile>node);
            case ts.SyntaxKind.VariableStatement: return visitVariableStatement(<ts.VariableStatement>node);
            case ts.SyntaxKind.ImportDeclaration: return visitImportDeclaration(<ts.ImportDeclaration>node);
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

    function visitImportDeclaration(node: ts.ImportDeclaration) {
        if (isSingleFileEmit || libKind !== LibKind.Umd) return undefined;
        if (!node.importClause || !ts.isStringLiteral(node.moduleSpecifier)) return undefined;
        const moduleSpecifier = node.moduleSpecifier.text;
        if (!dependencies) dependencies = [];
        dependencies.push(moduleSpecifier);
        const moduleReference = `require(${JSON.stringify(moduleSpecifier)})`;
        if (!node.importClause.namedBindings) {
            bodyWriter.writeLine(`var ${ts.idText(node.importClause.name)} = ${moduleReference}["default"];`);
        }
        else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            bodyWriter.writeLine(`var ${ts.idText(node.importClause.namedBindings.name)} = ${moduleReference};`);
        }
        else if (node.importClause.namedBindings.elements.length === 1) {
            const namedImport = node.importClause.namedBindings.elements[0];
            bodyWriter.writeLine(`var ${ts.idText(namedImport.name)} = ${moduleReference}.${ts.idText(namedImport.propertyName || namedImport.name)};`)
        }
        else if (node.importClause.namedBindings.elements.length > 1) {
            const moduleName = `module_${tempCounter++}`;
            bodyWriter.write(`var ${moduleName} = ${moduleReference}`);
            bodyWriter.indent++;
            for (const element of node.importClause.namedBindings.elements) {
                bodyWriter.writeLine(`,`);
                bodyWriter.write(`${ts.idText(element.name)} = ${moduleName}.${ts.idText(element.propertyName || element.name)}`);
            }
            bodyWriter.indent--;
            bodyWriter.writeLine(`;`);
        }
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
                if (libKind === LibKind.UmdGlobal && isSingleFileEmit) {
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
