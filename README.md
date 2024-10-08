# Text Scripter

This package introduces a configuration-driven way of controlling native VS Code behaviors such as Diagnostic highlighting and code hints.

Simply create a file named `config.json` in a directory named `.text-scripter` in the root of your workspace, and fill it out like so:

```
{
    "localFolder": "local",
    "diagnostics": [
        {
            "text": "@error",
            "message": "@error tags are highlighted in red.",
            "severity": "error"
        },
        {
            "text": "@warn",
            "message": "@warn tags are highlighted in yellow."
        },
        {
            "text": "@info",
            "message": "@info tags are highlighted in blue.",
            "severity": "info"
        },
        {
            "text": "@hint",
            "message": "@hint tags have their first character underlined in gray.",
            "severity": "hint",
            "fileExtensions": "txt"
        }
    ]
}
```

`localFolder` allows you to load a second config from a second path nested inside of
the .text-scripter folder. This allows developers to have a second set of personal
diagnostic rules which don't need to be included in source control. Defaults to `local`.

### Diagnostics
The fields for a diagnostic rule are as follows:

- `text`: The text to be highlighted.
- `regex`: The JS-flavored regex pattern to be searched for, e.g. `exa+mple` would match `exaaaample`.
- `message`: The text displayed on hover and in the Problems pane for this diagnostic.
- `severity`: (optional) One of `error`, `warn`, `info`, `hint`. Controls how VS Code higlights the text. Defaults to `warn`.
- `fileExtensions`: (optional) CSV of file extensions the rule will apply for. Provide this to improve performance.

You may replace these diagnostic rules with your own - they should load and begin running on files in your workspace immediately, as soon as you change or save the file.