import * as vscode from "vscode";
import { Walker } from "./walker";
import { CompilerHost } from "./compilerHost";
import * as decoration from "./decoration";
import { getCompilerOptions } from "./compilerOptions";

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  const disposable: vscode.Disposable[] = [];

  const compilerOptions = getCompilerOptions();

  const host = new CompilerHost(compilerOptions);

  const updateMarks = (document: vscode.TextDocument) => {
    const textEditor = vscode.window.visibleTextEditors.find(
      t => t.document.fileName === document.fileName
    );
    if (!textEditor) {
      return;
    }

    const program = host.createProgram(document);

    const walker = new Walker(program);

    const result = walker.walk(document);

    textEditor.setDecorations(
      decoration.getOverrideDecoration(),
      result.overrideRanges
    );
    textEditor.setDecorations(
      decoration.getImplementDecoration(),
      result.implementRanges
    );
  };

  disposable.push(
    vscode.workspace.onDidChangeTextDocument(e => {
      updateMarks(e.document);
    })
  );

  disposable.push(
    vscode.window.onDidChangeActiveTextEditor(textEditor => {
      if (textEditor) {
        updateMarks(textEditor.document);
      }
    })
  );

  vscode.window.visibleTextEditors.forEach(textEditor => {
    updateMarks(textEditor.document);
  });

  context.subscriptions.push(...disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  // Nothing
}
