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
	var config = await loadConfig();

	const openHandler = async (doc: vscode.TextDocument) => {
		if(!doc.uri)
		{
			return;
		}
		if(!config)
		{
			// Config isn't loaded yet.
			return;
		}
		const diagnostics = await getDiagnostics(doc, config);
		diagnosticCollection.set(doc.uri, diagnostics);
	};

	const changeHandler = async (doc: vscode.TextDocumentChangeEvent) => {
		if(!doc.document.uri)
		{
			return;
		}
		if(!config)
		{
			// Config isn't loaded yet.
			return;
		}
		const folder = vscode.workspace.getWorkspaceFolder(doc.document.uri);
		if(!folder)
		{
			return;
		}
		const configFile = vscode.Uri.joinPath(folder.uri, configFilePath);
		if(doc.document.uri.path === configFile.path)
		{
			console.log("Config file changed!");
			config = await loadConfig();
		}
		else{
			const diagnostics = await getDiagnostics(doc.document, config);
			diagnosticCollection.set(doc.document.uri, diagnostics);	
		}
	};

	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => openHandler(doc));
	const didSave = vscode.workspace.onDidSaveTextDocument(doc => openHandler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(doc => changeHandler(doc));

	if (vscode.window.activeTextEditor) {
		await openHandler(vscode.window.activeTextEditor.document);
	}

	context.subscriptions.push(diagnosticCollection, didOpen, didChange, didSave);
}

async function getDiagnostics(doc: vscode.TextDocument, config: TextScripterConfig) : Promise<vscode.Diagnostic[]>
{
	const text = doc.getText();
	const diagnostics = new Array<vscode.Diagnostic>();

	const lines = text.split(/\r\n|\n/);

	var line = 0;
	lines.forEach(lineText => {
		config.diagnostics.forEach(diagnosticRule => {
			if(diagnosticRule.fileExtensions)
			{
				// bail early if this rule doesn't match the file
				const fileExtensions = diagnosticRule.fileExtensions.split(',');
				const fileExtensionMatch = fileExtensions.find(ext => doc.fileName.endsWith(ext));
				if(!fileExtensionMatch)
				{
					return;
				}
			}
			const lineTextMatch = lineText.indexOf(diagnosticRule.text);
			if(lineTextMatch > -1)
			{
				const range = new vscode.Range(
					line, lineTextMatch,
					line, lineTextMatch + diagnosticRule.text.length);
				const diagnostic = new vscode.Diagnostic(
					range,
					diagnosticRule.message,
					getSeverity(diagnosticRule.severity));
				diagnostics.push(diagnostic);
			}
		});
		line++;
	});

	return diagnostics;
}

async function loadConfig() : Promise<TextScripterConfig | null>
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

function getSeverity(severity: string) : vscode.DiagnosticSeverity
{
	switch(severity)
	{
		case "error":
			return vscode.DiagnosticSeverity.Error;
		case "warn":
			return vscode.DiagnosticSeverity.Warning;
		case "info":
			return vscode.DiagnosticSeverity.Information;
		case "hint":
			return vscode.DiagnosticSeverity.Hint;
		default:
			return vscode.DiagnosticSeverity.Warning;
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
