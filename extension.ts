// extension.ts

const vscode = require('vscode');
const esprima = require('esprima');
const escodegen = require('escodegen');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Silent Code Mentor is now active!');

  // Load configuration
  const config = vscode.workspace.getConfiguration('silentCodeMentor');
  const enableAutoFix = config.get('enableAutoFix', true);
  const enableCommentGeneration = config.get('enableCommentGeneration', true);
  const enableAccessibilityChecks = config.get('enableAccessibilityChecks', true);
  const enableSecurityChecks = config.get('enableSecurityChecks', true);

  // Register a command that triggers optimization (for testing)
  let disposable = vscode.commands.registerCommand('silent-code-mentor.optimize', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active text editor found!');
      return;
    }

    const document = editor.document;

    // Only process JavaScript files
    if (document.languageId !== 'javascript') {
      vscode.window.showWarningMessage('Silent Code Mentor only works on JavaScript files.');
      return;
    }

    const code = document.getText();
    const optimizedCode = processCode(code, {
      enableCommentGeneration,
      enableAccessibilityChecks,
      enableSecurityChecks,
    });

    // Apply the changes to the editor
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(code.length)
    );

    editor.edit((editBuilder) => {
      editBuilder.replace(fullRange, optimizedCode);
    });

    vscode.window.showInformationMessage('Code optimized silently!');
  });

  context.subscriptions.push(disposable);

  // Register a listener for file saves
  vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.languageId === 'javascript' && enableAutoFix) {
      const code = document.getText();
      const optimizedCode = processCode(code, {
        enableCommentGeneration,
        enableAccessibilityChecks,
        enableSecurityChecks,
      });

      if (code !== optimizedCode) {
        // Apply changes silently
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(code.length)
        );
        edit.replace(document.uri, fullRange, optimizedCode);
        vscode.workspace.applyEdit(edit);
      }
    }
  });
}

/**
 * Processes and optimizes the code.
 * @param {string} code
 * @returns {string} optimized code
 */
function processCode(code, options) {
  try {
    const ast = esprima.parseScript(code, { tolerant: true });

    traverseAST(ast, (node) => {
      // Replace 'var' with 'let'
      if (
        node.type === 'VariableDeclaration' &&
        node.kind === 'var'
      ) {
        node.kind = 'let';
      }

      // Generate comments (if enabled)
      if (options.enableCommentGeneration) {
        // Example: Generate a comment for arrow functions
        if (node.type === 'ArrowFunctionExpression') {
          const comment = `// This is an arrow function`;
          node.leadingComments = [{ type: 'CommentLine', value: comment }];
        }
      }

      // Perform accessibility checks (if enabled)
      if (options.enableAccessibilityChecks) {
        // Example: Check for missing alt attributes in JSX
        if (
          node.type === 'JSXElement' &&
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.name === 'img' &&
          !node.openingElement.attributes.find(
            (attr) => attr.name.name === 'alt'
          )
        ) {
          node.openingElement.attributes.push({
            type: 'JSXAttribute',
            name: { type: 'JSXIdentifier', name: 'alt' },
            value: { type: 'JSXExpressionContainer', expression: { type: 'Literal', value: 'Image description' } },
          });
        }
      }

      // Perform security checks (if enabled)
      if (options.enableSecurityChecks) {
        // Example: Check for potential vulnerabilities (e.g., insecure DOM manipulation)
        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'ThisExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'innerHTML'
        ) {
          // Log a warning (consider using a more sophisticated approach)
          console.warn('Potential security risk: Using `innerHTML` can lead to cross-site scripting (XSS).');
        }
      }
    });

    const optimizedCode = escodegen.generate(ast);

    return optimizedCode;
  } catch (err) {
    console.error('Error processing code:', err);
    // Track error (optional)
    // client.trackException({ exception: err }); 
    return code; // Return original code if an error occurs
  }
}

/**
 * Traverses the Abstract Syntax Tree (AST).
 * @param {object} node
 * @param {function} callback
 */
function traverseAST(node, callback) {
  if (Array.isArray(node)) {
    node.forEach((child) => traverseAST(child, callback));
  } else if (node && typeof node === 'object') {
    Object.keys(node).forEach((key) => {
      traverseAST(node[key], callback);
    });
    callback(node);
  }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};