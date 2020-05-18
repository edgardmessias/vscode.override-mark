# Clipboard Manager

[![Version](https://vsmarketplacebadge.apphb.com/version-short/EdgardMessias.override-decorator.svg)](https://marketplace.visualstudio.com/items?itemName=EdgardMessias.override-decorator)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/EdgardMessias.override-decorator.svg)](https://marketplace.visualstudio.com/items?itemName=EdgardMessias.override-decorator)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating-short/EdgardMessias.override-decorator.svg)](https://marketplace.visualstudio.com/items?itemName=EdgardMessias.override-decorator)

[![Build Status](https://img.shields.io/github/workflow/status/edgardmessias/vscode.override-decorator/test.svg)](https://github.com/edgardmessias/vscode.override-decorator/actions)
[![Lint Status](https://img.shields.io/github/workflow/status/edgardmessias/vscode.override-decorator/lint.svg?label=lint)](https://github.com/edgardmessias/vscode.override-decorator/actions)
[![release-it](https://img.shields.io/badge/%F0%9F%93%A6%F0%9F%9A%80-release--it-e10079.svg)](https://github.com/release-it/release-it)

[![Dependencies Status](https://david-dm.org/edgardmessias/vscode.override-decorator/status.svg)](https://david-dm.org/edgardmessias/vscode.override-decorator)
[![DevDependencies Status](https://david-dm.org/edgardmessias/vscode.override-decorator/dev-status.svg)](https://david-dm.org/edgardmessias/vscode.override-decorator?type=dev)
[![Dependabot badge](https://badgen.net/dependabot/edgardmessias/vscode.override-decorator/?icon=dependabot)](https://dependabot.com/)

[![Coverage Status](https://codecov.io/gh/edgardmessias/vscode.override-decorator/branch/master/graph/badge.svg)](https://codecov.io/gh/edgardmessias/vscode.override-decorator)
[![Known Vulnerabilities](https://snyk.io/test/github/edgardmessias/vscode.override-decorator/badge.svg)](https://snyk.io/test/github/edgardmessias/vscode.override-decorator)

[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/edgardmessias/vscode.override-decorator.svg)](https://isitmaintained.com/project/edgardmessias/vscode.override-decorator "Average time to resolve an issue")
[![Percentage of issues still open](https://isitmaintained.com/badge/open/edgardmessias/vscode.override-decorator.svg)](https://isitmaintained.com/project/edgardmessias/vscode.override-decorator "Percentage of issues still open")

Keep a history of your copied and cut items and re-paste, without override the `Ctrl+C` and `Ctrl+V` keyboard shortcuts.

To pick a copied item, only run `Ctrl+Shift+V`

## Features

1. Save history of all copied and cut items
1. Can check copied items outside the VSCode (`"override-decorator.onlyWindowFocused": false`)
1. Paste from history (`Ctrl+Shift+V` => Pick and Paste)
1. Preview the paste
1. Snippets to paste (Ex. `clip01, clip02, ...`)
1. Remove selected item from history
1. Clear all history
1. Open copy location
1. Double click in history view to paste

## Extension Settings

This extension contributes the following settings (default values):

<!--begin-settings-->
```js
{
  // Avoid duplicate clips in the list
  "override-decorator.avoidDuplicates": true,

  // Time in milliseconds to check changes in clipboard. Set zero to disable.
  "override-decorator.checkInterval": 500,

  // Maximum clipboard size in bytes.
  "override-decorator.maxClipboardSize": 1000000,

  // Maximum number of clips to save in clipboard
  "override-decorator.maxClips": 100,

  // Move used clip to top in the list
  "override-decorator.moveToTop": true,

  // Get clips only from VSCode
  "override-decorator.onlyWindowFocused": true,

  // View a preview while you are choosing the clip
  "override-decorator.preview": true,

  // Set location to save the clipboard file, set false to disable
  "override-decorator.saveTo": null,

  // Enable completion snippets
  "override-decorator.snippet.enabled": true,

  // Maximum number of clips to suggests in snippets (Zero for all)
  "override-decorator.snippet.max": 10,

  // Default prefix for snippets completion (clip1, clip2, ...)
  "override-decorator.snippet.prefix": "clip"
}
```
<!--end-settings-->

## Examples

Copy to history:
![Clipboard Manager - Copy](screenshots/copy.gif)

Pick and Paste:
![Clipboard Manager - Pick and Paste](screenshots/pick-and-paste.gif)

