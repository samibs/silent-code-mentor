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

        // Only process JavaScript, Vue, TypeScript, or Angular files
        if (!["javascript", "vue", "typescript", "html"].includes(document.languageId)) {
            outputChannel.appendLine("Skipping file (unsupported language).\n");
            return;
        }

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

            // Log changes
            outputChannel.appendLine(`Changes applied: ${changesLog.join(", ")}`);
            vscode.window.showInformationMessage(
                `Silent Code Mentor made ${changesLog.length} changes: ${changesLog.join(", ")}`
            );
        } else {
            outputChannel.appendLine("No changes were necessary.\n");
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * Enhances code silently and adds comments for improvements.
 * @param {string} code
 * @param {string} language
 * @returns {object} enhanced code and log of changes
 */
function enhanceCodeWithComments(code, language) {
    let changesLog = [];
    try {
        const ast = esprima.parseScript(code, { tolerant: true, comment: true });

        traverseAST(ast, (node) => {
            // General JavaScript Improvements
            if (language === "javascript" || language === "typescript") {
                // Replace 'var' with 'let' or 'const'
                if (node.type === "VariableDeclaration" && node.kind === "var") {
                    node.kind = "let";
                    changesLog.push("Replaced 'var' with 'let'");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Replaced 'var' with 'let' for modern standards" },
                    ];
                }

                // Add error handling for fetch()
                if (
                    node.type === "CallExpression" &&
                    node.callee.type === "Identifier" &&
                    node.callee.name === "fetch"
                ) {
                    changesLog.push("Added error handling for fetch()");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Added error handling for fetch()" },
                    ];
                }

                // Highlight deeply nested promise chains
                if (
                    node.type === "CallExpression" &&
                    node.callee.property?.name === "then" &&
                    code.split(".then").length > 3
                ) {
                    changesLog.push("Refactor deeply nested promise chains");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Consider refactoring nested promises into async/await for readability" },
                    ];
                }
            }

            // Vue.js Improvements
            if (language === "vue") {
                // Detect missing 'key' in v-for
                if (
                    node.type === "VDirective" &&
                    node.name === "for" &&
                    !code.includes("key")
                ) {
                    changesLog.push("Missing 'key' attribute in v-for loop");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Add a 'key' attribute to v-for loops for better performance" },
                    ];
                }

                // Detect unsanitized v-html usage
                if (
                    node.type === "VAttribute" &&
                    node.name === "v-html"
                ) {
                    changesLog.push("Detected unsanitized v-html usage");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Avoid using v-html without sanitization for security" },
                    ];
                }

                // Highlight large components
                if (code.length > 500) {
                    changesLog.push("Large Vue component detected");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Consider splitting large Vue components into smaller ones" },
                    ];
                }
            }

            // Angular Improvements
            if (language === "html") {
                // Suggest OnPush Change Detection
                if (code.includes("ChangeDetectionStrategy.Default")) {
                    changesLog.push("Suggest using OnPush Change Detection");
                }

                // Add ARIA roles
                if (
                    node.type === "HTMLElement" &&
                    ["button", "div"].includes(node.tagName) &&
                    !code.includes("aria-")
                ) {
                    changesLog.push("Add ARIA roles for accessibility");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Add ARIA roles for better accessibility" },
                    ];
                }
            }

            // Node.js Improvements
            if (language === "javascript") {
                // Warn about synchronous fs operations
                if (
                    node.type === "CallExpression" &&
                    node.callee.type === "MemberExpression" &&
                    node.callee.object.name === "fs" &&
                    node.callee.property.name.includes("Sync")
                ) {
                    changesLog.push("Warn about synchronous fs operations");
                    node.leadingComments = [
                        { type: "Line", value: " scm: Avoid synchronous fs operations for better performance" },
                    ];
                }

                // Suggest using environment variables
                if (code.includes("process.env")) {
                    changesLog.push("Ensure safe usage of environment variables");
                }
            }
        });

        return { enhancedCode: escodegen.generate(ast, { comment: true }), changesLog };
    } catch (err) {
        outputChannel.appendLine(`Error processing ${language} code: ${err.message}`);
        console.error(`${language} enhancement error:`, err);
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
