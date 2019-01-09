// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs'
import * as os from 'os'
import * as util from 'util'
import * as vscode from 'vscode'

function getVSCodeData(editor: vscode.TextEditor) {
	let name = (vscode.env.appName === "Visual Studio Code - Insiders") ? "Code - Insiders" : "Code"
	let delimiter = "/"
	let extansionPath
	let language: string = editor.document.languageId
	let selectedText: string = editor.document.getText(editor.selection)

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

	return [extansionPath, delimiter, language, selectedText]
}


export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.bigbearsCreateSnippet', async () => {
		let editor = vscode.window.activeTextEditor;

		if (editor != undefined) {
			let [extansionPath, delimiter, language, selectedText] = getVSCodeData(editor)
			let snippetName = await vscode.window.showInputBox({ prompt: "Enter snippet name" })
			let prefix = await vscode.window.showInputBox({ prompt: "Please enter snippet prefix" })
			let userSnippetsFile = extansionPath + util.format("snippets%s.json", delimiter + language)

			if (snippetName !== undefined && prefix !== undefined) {
				const _snippetName = snippetName !== undefined ? snippetName.toString() : "unknown"
				fs.readFile(userSnippetsFile, (err, data) => {
					if (err) {
						fs.open(userSnippetsFile, "w+", (err) => {
							if (err) {
								vscode.window.showErrorMessage("Unable to create snippet file [" + userSnippetsFile + "]");
							}

							let snippet: any = {}
							snippet[_snippetName] = {
								prefix: prefix,
								body: selectedText.split("\n"),
								description: ""
							}

							fs.writeFile(userSnippetsFile, JSON.stringify(snippet, null, 2), (err) => {
								if (err) vscode.window.showErrorMessage("Error while saving new snippet!");
								vscode.window.showInformationMessage("Successfullu save snippet!");
							})
						})
					} else {
						let content = data.toString()
						let restoreObject: any = JSON.parse(content);

						if (restoreObject[_snippetName] !== undefined || restoreObject[_snippetName] === null) {
							vscode.window.showErrorMessage("Snippet with this name already exists");
							return;
						} else {
							restoreObject[_snippetName] = {
								prefix: prefix,
								body: selectedText.split("\n"),
								description: ""
							}

							fs.writeFile(userSnippetsFile, JSON.stringify(restoreObject, null, 2), (err) => {
								if (err) vscode.window.showErrorMessage("Error while saving new snippet!");
							})
						}
					}
				})
			} else {
				vscode.window.showWarningMessage("Missing [Snippet nane] and [Prefix].");
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
