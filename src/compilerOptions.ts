import { CompilerOptions } from "typescript";
import { tsModule } from "./vscodeModules";

const compilerOptions: CompilerOptions = {
  allowNonTsExtensions: true,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  lib: ["lib.es6.d.ts"],
  target: tsModule.ScriptTarget.Latest,
  moduleResolution: tsModule.ModuleResolutionKind.NodeJs,
  experimentalDecorators: true,
};

export function getCompilerOptions() {
  return compilerOptions;
}
