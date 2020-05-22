import * as vscode from "vscode";
import { Walker } from "./walker";
import { CompilerHost } from "./compilerHost";
import * as decoration from "./decoration";
import { getCompilerOptions } from "./compilerOptions";
import { IDisposable, isSamePath } from "./util";
import { WorkspaceWatcher } from "./workspaceWatcher";

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  const disposable: IDisposable[] = [];

  const compilerOptions = getCompilerOptions();

  const host = new CompilerHost(compilerOptions);

  const workspaceWatcher = new WorkspaceWatcher();

  const updateMarks = (documents: vscode.TextDocument[]) => {
    const program = host.createProgram(documents);

    const walker = new Walker(program);

    for (const document of documents) {
      const textEditor = vscode.window.visibleTextEditors.find(t =>
        isSamePath(t.document.fileName, document.fileName)
      );

      if (!textEditor) {
        continue;
      }

      const result = walker.walk(document);

      textEditor.setDecorations(
        decoration.getOverrideDecoration(),
        result.overrideRanges
      );
      textEditor.setDecorations(
        decoration.getImplementDecoration(),
        result.implementRanges
      );
    }
  };

  disposable.push(workspaceWatcher.onDidChangeTextDocuments(updateMarks));

  const getDelay = () =>
    vscode.workspace
      .getConfiguration("override-mark")
      .get<number>("delay", 500);

  workspaceWatcher.delay = getDelay();

  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration("override-mark")) {
      workspaceWatcher.delay = getDelay();
    }
  });

  workspaceWatcher.start();

  context.subscriptions.push(...disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  // Nothing
}
