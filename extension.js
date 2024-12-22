// Main Entry: extension.js
const vscode = require("vscode");
const codeProcessor = require("./codeProcessor");

let outputChannel;

function activate(context) {
    outputChannel = vscode.window.createOutputChannel("Silent Code Mentor");
    outputChannel.appendLine("Silent Code Mentor is now active!");

    let disposable = vscode.workspace.onWillSaveTextDocument((event) => {
        const document = event.document;
        outputChannel.appendLine(`Processing: ${document.uri.fsPath} (${document.languageId})`);

        const enhancedData = codeProcessor.processCode(document.getText(), document.languageId);
        if (enhancedData) {
            const { enhancedCode, changesLog } = enhancedData;

            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                document.uri,
                new vscode.Range(0, 0, document.lineCount, 0),
                enhancedCode
            );

            vscode.workspace.applyEdit(edit);
            outputChannel.appendLine(`Changes: ${changesLog.join(", ")}`);
        } else {
            outputChannel.appendLine("No changes applied.");
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
