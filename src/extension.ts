// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readFileSync, existsSync } from 'fs';
import { TextScripterConfig } from './textScripterConfig';
import { provideCodeActions } from './codeActionProvider';

const extensionRootDirectory = ".text-scripter";
const configFileName = "config.json";

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
		const configFilePath = extensionRootDirectory + '/' + configFileName;
		const configFile = vscode.Uri.joinPath(folder.uri, configFilePath);
		const localConfigPath = extensionRootDirectory
			+ '/' + config.localFolder 
			+ '/' + configFileName;
		const localConfigFile = vscode.Uri.joinPath(folder.uri, localConfigPath);
		if(doc.document.uri.path === configFile.path)
		{
			console.log("Config file changed!");
			config = await loadConfig();
		} else if(doc.document.uri.path === localConfigFile.path) {
			console.log("Local config file changed!");
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

	// const helloWorldCommand = vscode.commands.registerCommand('text-scripter.helloWorld', () => {
	// 	const editor = vscode.window.activeTextEditor;
	// 	const selection = editor.selection;
	// 	if (selection && !selection.isEmpty) {
	// 		console.log(editor.document.uri);
	// 	    const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
	// 	    const highlighted = editor.document.getText(selectionRange);
	// 		editor.edit(editBuilder => {
	// 			const document = editor.document;
    //             editor.selections.forEach(sel => {
    //                 const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
    //                 let word = document.getText(range);
    //                 let reversed = word.split('').reverse().join('');
    //                 editBuilder.replace(range, reversed);
    //             });
	// 			vscode.window.showInformationMessage("Done!");
    //         });
	// 	}
    // });

	// const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    //     { language: 'json' },
    //     {
    //         provideCodeActions
    //     }
    // );

	/**
	 * TO resume testing of right click context menu items,
	 * Add this to the "contributes" section of package.json,
	 * and uncomment the line below where we don't load the command.
    "menus": {
      "editor/context": [
        {
          "command": "text-scripter.helloWorld",
          "group": "text-scripter",
          "when": "editorHasSelection"
        }
      ]
    },
    "commands": [
      {
        "command": "text-scripter.helloWorld",
        "title": "Hello World"
      }
    ]
	 */

	context.subscriptions.push(
		//codeActionProvider,
		//helloWorldCommand,
		diagnosticCollection,
		didOpen,
		didChange,
		didSave
	);
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
{	const configFilePath = extensionRootDirectory + '/' + configFileName;
	const configFiles = await vscode.workspace.findFiles(
		configFilePath,
		'**/node_modules/**',
		1
	);
	if(configFiles.length === 0)
	{
		console.log("Failed to load text-scripter config from: " + configFilePath);
		return null;
	}
	const configFileContents = readFileSync(configFiles[0].fsPath, 'utf8');
	const config = JSON.parse(configFileContents) as TextScripterConfig;
	if(config.localFolder) {
		const localConfigPath = extensionRootDirectory
		+ '/' + config.localFolder 
		+ '/' + configFileName;
		const localConfigFiles = await vscode.workspace.findFiles(
			localConfigPath,
			'**/node_modules/**',
			1
		);
		if(localConfigFiles.length === 0)
		{
			console.log("Failed to load text-scripter local config from: " + localConfigPath);
			return config;
		}
		const localConfigFileContents = readFileSync(localConfigFiles[0].fsPath, 'utf8');
		const localConfig = JSON.parse(localConfigFileContents) as TextScripterConfig;
		if(localConfig.diagnostics) {
			localConfig.diagnostics.forEach(diagnostic => {
				config.diagnostics.push(diagnostic);
			});
		}
	}
	
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
