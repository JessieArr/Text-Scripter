

export class DiagnosticRule
{
    public text : string;
    public regex : string;
    public message : string;
    public severity : string = "warning";
    public fileExtensions : string;
}