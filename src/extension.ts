// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readFileSync } from 'fs';
import { TextScripterConfig } from './textScripterConfig';

const configFilePath = ".text-scripter/config.json";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('text-scripter is starting up!');

	const diagnosticCollection = vscode.languages.createDiagnosticCollection('text-scripter');
	const config = await loadConfig();

	const openHandler = async (doc: vscode.TextDocument) => {
		if(!doc.uri)
		{
			return;
		}
		const diagnostics = await getDiagnostics(doc, config);
		diagnosticCollection.set(doc.uri, diagnostics);
	};

	const changeHandler = async (doc: vscode.TextDocument) => {
		if(!doc.uri)
		{
			return;
		}
		if(doc.uri === configFilePath)
		{
			config = await loadConfig();
		}
		else{
			const diagnostics = await getDiagnostics(doc, config);
			diagnosticCollection.set(doc.uri, diagnostics);	
		}
	};

	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => openHandler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(doc => changeHandler(doc));

	if (vscode.window.activeTextEditor) {
		await openHandler(vscode.window.activeTextEditor.document);
	}

	context.subscriptions = new Array<vscode.Disposable>(diagnosticCollection, didOpen, didChange);
}

async function getDiagnostics(doc: vscode.TextDocument, config: TextScripterConfig) : Array<vscode.Diagnostic>
{
	if(!doc.getText)
	{
		return;
	}
	const text = doc.getText();
	const diagnostics = new Array<vscode.Diagnostic>();

	const lines = text.split(/\r\n|\n/);

	var line = 0;
	lines.forEach(lineText => {
		config.warningHighlights.forEach(highlight => {
			if(lineText === highlight)
			{
				const range = new vscode.Range(line, 0, line, lineText.length);
				const diagnostic = new vscode.Diagnostic(
					range,
					highlight + " is configured as a warning!",
					vscode.DiagnosticSeverity.Warning);
				diagnostics.push(diagnostic);
			}
		});
		line++;
	});

	return diagnostics;
}

async function loadConfig() : TextScripterConfig | null
{
	const configFiles = await vscode.workspace.findFiles(configFilePath, '**/node_modules/**', 1);
	if(configFiles.length === 0)
	{
		return null;
	}
	//const openPath = vscode.Uri.file(configFiles[0].fsPath);
	const configFileContents = readFileSync(configFiles[0].fsPath, 'utf8');
	const config = JSON.parse(configFileContents) as TextScripterConfig;
	return config;
}

// This method is called when your extension is deactivated
export function deactivate() {}
