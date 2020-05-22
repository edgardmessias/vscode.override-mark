import * as vscode from "vscode";
import { IDisposable, toDisposable } from "./util";

export class WorkspaceWatcher implements IDisposable {
  private _disposables: IDisposable[] = [];
  private _updateDocumentTimer?: NodeJS.Timer;
  private _documentsToUpdate: Map<string, vscode.TextDocument> = new Map();

  private _onDidChangeTextDocuments = new vscode.EventEmitter<
    vscode.TextDocument[]
  >();
  public readonly onDidChangeTextDocuments: vscode.Event<
    vscode.TextDocument[]
  > = this._onDidChangeTextDocuments.event;

  public delay: number = 500;

  constructor() {
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument(e => {
        this.queueTextDocument(e.document);
      })
    );

    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor(textEditor => {
        if (textEditor) {
          this.queueTextDocument(textEditor.document);
        }
      })
    );
    this._disposables.push(
      toDisposable(() => {
        clearTimeout(this._updateDocumentTimer!);
      })
    );

    for (const textEditor of vscode.window.visibleTextEditors) {
      this.queueTextDocument(textEditor.document);
    }
  }

  public queueTextDocument(document: vscode.TextDocument) {
    clearTimeout(this._updateDocumentTimer!);
    this._documentsToUpdate.set(document.fileName, document);

    this._updateDocumentTimer = setTimeout(() => {
      const toUpdate = Array.from(this._documentsToUpdate.values());
      this._documentsToUpdate.clear();
      this.changeTextDocuments(toUpdate);
    }, this.delay);
  }

  private changeTextDocuments(documents: vscode.TextDocument[]) {
    this._onDidChangeTextDocuments.fire(documents);
  }

  dispose(): void {
    this._onDidChangeTextDocuments.dispose();
    this._disposables.forEach(d => d.dispose());
  }
}
