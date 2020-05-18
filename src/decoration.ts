import * as vscode from "vscode";

/**
 * @todo Create config option
 * @todo Create config watcher
 * @todo Create a event when decoration did change
 */

const overrideDecoration = vscode.window.createTextEditorDecorationType({
  gutterIconPath: __dirname + "/../resources/override.svg",
  fontWeight: "bold",
});
const implementDecoration = vscode.window.createTextEditorDecorationType({
  gutterIconPath: __dirname + "/../resources/implement.svg",
  fontWeight: "bold",
});

export function getOverrideDecoration() {
  return overrideDecoration;
}

export function getImplementDecoration() {
  return implementDecoration;
}
