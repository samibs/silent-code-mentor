const vscode = require("vscode");
const esprima = require("esprima");
const escodegen = require("escodegen");

let outputChannel;

/**
 * Activates the extension.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Create an output channel for logging
    outputChannel = vscode.window.createOutputChannel("Silent Code Mentor");
    outputChannel.appendLine("Silent Code Mentor is now active!");

    // Trigger silent corrections on file save
    let disposable = vscode.workspace.onWillSaveTextDocument((event) => {
        const document = event.document;

        // Log the document type
        outputChannel.appendLine(`Processing file: ${document.uri.fsPath}`);
        outputChannel.appendLine(`Language: ${document.languageId}`);

        // Only process JavaScript files
        if (document.languageId !== "javascript") {
            outputChannel.appendLine("Skipping file (unsupported language).");
            return;
        }

        const code = document.getText();
        const { enhancedCode, changesLog } = enhanceCodeWithComments(code);

        // Replace code silently and show changes
        if (enhancedCode !== code) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(code.length)
            );
            edit.replace(document.uri, fullRange, enhancedCode);
            vscode.workspace.applyEdit(edit);

            // Log changes
            outputChannel.appendLine(`Changes applied: ${changesLog.join(", ")}`);
            vscode.window.showInformationMessage(
                `Silent Code Mentor made ${changesLog.length} changes: ${changesLog.join(", ")}`
            );
        } else {
            outputChannel.appendLine("No changes were necessary.");
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * Enhances JavaScript test code silently and adds comments for improvements.
 * @param {string} code
 * @returns {object} enhanced code and log of changes
 */
function enhanceCodeWithComments(code) {
    let changesLog = [];
    try {
        const ast = esprima.parseScript(code, { tolerant: true, comment: true });

        traverseAST(ast, (node) => {
            // Detect and suggest replacing setTimeout with sinon.useFakeTimers()
            if (
                node.type === "CallExpression" &&
                node.callee.name === "setTimeout" &&
                node.arguments[1]?.value > 500 // Long timeout
            ) {
                changesLog.push(`Detected long-running setTimeout (${node.arguments[1].value}ms)`);
                node.leadingComments = [
                    { type: "Line", value: " scm: Consider using sinon.useFakeTimers() for faster test execution" },
                ];
            }

            // Warn about unused 'done' callback
            if (
                node.type === "FunctionExpression" &&
                node.params.some((param) => param.name === "done") &&
                !code.includes("done()")
            ) {
                changesLog.push("Found test case with unused 'done' callback");
                node.leadingComments = [
                    { type: "Line", value: " scm: Warning: 'done' callback is passed but not used" },
                ];
            }

            // Suggest adding .catch for promise error handling
            if (
                node.type === "CallExpression" &&
                node.callee.type === "MemberExpression" &&
                node.callee.property.name === "then" &&
                !code.includes(".catch")
            ) {
                changesLog.push("Detected promise without .catch for error handling");
                node.leadingComments = [
                    { type: "Line", value: " scm: Consider adding '.catch' to handle promise rejection" },
                ];
            }

            // Suggest returning promises in tests
            if (
                node.type === "ExpressionStatement" &&
                node.expression.type === "CallExpression" &&
                node.expression.callee.type === "MemberExpression" &&
                node.expression.callee.property.name === "then"
            ) {
                changesLog.push("Detected promise without return in test");
                node.leadingComments = [
                    { type: "Line", value: " scm: Ensure promise is returned for proper test execution" },
                ];
            }

            // Suggest refactoring deeply nested promises
            if (
                node.type === "CallExpression" &&
                node.callee.type === "MemberExpression" &&
                node.callee.property.name === "then" &&
                code.split(".then").length > 3
            ) {
                changesLog.push("Detected deeply nested promise chain");
                node.leadingComments = [
                    { type: "Line", value: " scm: Consider refactoring nested promises into async/await for readability" },
                ];
            }

            // Suggest reviewing skipped tests
            if (
                node.type === "CallExpression" &&
                node.callee.type === "MemberExpression" &&
                node.callee.property.name === "skip"
            ) {
                changesLog.push("Found skipped test case");
                node.leadingComments = [
                    { type: "Line", value: " scm: Review skipped test cases to ensure they are necessary" },
                ];
            }
        });

        return { enhancedCode: escodegen.generate(ast, { comment: true }), changesLog };
    } catch (err) {
        outputChannel.appendLine(`Error processing JavaScript: ${err.message}`);
        console.error("JavaScript enhancement error:", err);
        return { enhancedCode: code, changesLog };
    }
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
 * Deactivates the extension.
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
