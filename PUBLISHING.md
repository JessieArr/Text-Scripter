# Notes on how to publish a VS code extension

Install VSCE

`npm i -g @vscode/vsce`

Package the extension into a vsix file.

`vsce package`

(If you have not already done this) log into your extension profile. This will require a Personal Access Token issued here: https://dev.azure.com/jessiearr/_usersSettings/tokens

`vsce login jessie-arr`

You will be prompted for the PAT. Enter it.

Then publish the extension.

`vsce publish`

THe extension will appear on the VS Code extension store here: https://marketplace.visualstudio.com/items?itemName=jessie-arr.text-scripter