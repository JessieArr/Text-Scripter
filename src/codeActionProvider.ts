import * as vscode from 'vscode';

export function provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
): vscode.CodeAction[] {
    const codeActions: vscode.CodeAction[] = [];

    context.diagnostics.forEach(diagnostic => {
        if (diagnostic.message.includes('deprecated')) {
            const fix = new vscode.CodeAction('Fix await openHandler', vscode.CodeActionKind.QuickFix);
            fix.edit = new vscode.WorkspaceEdit();
            fix.edit.replace(document.uri, diagnostic.range, 'await openHandler(vscode.window.activeTextEditor.document);');
            codeActions.push(fix);
        }
    });

    return codeActions;
}