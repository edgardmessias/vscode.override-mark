import { CompilerOptions } from "typescript";
import * as vscode from "vscode";
import { DocumentsMarks, Provider } from "./overrider-mark";
import { CompilerHost } from "./compilerHost";
import { getCompilerOptions } from "./compilerOptions";
import { IDisposable } from "./util";
import { Walker } from "./walker";

export class TypescriptProvider implements IDisposable, Provider {
  private _disposables: IDisposable[] = [];
  private _compilerOptions: CompilerOptions;
  private _host: CompilerHost;

  constructor() {
    this._compilerOptions = getCompilerOptions();

    this._host = new CompilerHost(this._compilerOptions);
  }

  getDocumentsMarks(documents: vscode.TextDocument[]): DocumentsMarks {
    const program = this._host.createProgram(documents);

    const walker = new Walker(program);

    const marks: DocumentsMarks = new Map();

    for (const document of documents) {
      const result = walker.walk(document);
      marks.set(document.fileName, result);
    }
    return marks;
  }

  dispose(): void {
    this._disposables.forEach(d => d.dispose());
  }
}
