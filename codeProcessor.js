// Main file: codeProcessor.js
const vueProcessor = require("./processors/vueProcessor");
const angularProcessor = require("./processors/angularProcessor");
const nodeProcessor = require("./processors/nodeProcessor");
const jsProcessor = require("./processors/jsProcessor");
const typescriptProcessor = require("./processors/typescriptProcessor");

function processCode(code, languageId) {
    switch (languageId) {
        case "vue":
            return vueProcessor.processVueCode(code);
        case "angular":
            return angularProcessor.processAngularCode(code);
        case "javascript":
            return jsProcessor.processJavaScriptCode(code);
        case "typescript":
            return typescriptProcessor.processTypeScriptCode(code);
        case "node":
            return nodeProcessor.processNodeCode(code);
        default:
            return { enhancedCode: null, changesLog: [] };
    }
}

module.exports = { processCode };