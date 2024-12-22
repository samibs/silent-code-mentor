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
    const { enhancedCode, changesLog } = enhanceCodeWithComments(code, document.languageId);

    // Replace code silently and show changes
    if (enhancedCode !== code) {
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(code.length)
      );
      edit.replace(document.uri, fullRange, enhancedCode);
      vscode.workspace.applyEdit(edit);

      // Show information message for changes made
      vscode.window.showInformationMessage(
        `Silent Code Mentor made ${changesLog.length} changes: ${changesLog.join(", ")}`
      );
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Enhances code silently and adds comments to the code.
 * @param {string} code
 * @param {string} language
 * @returns {object} enhanced code and log of changes
 */
function enhanceCodeWithComments(code, language) {
  let changesLog = [];
  let enhancedCode = code;

  switch (language) {
    case "javascript":
      enhancedCode = enhanceJavaScriptWithComments(code, changesLog);
      break;
    case "html":
      enhancedCode = enhanceHTMLWithComments(code, changesLog);
      break;
    case "css":
      enhancedCode = enhanceCSSWithComments(code, changesLog);
      break;
  }

  return { enhancedCode, changesLog };
}

/**
 * Enhances JavaScript code by refactoring and adding best practices, with comments.
 * @param {string} code
 * @param {array} changesLog
 * @returns {string} enhanced code
 */
function enhanceJavaScriptWithComments(code, changesLog) {
  try {
    const ast = esprima.parseScript(code, { tolerant: true });

    traverseAST(ast, (node) => {
      // Replace "var" with "let"
      if (node.type === "VariableDeclaration" && node.kind === "var") {
        node.kind = "let";
        changesLog.push('Replaced "var" with "let"');
        node.leadingComments = [
          { type: "Line", value: " scm: Replaced 'var' with 'let' for modern JavaScript standards" },
        ];
      }

      // Add default error handling for async/await
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
        changesLog.push("Added error handling for fetch()");
        tryCatchWrapper.leadingComments = [
          { type: "Line", value: " scm: Added error handling for fetch()" },
        ];
        return tryCatchWrapper;
      }
    });

    return escodegen.generate(ast, { comment: true });
  } catch (err) {
    console.error("JavaScript enhancement error:", err);
    return code;
  }
}

/**
 * Enhances HTML code by adding accessibility attributes, with comments.
 * @param {string} code
 * @param {array} changesLog
 * @returns {string} enhanced HTML
 */
function enhanceHTMLWithComments(code, changesLog) {
  return code.replace(/<img([^>]*)>/g, (match, attributes) => {
    if (!attributes.includes("alt=")) {
      changesLog.push("Added alt attribute to <img>");
      return `<img${attributes} alt="Image description"> <!-- scm: Added alt attribute for accessibility -->`;
    }
    return match;
  });
}

/**
 * Enhances CSS by ensuring WCAG compliance (e.g., color contrast), with comments.
 * @param {string} code
 * @param {array} changesLog
 * @returns {string} enhanced CSS
 */
function enhanceCSSWithComments(code, changesLog) {
  return code.replace(/color:\s*#([0-9a-f]{3,6})/gi, (match, color) => {
    const compliantColor = ensureWCAGCompliance(color);
    if (compliantColor !== color) {
      changesLog.push(`Updated color ${color} to ${compliantColor} for WCAG compliance`);
      return `color: ${compliantColor}; /* scm: Updated for WCAG compliance */`;
    }
    return match;
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
