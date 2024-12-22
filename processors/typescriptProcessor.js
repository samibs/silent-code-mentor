import * as ts from "typescript";

export function processTypeScriptCode(code: string) {
  const changesLog: string[] = [];

  // Parse the input code into an AST
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  function visit(node: ts.Node): ts.Node | undefined {
    // Check for variable declarations with 'var'
    if (
      ts.isVariableDeclarationList(node) &&
      (node.flags & ts.NodeFlags.Let) === 0 // Check if it's not already a 'let' declaration
    ) {
      changesLog.push("Replaced 'var' with 'let' in TypeScript file.");

      // Create a new VariableDeclarationList with `let`
      return ts.factory.updateVariableDeclarationList(
        node,
        node.flags | ts.NodeFlags.Let, // Add the 'let' flag
        node.declarations
      );
    }

    // Continue traversing the AST
    return ts.visitEachChild(node, visit, context);
  }

  // Define a custom transformation context
  const context: ts.TransformationContext = {
    factory: ts.factory,
    // Add other necessary properties of TransformationContext if required
  };

  // Apply transformations
  const updatedAst = ts.transform(sourceFile, [(context) => (rootNode) => visit(rootNode)]).transformed[0];

  // Print the transformed AST
  const enhancedCode = printer.printFile(updatedAst);

  return { enhancedCode, changesLog };
}