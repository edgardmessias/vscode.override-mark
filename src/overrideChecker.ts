/* eslint-disable @typescript-eslint/no-use-before-define */
import * as ts from "typescript";

type AllClassElements =
  | ts.MethodDeclaration
  | ts.PropertyDeclaration
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration
  | ts.IndexSignatureDeclaration
  | ts.ConstructorDeclaration;

type OverrideableElement =
  | ts.MethodDeclaration
  | ts.PropertyDeclaration
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration;

function isSomeClassElement(el: ts.Node): el is AllClassElements {
  return ts.isClassElement(el);
}

interface IOptions {
  useJsdocTag: boolean;
  useDecorator: boolean;
  excludeInterfaces: boolean;
  usePascalCase: boolean;
  newLineAfter: boolean;
  useAngularSyntax: boolean;
}

type HeritageChainCheckResult =
  | {
      baseClass?: ts.Type;
      baseInterface?: ts.Type;
    }
  | undefined;

export class OverrideChecker {
  private _options: IOptions = {
    useJsdocTag: true,
    excludeInterfaces: false,
    newLineAfter: true,
    useAngularSyntax: false,
    useDecorator: true,
    usePascalCase: true,
  };

  public overridePos: number[] = [];
  public implementsPos: number[] = [];

  constructor(
    sourceFile: ts.SourceFile,
    private readonly checker: ts.TypeChecker
  ) {
    this.walk(sourceFile);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addFailureAtNode(...teste: any) {
    //console.log(teste);
  }

  /** @override */
  public walk(sourceFile: ts.SourceFile) {
    const cb = (node: ts.Node): void => {
      if (isSomeClassElement(node)) {
        this.checkClassElement(node);
      }
      return ts.forEachChild(node, cb);
    };

    return ts.forEachChild(sourceFile, cb);
  }

  private checkClassElement(element: AllClassElements) {
    switch (element.kind) {
      case ts.SyntaxKind.Constructor:
        this.checkConstructorDeclaration(element);
        break;
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.PropertyDeclaration:
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.SetAccessor:
        this.checkOverrideableElementDeclaration(element);
        break;
      default:
    }
  }

  private checkConstructorDeclaration(node: ts.ConstructorDeclaration) {
    if (!node.parent || node.parent.heritageClauses === undefined) {
      return;
    }

    this.overridePos.push(node.getStart());
  }

  private checkOverrideableElementDeclaration(node: OverrideableElement) {
    if (isStaticMember(node)) {
      return;
    }

    if (!ts.isPropertyDeclaration(node) && node.body === undefined) {
      // Special case if this is just an overload signature
      return;
    }

    const parent = node.parent;
    if (parent == null || !isClassType(parent)) {
      return;
    }

    if (ts.isClassExpression(parent) && !this._options.useJsdocTag) {
      // decorators are not allowed in anonymous class declarations.
      // Skip anonymous class declarations if JSDoc tags are not an option.
      return;
    }

    const base = this.checkHeritageChain(parent, node);

    if (base !== undefined && base.baseClass !== undefined) {
      this.overridePos.push(node.name.getStart());
    }
    if (base !== undefined && base.baseInterface !== undefined) {
      this.implementsPos.push(node.name.getStart());
    }
  }

  private checkHeritageChain(
    declaration: ts.ClassDeclaration | ts.ClassExpression,
    node: OverrideableElement
  ): HeritageChainCheckResult {
    let baseInterface: ts.Type | undefined;
    let baseClass: ts.Type | undefined;

    const currentDeclaration = declaration;
    if (currentDeclaration === undefined) {
      return;
    }
    const clauses = currentDeclaration.heritageClauses;
    if (clauses === undefined) {
      return;
    }
    for (const clause of clauses) {
      const isInterface = clause.token === ts.SyntaxKind.ImplementsKeyword;
      for (const typeNode of clause.types) {
        const type = this.checker.getTypeAtLocation(typeNode);
        for (const symb of type.getProperties()) {
          if (symb.name === node.name.getText()) {
            if (isInterface) {
              baseInterface = type;
            } else {
              baseClass = type;
            }
          }
        }
      }
    }
    return { baseInterface, baseClass };
  }
}

function isStaticMember(node: ts.Declaration): boolean {
  return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Static) !== 0;
}

function isClassType(
  t: ts.Node | undefined
): t is ts.ClassDeclaration | ts.ClassExpression {
  return (
    t !== undefined &&
    (t.kind === ts.SyntaxKind.ClassDeclaration ||
      t.kind === ts.SyntaxKind.ClassExpression)
  );
}
