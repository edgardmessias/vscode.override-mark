import * as vscode from "vscode";
import { getImplementDecoration, getOverrideDecoration } from "./decoration";
import {
  DecorationType,
  DocumentsMarks,
  MarkOptions,
  Provider,
} from "./overrider-mark";
import { IDisposable } from "./util";

export class DocumentMarkProcessor implements IDisposable {
  private _disposables: IDisposable[] = [];

  private _providers: Provider[] = [];

  private _onDidAddProvider = new vscode.EventEmitter<void>();
  public readonly onDidAddProvider: vscode.Event<void> =
    this._onDidAddProvider.event;

  addProvider(provider: Provider) {
    this._providers.push(provider);
    this._onDidAddProvider.fire();
  }

  getDecoration(type: DecorationType) {
    for (const provider of this._providers) {
      if (!provider.getDecoration) {
        continue;
      }
      const decoration = provider.getDecoration(type);
      if (decoration) {
        return decoration;
      }
    }

    switch (type) {
      case DecorationType.override:
        return getOverrideDecoration();
      case DecorationType.implement:
        return getImplementDecoration();
      default:
        return undefined;
    }
  }

  private groupByDecorationType(marks: MarkOptions[]) {
    const decorationMap = new Map<DecorationType, MarkOptions[]>();
    for (const mark of marks) {
      let list = decorationMap.get(mark.type);
      if (!list) {
        list = [];
      }
      list.push(mark);
      decorationMap.set(mark.type, list);
    }
    return decorationMap;
  }

  async getDocumentsMarks(documents: vscode.TextDocument[]) {
    const documentsMarks: DocumentsMarks = new Map();

    const promises = this._providers.map(provider =>
      provider.getDocumentsMarks(documents)
    );

    const results = await Promise.all(promises);

    for (const result of results) {
      for (const [fileName, marksOptions] of result) {
        let marks = documentsMarks.get(fileName);
        if (!marks) {
          marks = [];
        }
        marks.push(...marksOptions);
        documentsMarks.set(fileName, marks);
      }
    }
    return documentsMarks;
  }

  async updateDecorations(documents: vscode.TextDocument[]) {
    const documentsMarks = await this.getDocumentsMarks(documents);

    for (const textEditor of vscode.window.visibleTextEditors) {
      const marks = documentsMarks.get(textEditor.document.fileName);
      if (!marks) {
        continue;
      }

      const grouped = this.groupByDecorationType(marks);

      for (const [type, options] of grouped) {
        const decoration = this.getDecoration(type);
        if (!decoration) {
          return;
        }
        textEditor.setDecorations(decoration, options);
      }
    }
  }

  dispose(): void {
    this._disposables.forEach(d => d.dispose());
  }
}
