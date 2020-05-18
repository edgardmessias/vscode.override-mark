import * as vscode from "vscode";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json");

export const EXTENSION_ID = `${pkg.publisher}.${pkg.name}`;

export function getExtension() {
  return vscode.extensions.getExtension(EXTENSION_ID);
}

export async function activateExtension() {
  const ext = getExtension();

  if (!ext) {
    return false;
  }

  if (!ext.isActive) {
    await ext.activate();
  }

  return ext.isActive;
}
