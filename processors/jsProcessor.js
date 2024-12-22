// File: processors/jsProcessor.js
const { parse } = require("@babel/parser");
const escodegen = require("escodegen");

function processJavaScriptCode(code) {
    const changesLog = [];

    try {
        const ast = parse(code, { sourceType: "module", plugins: ["optionalChaining"] }).program;

        traverseAST(ast, (node) => {
            if (node.type === "VariableDeclaration" && node.kind === "var") {
                node.kind = "let";
                changesLog.push("Replaced 'var' with 'let'.");
            }
        });

        const enhancedCode = escodegen.generate(ast);
        return { enhancedCode, changesLog };
    } catch (err) {
        changesLog.push(`Error enhancing code: ${err.message}`);
        return { enhancedCode: null, changesLog };
    }
}

function traverseAST(rootNode, callback) {
    const stack = [rootNode];
    while (stack.length > 0) {
        const node = stack.pop();
        if (!node) continue;

        if (typeof node === "object") {
            callback(node);
            stack.push(...Object.values(node).filter((child) => typeof child === "object"));
        }
    }
}

module.exports = { processJavaScriptCode };