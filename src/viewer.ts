import { Parser, HtmlRenderer } from "commonmark"
import Mermaid from "mermaid";

export default class MermaidViewer {

    private getCleanedContent(rawContent : string) : string
    {
        if (rawContent.includes(':::mermaid'))
        {
            rawContent = rawContent.replace(':::mermaid','```mermaid');
            rawContent = rawContent.replace(':::','```');

            return this.getCleanedContent(rawContent);
        }

        return rawContent;
    }

    public renderContent(rawContent : string, options) {

        var reader = new Parser();
        var writer = new HtmlRenderer();

        console.log("rawContent");
        console.log(rawContent);

        var container = document.getElementById('viewer-content-display');

        var rawContentCleaned = this.getCleanedContent(rawContent); 

        if (rawContentCleaned.includes('```'))
        {
            var parsed = reader.parse(rawContentCleaned);
            var resultHtml = writer.render(parsed);

            container.innerHTML = resultHtml
            var mermaidParagraphs = container.querySelectorAll('pre > code.language-mermaid')

            var parser = new DOMParser();
            mermaidParagraphs.forEach((p:any) => {
                var parsed = parser.parseFromString(p.innerHTML, 'text/html')
                p.innerHTML = parsed.documentElement.textContent

                p.classList.add('mermaid')
            })

            Mermaid.run()
        }
        else
        {
            var graphDefinition = rawContent;
            Mermaid.mermaidAPI.render('graphDiv', graphDefinition).then(({ svg, bindFunctions }) => {
                container.innerHTML = svg;
                bindFunctions?.(container);
            });
        }
    }
}