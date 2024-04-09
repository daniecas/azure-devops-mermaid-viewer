import * as SDK from "azure-devops-extension-sdk";
import Mermaid from "mermaid";
import markdownMermaidViewer from './viewer'
import test from './test/test'

console.log("loading...");

const isProduction = process.env.NODE_ENV == 'production'

if (isProduction)
{

    await (async function() : Promise<void> {

        SDK.init({ loaded: false })
        Mermaid.initialize({ startOnLoad: false });

        await SDK.ready();

        console.log("start");

        SDK.register("mermaid_viewer", function (context) {
            //return mermaidViewer;
            return markdownMermaidViewer;
        });

        SDK.notifyLoadSucceeded();


        var mermaidViewer = (function () {
            "use strict";
            return {
                renderContent: function(rawContent, options) {
                    var rendered = document.getElementById('viewer-content-display');

                    var graphDefinition = rawContent;
                    Mermaid.mermaidAPI.render('graphDiv', graphDefinition).then(({ svg, bindFunctions }) => {
                        rendered.innerHTML = svg;
                        bindFunctions?.(rendered);
                    });
                }
            };
        }());

    }());
}
else
    test.render();
