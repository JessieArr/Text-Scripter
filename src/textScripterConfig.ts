import { DiagnosticRule } from './DiagnosticRule';

export class TextScripterConfig
{
    public localFolder : string;
    public diagnostics : Array<DiagnosticRule> = [];
}