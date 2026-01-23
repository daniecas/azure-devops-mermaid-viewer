import { Parser, HtmlRenderer } from "commonmark"
import Mermaid from "mermaid";
import * as SDK from 'azure-devops-extension-sdk';

export default class MermaidViewer {

    private _resizeObserverInited: boolean = false;

    private requestResize() {
        try {
            // If Azure DevOps SDK is available, use it to resize the parent frame
            if (SDK && typeof (SDK.resize) === 'function') {
                // Try to set a height large enough; SDK.resize will clamp as needed
                SDK.resize(800, 1200);
                return;
            }
        }
        catch (_) {}

        // Fallback: post a message to parent to request resize (host can listen)
        try {
            const height = document.body.scrollHeight || document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'resize', height }, '*');
        } catch (_) {}

        // Setup a MutationObserver once so we notify on content changes
        if (!this._resizeObserverInited) {
            try {
                const observer = new MutationObserver(() => {
                    try {
                        const h = document.body.scrollHeight || document.documentElement.scrollHeight;
                        window.parent.postMessage({ type: 'resize', height: h }, '*');
                    } catch (_) {}
                });
                observer.observe(document.getElementById('viewer-content-display') || document.body, { childList: true, subtree: true, characterData: true });
                this._resizeObserverInited = true;
            } catch (_) {}
        }
    }

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
                console.warn("parse error, maybe the syntax is invalid or not contains a mermaid diagram", err, hash);
                // On parse failure: render the original text as markdown so headers and formatting show
                const parsed = reader.parse(graphDefinition);
                const html = writer.render(parsed);
                // apply markdown styling
                container.classList.add('markdown-body');
                container.innerHTML = html;
                // request host to resize the frame so content is fully visible
                //this.requestResize();
                // remove the style applied to body, I don't want it in fallback case
                try { const bodyViewer = document.getElementById('body-viewer'); if (bodyViewer) (bodyViewer as HTMLElement).removeAttribute('style'); } catch(_){}
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

                // On render failure: render the original text as markdown so headers and formatting show
                const parsed = reader.parse(graphDefinition);
                const html = writer.render(parsed);
                // apply markdown styling
                container.classList.add('markdown-body');
                container.innerHTML = html;
                // request host to resize the frame so content is fully visible
                this.requestResize();
                // remove the style applied to body, I don't want it in fallback case
                try { const bodyViewer = document.getElementById('body-viewer'); if (bodyViewer) (bodyViewer as HTMLElement).removeAttribute('style'); } catch(_){}
            });
        }
    }
}