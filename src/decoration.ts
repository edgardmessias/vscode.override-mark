import * as vscode from "vscode";

export interface StyleSetting {
  foreground?: string;
  background?: string;
  fontStyle?: string;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  border?: string;
  borderRadius?: string;
}

function fromSettings(
  foreground: string | undefined,
  background: string | undefined,
  fontStyle: string | undefined,
  bold?: boolean,
  underline?: boolean,
  italic?: boolean,
  border?: string,
  borderRadius?: string
): vscode.ThemableDecorationRenderOptions {
  const options: vscode.ThemableDecorationRenderOptions = {};
  if (foreground) {
    options.color = foreground;
  }
  if (background) {
    options.backgroundColor = background;
  }
  if (fontStyle !== undefined) {
    bold = italic = underline = false;
    const expression = /italic|bold|underline/g;
    let match;
    while ((match = expression.exec(fontStyle))) {
      switch (match[0]) {
        case "bold":
          bold = true;
          break;
        case "italic":
          italic = true;
          break;
        case "underline":
          underline = true;
          break;
      }
    }
  }
  if (bold) {
    options.fontWeight = "bold";
  }
  if (italic) {
    options.fontStyle = "italic";
  }
  if (underline) {
    options.textDecoration = "underline";
  }
  if (border) {
    options.border = border;
  }
  if (borderRadius) {
    options.borderRadius = borderRadius;
  }
  return options;
}

function fromSetting(setting?: StyleSetting | string) {
  return !setting || typeof setting === "string"
    ? fromSettings(undefined, undefined, setting)
    : fromSettings(
        setting.foreground,
        setting.background,
        setting.fontStyle,
        setting.bold,
        setting.underline,
        setting.italic,
        setting.border,
        setting.borderRadius
      );
}

let overrideDecoration = vscode.window.createTextEditorDecorationType({
  gutterIconPath: __dirname + "/../resources/override.svg",
  fontWeight: "bold",
});
let implementDecoration = vscode.window.createTextEditorDecorationType({
  gutterIconPath: __dirname + "/../resources/implement.svg",
  fontWeight: "bold",
});

export function loadDecorationConfig() {
  const config = vscode.workspace.getConfiguration("override-mark");
  overrideDecoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: __dirname + "/../resources/override.svg",
    ...fromSetting(config.get<StyleSetting | string>("style.override")),
  });
  implementDecoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: __dirname + "/../resources/implement.svg",
    ...fromSetting(config.get<StyleSetting | string>("style.implement")),
  });
}

export function getOverrideDecoration() {
  return overrideDecoration;
}

export function getImplementDecoration() {
  return implementDecoration;
}
