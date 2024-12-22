const vscode = require("vscode");
const esprima = require("esprima");
const escodegen = require("escodegen");

/**
 * Activates the extension.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("Silent Code Mentor is now active!");

  // Trigger silent corrections on file save
  let disposable = vscode.workspace.onWillSaveTextDocument((event) => {
    const document = event.document;

    // Only process JavaScript, HTML, or CSS files
    if (!["javascript", "html", "css"].includes(document.languageId)) return;

    const code = document.getText();
    const enhancedCode = enhanceCode(code, document.languageId);

    // Replace code silently
    if (enhancedCode !== code) {
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(code.length)
      );
      edit.replace(document.uri, fullRange, enhancedCode);
      vscode.workspace.applyEdit(edit);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Enhances code silently.
 * @param {string} code
 * @param {string} language
 * @returns {string} enhanced code
 */
function enhanceCode(code, language) {
  switch (language) {
    case "javascript":
      return enhanceJavaScript(code);
    case "html":
      return enhanceHTML(code);
    case "css":
      return enhanceCSS(code);
    default:
      return code;
  }
}

/**
 * Enhances JavaScript code by refactoring and adding best practices.
 * @param {string} code
 * @returns {string} enhanced code
 */
function enhanceJavaScript(code) {
  try {
    const ast = esprima.parseScript(code, { tolerant: true });

    traverseAST(ast, (node) => {
      // Example: Replace "var" with "let" or "const"
      if (node.type === "VariableDeclaration" && node.kind === "var") {
        node.kind = "let";
      }

      // Example: Add default error handling for async/await
      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "fetch"
      ) {
        const tryCatchWrapper = {
          type: "TryStatement",
          block: {
            type: "BlockStatement",
            body: [node],
          },
          handler: {
            type: "CatchClause",
            param: { type: "Identifier", name: "error" },
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "console.error" },
                    arguments: [{ type: "Identifier", name: "error" }],
                  },
                },
              ],
            },
          },
        };
        return tryCatchWrapper;
      }
    });

    return escodegen.generate(ast);
  } catch (err) {
    console.error("JavaScript enhancement error:", err);
    return code;
  }
}

/**
 * Enhances HTML code by adding accessibility attributes.
 * @param {string} code
 * @returns {string} enhanced HTML
 */
function enhanceHTML(code) {
  // Example: Automatically add alt attributes to images
  return code.replace(/<img([^>]*)>/g, (match, attributes) => {
    if (!attributes.includes("alt=")) {
      return `<img${attributes} alt="Image description">`;
    }
    return match;
  });
}

/**
 * Enhances CSS by ensuring WCAG compliance (e.g., color contrast).
 * @param {string} code
 * @returns {string} enhanced CSS
 */
function enhanceCSS(code) {
  // Example: Replace low-contrast colors with WCAG-compliant equivalents
  return code.replace(/color:\s*#([0-9a-f]{3,6})/gi, (match, color) => {
    const compliantColor = ensureWCAGCompliance(color);
    return `color: ${compliantColor}`;
  });
}

/**
 * Traverses an AST and applies a callback to each node.
 * @param {object} node
 * @param {function} callback
 */
function traverseAST(node, callback) {
  if (Array.isArray(node)) {
    node.forEach((child) => traverseAST(child, callback));
  } else if (node && typeof node === "object") {
    Object.keys(node).forEach((key) => {
      traverseAST(node[key], callback);
    });
    callback(node);
  }
}

/**
 * Ensures WCAG compliance for color contrast.
 * @param {string} color
 * @returns {string} WCAG-compliant color
 */
function ensureWCAGCompliance(color) {
  // Example: Replace with a dummy high-contrast color
  return "#000000"; // Replace with a proper algorithm for contrast check
}

/**
 * Deactivates the extension.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
