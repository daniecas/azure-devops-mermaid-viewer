import * as SDK from "azure-devops-extension-sdk";
import Mermaid from "mermaid";
import MermaidViewer from './viewer'
import test from './test/test'

console.log("loading...");

const isTest = false;
const isProduction = process.env.NODE_ENV == 'production'

if (!isTest)
{

    await (async function() : Promise<void> {

        SDK.init({ loaded: false })
        Mermaid.initialize({ startOnLoad: false });

        await SDK.ready();

        console.log("start");

        SDK.register("mermaid_viewer", function (context) {
            console.log(context);

            const mermaidViewer = new MermaidViewer();
            return mermaidViewer;
        });

        SDK.notifyLoadSucceeded();

    }());
}
else
    test.render();
