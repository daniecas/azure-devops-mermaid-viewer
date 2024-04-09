import { Parser, HtmlRenderer } from "commonmark"
import Mermaid from "mermaid";

const markdownMermaidViewer = (function () {
	"use strict";
	return {
		renderContent: function (rawContent, options) {

			var reader = new Parser();
			var writer = new HtmlRenderer();

            var container = document.getElementById('viewer-content-display');

            var rawContentCleaned = rawContent.replaceAll(':::','```')

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
	};
}());

export default markdownMermaidViewer