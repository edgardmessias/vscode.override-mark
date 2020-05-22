import * as path from "path";

export interface IDisposable {
  dispose(): void;
}

export function toDisposable(dispose: () => void): IDisposable {
  return { dispose };
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const regexNormalizePath = new RegExp(path.sep === "/" ? "\\\\" : "/", "g");
const regexNormalizeWindows = new RegExp("^\\\\(\\w:)", "g");
export function fixPathSeparator(file: string) {
  file = file.replace(regexNormalizePath, path.sep);
  file = file.replace(regexNormalizeWindows, "$1"); // "\t:\test" => "t:\test"

  if (path.sep === "\\") {
    file = file.charAt(0).toLowerCase() + file.slice(1);
  }

  return file;
}

export function normalizePath(file: string) {
  file = fixPathSeparator(file);

  // IF Windows
  if (path.sep === "\\") {
    file = file.toLowerCase();
  }

  return file;
}

export function isSamePath(pathA: string, pathB: string) {
  return normalizePath(pathA) === normalizePath(pathB);
}
