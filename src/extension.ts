"use strict";
import * as vscode from "vscode";
import * as ts from "typescript";
import { OverrideChecker } from "./overrideChecker";

// this method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
  const disposable: vscode.Disposable[] = [];

  const overrideDecoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: __dirname + "/../resources/overrides.png",
  });
  const implementsDecoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: __dirname + "/../resources/implements.png",
  });

  const compilerOptions: ts.CompilerOptions = {
    allowNonTsExtensions: true,
    allowJs: true,
    lib: ["lib.es6.d.ts"],
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
  };

  const host = ts.createIncrementalCompilerHost(compilerOptions);

  const originalGetSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean) {
    const document = vscode.workspace.textDocuments.find(
      d => d.fileName.replace(/\\/g, "/") === fileName.replace(/\\/g, "/")
    );
    if (document) {
      return ts.createSourceFile(fileName, document?.getText(), languageVersion);
    }
    return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };

  const update = (document: vscode.TextDocument) => {
    const textEditor = vscode.window.visibleTextEditors.find(
      t => t.document.fileName === document.fileName
    );
    if (!textEditor) {
      return;
    }

    const program = ts.createProgram(
      [document.fileName],
      compilerOptions,
      host
    );

    const sourceFile = program?.getSourceFile(document.fileName);

    if (!sourceFile) {
      return;
    }

    const overrideChecker = new OverrideChecker(
      sourceFile,
      program?.getTypeChecker()!
    );

    const ranges = overrideChecker.overridePos.map((pos: number) => {
      const position = textEditor?.document.positionAt(pos)!;

      return new vscode.Range(position, position);
    });

    textEditor?.setDecorations(overrideDecoration, ranges);
    const ranges2 = overrideChecker.implementsPos.map((pos: number) => {
      const position = textEditor?.document.positionAt(pos)!;

      return new vscode.Range(position, position);
    });

    textEditor?.setDecorations(implementsDecoration, ranges2);
  };

  vscode.workspace.onDidChangeTextDocument(e => {
    update(e.document);
  });

  vscode.window.onDidChangeActiveTextEditor(textEditor => {
    if (textEditor) {
      update(textEditor.document);
    }
  });

  vscode.window.visibleTextEditors.forEach(textEditor => {
    update(textEditor.document);
  });

  context.subscriptions.push(...disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
