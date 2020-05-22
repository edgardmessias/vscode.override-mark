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

  private _started: boolean = false;

  private _delay: number = 500;

  public get delay() {
    return this._delay;
  }

  public set delay(delay: number) {
    this._delay = delay;
    this.resetTimer();
  }

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

  private fireChangeTextDocuments() {
    if (this._documentsToUpdate.size === 0) {
      return;
    }
    const toUpdate = Array.from(this._documentsToUpdate.values());
    this._documentsToUpdate.clear();
    this._onDidChangeTextDocuments.fire(toUpdate);
  }

  private resetTimer() {
    clearTimeout(this._updateDocumentTimer!);

    if (!this._started) {
      return;
    }

    this._updateDocumentTimer = setTimeout(() => {
      this.fireChangeTextDocuments();
    }, this._delay);
  }

  public queueTextDocument(document: vscode.TextDocument) {
    if (!this._started) {
      return;
    }

    this._documentsToUpdate.set(document.fileName, document);
    this.resetTimer();
  }

  start() {
    this._started = true;
    this.resetTimer();
  }

  stop() {
    this._started = false;
    this.resetTimer();
  }

  dispose(): void {
    this._onDidChangeTextDocuments.dispose();
    this._disposables.forEach(d => d.dispose());
  }
}
