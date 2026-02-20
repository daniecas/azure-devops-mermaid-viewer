import { Parser, HtmlRenderer } from "commonmark"
import Mermaid from "mermaid";
import * as SDK from 'azure-devops-extension-sdk';

export default class MermaidViewer {

    private _autoResizeInited: boolean = false;
    private _resizePending: boolean = false;
    private _renderId = 0;

    public async renderContent(rawContent : string, options) {

        const renderId = ++this._renderId;

        var reader = new Parser();
        var writer = new HtmlRenderer();

        console.log("rawContent");
        console.log(rawContent);

        var container = document.getElementById('viewer-content-display');
        if (!container) {
            throw new Error("Missing #viewer-content-display container");
        }

        this.initAutoResize(container);

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

            try {
                // Mermaid.run can be async depending on version
                const runResult: any = Mermaid.run();
                if (runResult && typeof runResult.then === 'function') {
                    await runResult;
                }
            } finally {
                this.requestResize(container);
            }
        }
        else
        {
            //console.log("ready to render raw mermaid");

            var graphDefinition = rawContent;

            const previousParseError = Mermaid.parseError;

            Mermaid.parseError = (err, hash) => {
                console.warn("parse error, maybe the syntax is invalid or not contains a mermaid diagram", err, hash);
                this.renderMarkdownFallback(container, graphDefinition);
            };

            // validate diagram before rendering
            try {
                await Mermaid.parse(graphDefinition);
            } finally {
                Mermaid.parseError = previousParseError;
            }

            //console.log("I'm going to render");

            Mermaid.render('graphDiv', graphDefinition).then((result: any) => {
                
                // avoid race conditions between multiple renders
                if (renderId !== this._renderId) return;
                
                const svg = result.svg ?? result;
                const bindFunctions = result.bindFunctions ?? result?.bindFunctions;
                container.innerHTML = svg;
                if (typeof bindFunctions === 'function') {
                    bindFunctions(container);
                }
                this.requestResize(container);
            }).catch((err: any) => {
                console.error('Mermaid render failed:', err);

                if (renderId !== this._renderId) return;

                this.renderMarkdownFallback(container, graphDefinition);
            });
        }

        // Also resize once at the end of renderContent.
        this.requestResize(container);
    }

    private requestResize(container?: HTMLElement | null) {

        if (this._resizePending) return;
        this._resizePending = true;

        const doResize = () => {
            this._resizePending = false;

            const target = container || document.getElementById('viewer-content-display') || document.body;
            const docEl = document.documentElement;

            const width = Math.max(
                docEl?.scrollWidth ?? 0,
                docEl?.clientWidth ?? 0,
                target?.scrollWidth ?? 0,
                target?.clientWidth ?? 0,
                1,
            );

            const height = Math.max(
                docEl?.scrollHeight ?? 0,
                docEl?.clientHeight ?? 0,
                target?.scrollHeight ?? 0,
                target?.clientHeight ?? 0,
                1,
            );

            try {
                if (SDK && typeof (SDK.resize) === 'function') {

                    if (window.parent !== window)
                        SDK.resize(width, height);
                }
            } catch (_) { }
        };

        // Wait a tick so layout/SVG sizes settle.
        try {
            requestAnimationFrame(() => setTimeout(doResize, 0));
        } catch (_) {
            setTimeout(doResize, 0);
        }
    }

    private initAutoResize(container: HTMLElement) {
        if (this._autoResizeInited) return;
        this._autoResizeInited = true;

        try {
            //const mutationObserver = new MutationObserver(() => this.requestResize(container));
            let lastResize = 0;

            const mutationObserver = new MutationObserver(() => {
                const now = Date.now();
                if (now - lastResize > 100) {
                    lastResize = now;
                    this.requestResize(container);
                }
            });
                        
            mutationObserver.observe(container, { childList: true, subtree: true, characterData: true, attributes: true });
        } catch (_) { }

        // First sizing once the page is fully loaded.
        try {
            window.addEventListener('load', () => this.requestResize(container));
        } catch (_) { }
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

    private renderMarkdownFallback(
        container: HTMLElement,
        content: string ) {
        const reader = new Parser();
        const writer = new HtmlRenderer();

        const parsed = reader.parse(content);
        const html = writer.render(parsed);

        container.classList.add('markdown-body');
        container.innerHTML = html;
        this.requestResize(container);

        try {
            const bodyViewer = document.getElementById('body-viewer');
            bodyViewer?.removeAttribute('style');
        } catch (_) {}
    }
}