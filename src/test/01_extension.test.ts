import * as assert from "assert";
import * as vscode from "vscode";
import { activateExtension, EXTENSION_ID } from "./common";
import { getCompilerOptions } from "../compilerOptions";
import { CompilerHost } from "../compilerHost";
import { CompilerOptions, Program } from "typescript";
import { Walker } from "../walker";
import { DecorationType } from "../overrider-mark";

suiteSetup(async function () {
  if (!(await activateExtension())) {
    this.skip();
  }
});

suite("Extension Tests", function () {
  let ext;
  let compilerOptions: CompilerOptions;
  let host: CompilerHost;
  let document: vscode.TextDocument;
  let textEditor: vscode.TextEditor;
  let program: Program;
  let walker: Walker;

  test("Active Extension", function () {
    ext = vscode.extensions.getExtension(EXTENSION_ID) as vscode.Extension<any>;
    assert.ok(ext, "Extension not found");
    assert.equal(ext.isActive, true, "Extension not activated");
  });

  test("Get compiler options", function () {
    compilerOptions = getCompilerOptions();
    assert.ok(compilerOptions);
  });

  test("Create compiler host", function () {
    if (!compilerOptions) {
      return this.skip();
    }
    host = new CompilerHost(compilerOptions);
    assert.ok(host);
  });

  test("Create text document", async function () {
    if (!host) {
      return this.skip();
    }
    document = await vscode.workspace.openTextDocument(
      __dirname + "/../../src/app/same_file.ts"
    );
    assert.ok(document);
  });

  test("Open text document", async function () {
    if (!document) {
      return this.skip();
    }
    textEditor = await vscode.window.showTextDocument(document);
    assert.ok(textEditor);
  });

  test("Create program", async function () {
    if (!textEditor) {
      return this.skip();
    }
    program = host.createProgram(document);
    assert.ok(program);
  });

  test("Create Walker", async function () {
    if (!program) {
      return this.skip();
    }
    walker = new Walker(program);
    assert.ok(walker);
  });

  test("Check marks", async function () {
    if (!walker) {
      return this.skip();
    }

    const result = walker.walk(document);

    const override = result.filter(r => r.type === DecorationType.override);
    assert.equal(override.length, 5);

    const implement = result.filter(r => r.type === DecorationType.implement);
    assert.equal(implement.length, 4);
  });
});
