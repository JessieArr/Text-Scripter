import * as vscode from 'vscode';

export default class TextScripter{
    public helloWorld() : string {
        return 'Hello World';
    }

    public test() : void {
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('text-scripter');
    }
}