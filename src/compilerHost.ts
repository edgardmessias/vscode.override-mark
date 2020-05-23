/* eslint-disable prettier/prettier */
import * as vscode from "vscode";
import {
  CompilerHost as BaseCompilerHost,
  CompilerOptions,
  SourceFile,
} from "typescript";
import { tsModule } from "./vscodeModules";
import { isSamePath } from "./util";

export class CompilerHost implements BaseCompilerHost {
  private _host: BaseCompilerHost;

  constructor(readonly compilerOptions: CompilerOptions) {
    if (tsModule.createIncrementalCompilerHost) {
      // typescript >= 3.4
      this._host = tsModule.createIncrementalCompilerHost(compilerOptions);
    } else {
      this._host = tsModule.createCompilerHost(compilerOptions);
    }

    for (const prop of Object.keys(this._host)) {
      if (!(prop in this)) {
        (this as any)[prop] = (this._host as any)[prop];
      }
    }
  }

  getSourceFile(
    fileName: string,
    languageVersion: number,
    onError?: ((message: string) => void) | undefined,
    shouldCreateNewSourceFile?: boolean | undefined
  ): SourceFile | undefined {
    const document = vscode.workspace.textDocuments.find(d =>
      isSamePath(d.fileName, fileName)
    );

    if (document) {
      return tsModule.createSourceFile(
        fileName,
        document.getText(),
        languageVersion
      );
    }

    return this._host.getSourceFile(
      fileName,
      languageVersion,
      onError,
      shouldCreateNewSourceFile
    );
  }

  getDefaultLibFileName(options: CompilerOptions): string {
    return this._host.getDefaultLibFileName(options);
  }

  public get writeFile() {
    return this._host.writeFile;
  }

  getCurrentDirectory(): string {
    return this._host.getCurrentDirectory();
  }

  getCanonicalFileName(fileName: string): string {
    return this._host.getCanonicalFileName(fileName);
  }

  useCaseSensitiveFileNames(): boolean {
    return this._host.useCaseSensitiveFileNames();
  }
  getNewLine(): string {
    return this._host.getNewLine();
  }

  fileExists(fileName: string): boolean {
    return this._host.fileExists(fileName);
  }

  readFile(fileName: string): string | undefined {
    return this._host.readFile(fileName);
  }

  directoryExists(directoryName: string) {
    if (this._host.directoryExists) {
      return this._host.directoryExists(directoryName);
    }
    return tsModule.sys.directoryExists(directoryName);
  }

  getDirectories(path: string) {
    if (this._host.getDirectories) {
      return this._host.getDirectories(path);
    }
    return tsModule.sys.getDirectories(path);
  }

  readDirectory(
    rootDir: string,
    extensions: readonly string[],
    excludes: readonly string[] | undefined,
    includes: readonly string[],
    depth?: number
  ) {
    if (this._host.readDirectory) {
      return this._host.readDirectory(
        rootDir,
        extensions,
        excludes,
        includes,
        depth
      );
    }
    return tsModule.sys.readDirectory(
      rootDir,
      extensions,
      excludes,
      includes,
      depth
    );
  }

  createProgram(documents: vscode.TextDocument | vscode.TextDocument[]) {
    if (!Array.isArray(documents)) {
      documents = [documents];
    }

    const rootNames = documents.map(d => d.fileName);

    return tsModule.createProgram(rootNames, this.compilerOptions, this);
  }
}
