/* eslint-disable prettier/prettier */
import {
  MethodDeclaration,
  PropertyDeclaration,
  GetAccessorDeclaration,
  SetAccessorDeclaration,
  IndexSignatureDeclaration,
  ConstructorDeclaration,
  Node,
  TypeChecker,
  ClassDeclaration,
  ClassExpression,
  Declaration,
  Program,
} from "typescript";
import { tsModule } from "./vscodeModules";
import * as vscode from "vscode";

type AllClassElements =
  | MethodDeclaration
  | PropertyDeclaration
  | GetAccessorDeclaration
  | SetAccessorDeclaration
  | IndexSignatureDeclaration
  | ConstructorDeclaration;

type OverrideableElement =
  | MethodDeclaration
  | PropertyDeclaration
  | GetAccessorDeclaration
  | SetAccessorDeclaration;

function isSomeClassElement(el: Node): el is AllClassElements {
  return tsModule.isClassElement(el);
}

function isStaticMember(node: Declaration): boolean {
  return (tsModule.getCombinedModifierFlags(node) & tsModule.ModifierFlags.Static) !== 0;
}

export interface WalkResult {
  hasSource: boolean,
  overrideRanges: vscode.Range[],
  implementRanges: vscode.Range[],
}

export class Walker {
  private _checker: TypeChecker;

  constructor(private _program: Program) {
    this._checker = this._program.getTypeChecker();
  }

  public walk(document: vscode.TextDocument): WalkResult {

    const result: WalkResult = {
      hasSource: false,
      implementRanges: [],
      overrideRanges: [],
    }

    const sourceFile = this._program.getSourceFile(document.fileName);

    if (!sourceFile) {
      return result;
    }
    result.hasSource = true;

    const cb = (node: Node): void => {
      if (isSomeClassElement(node)) {
        this.checkClassElement(node, document, result);
      }
      return tsModule.forEachChild(node, cb);
    };
    tsModule.forEachChild(sourceFile, cb);

    return result;
  }

  private checkClassElement(element: AllClassElements, document: vscode.TextDocument, result: WalkResult) {
    switch (element.kind) {
      case tsModule.SyntaxKind.Constructor:
        this.checkConstructorDeclaration(element, document, result);
        break;
      case tsModule.SyntaxKind.MethodDeclaration:
      case tsModule.SyntaxKind.PropertyDeclaration:
      case tsModule.SyntaxKind.GetAccessor:
      case tsModule.SyntaxKind.SetAccessor:
        this.checkOverrideableElementDeclaration(element, document, result);
        break;
    }
  }

  private checkConstructorDeclaration(node: ConstructorDeclaration, document: vscode.TextDocument, result: WalkResult) {
    if (!node.parent || node.parent.heritageClauses === undefined) {
      return;
    }

    const cb = (n: Node): Node | undefined => {
      if (n.kind === tsModule.SyntaxKind.SuperKeyword) {
        return n;
      }
      return tsModule.forEachChild(n, cb);
    };

    const superKeyword = tsModule.forEachChild(node, cb);

    if (!superKeyword) {
      return;
    }

    let pos = node.getStart();
    let end = node.getStart();

    const contructorKeyword = node.getChildren().find(n => n.kind === tsModule.SyntaxKind.ConstructorKeyword);

    if (contructorKeyword) {
      pos = contructorKeyword.getStart();
      end = contructorKeyword.getEnd();
    }

    result.overrideRanges.push(new vscode.Range(document.positionAt(pos), document.positionAt(end)));
  }

  private checkOverrideableElementDeclaration(node: OverrideableElement, document: vscode.TextDocument, result: WalkResult) {
    if (isStaticMember(node)) {
      return;
    }

    if (!tsModule.isPropertyDeclaration(node) && node.body === undefined) {
      // Special case if this is just an overload signature
      return;
    }

    const parent = node.parent;
    if (parent == null || !tsModule.isClassLike(parent)) {
      return;
    }

    if (tsModule.isClassExpression(parent)) {
      return;
    }

    this.checkHeritageChain(parent, node, document, result);
  }

  private checkHeritageChain(
    declaration: ClassDeclaration | ClassExpression,
    node: OverrideableElement
    , document: vscode.TextDocument, result: WalkResult
  ) {
    const currentDeclaration = declaration;
    if (currentDeclaration === undefined) {
      return;
    }
    const clauses = currentDeclaration.heritageClauses;
    if (clauses === undefined) {
      return;
    }
    for (const clause of clauses) {
      const isInterface = clause.token === tsModule.SyntaxKind.ImplementsKeyword;
      for (const typeNode of clause.types) {
        const type = this._checker.getTypeAtLocation(typeNode);
        for (const symb of type.getProperties()) {
          if (symb.name === node.name.getText()) {
            const range = new vscode.Range(
              document.positionAt(node.name.getStart()),
              document.positionAt(node.name.getEnd()),
            );

            if (isInterface) {
              result.implementRanges.push(range);
            } else {
              result.overrideRanges.push(range);
            }
          }
        }
      }
    }
  }
}
