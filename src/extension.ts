import * as vscode from "vscode";
import { IDisposable } from "./util";
import { WorkspaceWatcher } from "./workspaceWatcher";
import { DocumentMarkProcessor } from "./documentMarkProcessor";
import { TypescriptProvider } from "./typescriptProvider";
import { OverrideMarkApi } from "./overrider-mark";
import { loadDecorationConfig } from "./decoration";

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext): OverrideMarkApi {
  const disposable: IDisposable[] = [];

  const workspaceWatcher = new WorkspaceWatcher();
  disposable.push(workspaceWatcher);

  const documentMarkProcessor = new DocumentMarkProcessor();
  disposable.push(documentMarkProcessor);

  const typescriptProvider = new TypescriptProvider();
  disposable.push(typescriptProvider);

  documentMarkProcessor.addProvider(typescriptProvider);

  disposable.push(
    workspaceWatcher.onDidChangeTextDocuments(documents => {
      documentMarkProcessor.updateDecorations(documents);
    })
  );

  const getDelay = () =>
    vscode.workspace
      .getConfiguration("override-mark")
      .get<number>("delay", 500);

  workspaceWatcher.delay = getDelay();

  loadDecorationConfig();

  disposable.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("override-mark")) {
        workspaceWatcher.delay = getDelay();
        loadDecorationConfig();
        workspaceWatcher.queueVisibleDocuments();
      }
    })
  );

  // start watch documents changes
  workspaceWatcher.start();
  workspaceWatcher.queueVisibleDocuments();

  // Update after new provider
  documentMarkProcessor.onDidAddProvider(() => {
    workspaceWatcher.queueVisibleDocuments();
  });
  // Update opened documents
  context.subscriptions.push(...disposable);

  return {
    addProvider: provider => documentMarkProcessor.addProvider(provider),
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // Nothing
}
