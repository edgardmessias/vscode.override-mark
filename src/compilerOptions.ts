import * as os from "os";
import * as path from "path";
import { CompilerOptions } from "typescript";
import { normalizePath } from "./util";
import { tsModule } from "./vscodeModules";

const compilerOptions: CompilerOptions = {
  allowNonTsExtensions: true,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  lib: ["lib.es6.d.ts"],
  target: tsModule.ScriptTarget.Latest,
  moduleResolution: tsModule.ModuleResolutionKind.NodeJs,
  experimentalDecorators: true,
  typeRoots: [],
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

export function getCompilerOptions() {
  return compilerOptions;
}
