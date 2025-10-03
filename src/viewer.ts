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

    public async renderContent(rawContent : string, options) {

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
            //console.log("ready to render raw mermaid");

            var graphDefinition = rawContent;

            Mermaid.parseError = function (err, hash) {
                console.error("parse error");
                // On render failure fallback to showing original text as markdown code
                const fallbackMd = '```mermaid\n' + graphDefinition + '\n```';
                const parsed = reader.parse(fallbackMd);
                const html = writer.render(parsed);
                container.innerHTML = html;
            };

            // validate diagram before rendering
            await Mermaid.parse(graphDefinition);

            //console.log("I'm going to render");

            Mermaid.render('graphDiv', graphDefinition).then((result: any) => {
                const svg = result.svg ?? result;
                const bindFunctions = result.bindFunctions ?? result?.bindFunctions;
                container.innerHTML = svg;
                if (typeof bindFunctions === 'function') {
                    bindFunctions(container);
                }
            }).catch((err: any) => {
                console.error('Mermaid render failed:', err);
                
                // On render failure fallback to showing original text as markdown code
                const fallbackMd = '```mermaid\n' + graphDefinition + '\n```';
                const parsed = reader.parse(fallbackMd);
                const html = writer.render(parsed);
                container.innerHTML = html;
            });
        }
    }
}