// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('text-scripter is starting up!');

	const diagnosticCollection = vscode.languages.createDiagnosticCollection('text-scripter');

	const handler = async (doc: vscode.TextDocument) => {
		const filename = typeof doc.fileName === "function" ? doc.fileName() : doc.fileName;
		if(filename)
		{
			console.log(filename);
		}
		if(!filename || !filename.endsWith('.txt'))
		{
			return;
		}

		console.log('txt file!');

		const diagnostics = await getDiagnostics(doc);
		diagnosticCollection.set(doc.uri, diagnostics);
	};

	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(doc => handler(doc));
	const codeActionProvider = vscode.languages.registerCodeActionsProvider('txt', new CodeActionProvider());

	if (vscode.window.activeTextEditor) {
		await handler(vscode.window.activeTextEditor.document);
	}

	context.subscriptions.push(diagnosticCollection, didOpen, didChange, codeActionProvider);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('text-scripter.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from Text Scripter!');
	// });

	// context.subscriptions.push(disposable);
}

async function getDiagnostics(doc: vscode.TextDocument) : Array<vscode.Diagnostic>
{
	console.log('getDiagnostics called');
	const text = doc.getText();
	const diagnostics = new Array<vscode.Diagnostic>();

	const lines = text.split(/\r\n|\n/);

	lines.forEach(lineText => {
		if(lineText === "@author")
		{
			const line = lines.indexOf(lineText);
			const range = new vscode.Range(line, 0, line, lineText.length);
			const diagnostic = new vscode.Diagnostic(range, "Author is missing", vscode.DiagnosticSeverity.Warning);
			diagnostics.push(diagnostic);
		}
	});

	return diagnostics;
}

// This method is called when your extension is deactivated
export function deactivate() {}
