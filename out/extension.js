"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const fs = require("fs");
const os = require("os");
const util = require("util");
const vscode = require("vscode");
function getVSCodeData(editor) {
    let name = (vscode.env.appName === "Visual Studio Code - Insiders") ? "Code - Insiders" : "Code";
    let delimiter = "/";
    let extansionPath;
    let language = editor.document.languageId;
    let selectedText = editor.document.getText(editor.selection);
    switch (os.type()) {
        case ("Darwin"): {
            extansionPath = process.env.HOME + "/Library/Application Support/" + name + "/User/";
            break;
        }
        case ("Linux"): {
            extansionPath = process.env.HOME + "/.config/" + name + "/User/";
            break;
        }
        case ("Windows_NT"): {
            extansionPath = process.env.APPDATA + "\\" + name + "\\User\\";
            delimiter = "\\";
            break;
        }
        default: {
            extansionPath = process.env.HOME + "/.config/" + name + "/User/";
            break;
        }
    }
    return [extansionPath, delimiter, language, selectedText];
}
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.bigbearsCreateSnippet', () => __awaiter(this, void 0, void 0, function* () {
        let editor = vscode.window.activeTextEditor;
        if (editor != undefined) {
            let [extansionPath, delimiter, language, selectedText] = getVSCodeData(editor);
            let snippetName = yield vscode.window.showInputBox({ prompt: "Enter snippet name" });
            let prefix = yield vscode.window.showInputBox({ prompt: "Please enter snippet prefix" });
            let userSnippetsFile = extansionPath + util.format("snippets%s.json", delimiter + language);
            if (snippetName !== undefined && prefix !== undefined) {
                const _snippetName = snippetName !== undefined ? snippetName.toString() : "unknown";
                fs.readFile(userSnippetsFile, (err, data) => {
                    if (err) {
                        fs.open(userSnippetsFile, "w+", (err) => {
                            if (err) {
                                vscode.window.showErrorMessage("Unable to create snippet file [" + userSnippetsFile + "]");
                            }
                            let snippet = {};
                            snippet[_snippetName] = {
                                prefix: prefix,
                                body: selectedText.split("\n"),
                                description: ""
                            };
                            fs.writeFile(userSnippetsFile, JSON.stringify(snippet, null, 2), (err) => {
                                if (err)
                                    vscode.window.showErrorMessage("Error while saving new snippet!");
                                vscode.window.showInformationMessage("Successfullu save snippet!");
                            });
                        });
                    }
                    else {
                        let content = data.toString();
                        let restoreObject = JSON.parse(content);
                        if (restoreObject[_snippetName] !== undefined || restoreObject[_snippetName] === null) {
                            vscode.window.showErrorMessage("Snippet with this name already exists");
                            return;
                        }
                        else {
                            restoreObject[_snippetName] = {
                                prefix: prefix,
                                body: selectedText.split("\n"),
                                description: ""
                            };
                            fs.writeFile(userSnippetsFile, JSON.stringify(restoreObject, null, 2), (err) => {
                                if (err)
                                    vscode.window.showErrorMessage("Error while saving new snippet!");
                            });
                        }
                    }
                });
            }
            else {
                vscode.window.showWarningMessage("Missing [Snippet nane] and [Prefix].");
            }
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map