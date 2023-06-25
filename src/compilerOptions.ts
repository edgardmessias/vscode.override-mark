import * as os from "os";
import * as path from "path";
import { CompilerOptions } from "typescript";
import { normalizePath } from "./util";
import { tsModule } from "./vscodeModules";
import * as vscode from "vscode";

const compilerOptions: CompilerOptions = {
  forceConsistentCasingInFileNames: true,
  outDir: "./dist/out-tsc",
  sourceMap: true,
  declaration: false,
  moduleResolution: tsModule.ModuleResolutionKind.NodeJs,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  esModuleInterop: true,
  target: tsModule.ScriptTarget.ES2015,
  module: tsModule.ModuleKind.ES2020,
  importHelpers: true,
  allowNonTsExtensions: true,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  jsx: tsModule.JsxEmit.React,
  lib: ["lib.es6.d.ts"],
  typeRoots: [],
  baseUrl: "./src",
  paths: {
    "@app/*": ["./app/*"],
  },
};

function getNonWindowsCacheLocation(platformIsDarwin: boolean) {
  if (process.env.XDG_CACHE_HOME) {
    return process.env.XDG_CACHE_HOME;
  }
  const usersDir = platformIsDarwin ? "Users" : "home";
  const homePath =
    (os.homedir && os.homedir()) ||
    process.env.HOME ||
    ((process.env.LOGNAME || process.env.USER) &&
      `/${usersDir}/${process.env.LOGNAME || process.env.USER}`) ||
    os.tmpdir();
  const cacheFolder = platformIsDarwin ? "Library/Caches" : ".cache";
  return path.join(normalizePath(homePath), cacheFolder);
}

function getGlobalTypingsCacheLocation() {
  switch (process.platform as string) {
    case "win32": {
      const basePath =
        process.env.LOCALAPPDATA ||
        process.env.APPDATA ||
        (os.homedir && os.homedir()) ||
        process.env.USERPROFILE ||
        (process.env.HOMEDRIVE &&
          process.env.HOMEPATH &&
          normalizePath(process.env.HOMEDRIVE + process.env.HOMEPATH)) ||
        os.tmpdir();
      return path.join(
        normalizePath(basePath),
        "Microsoft",
        "TypeScript",
        tsModule.versionMajorMinor
      );
    }
    case "openbsd":
    case "freebsd":
    case "netbsd":
    case "darwin":
    case "linux":
    case "android": {
      const cacheLocation = getNonWindowsCacheLocation(
        process.platform === "darwin"
      );
      return path.join(cacheLocation, "typescript", tsModule.versionMajorMinor);
    }
    default:
      return null;
  }
}

const globalTypeRoots = getGlobalTypingsCacheLocation();
if (globalTypeRoots) {
  compilerOptions.typeRoots!.push(
    path.join(globalTypeRoots, "node_modules", "@types")
  );
}

const configurationCompilerOptions = vscode.workspace
  .getConfiguration("override-mark")
  .get("compilerOptions", {});
if (Object.keys(configurationCompilerOptions).length) {
  Object.assign(compilerOptions, configurationCompilerOptions);
}

export function getCompilerOptions() {
  return compilerOptions;
}
