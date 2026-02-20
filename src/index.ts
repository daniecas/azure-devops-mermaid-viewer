import * as SDK from "azure-devops-extension-sdk";
import Mermaid from "mermaid";
import MermaidViewer from "./viewer";
import test from "./test/test";
// CSS for markdown styling is now included via <link> in index.html 

console.log("loading...");

const isTest = false;
const isProduction = process.env.NODE_ENV === "production";

if (!isTest) {
    bootstrap();
} else {
    test.render();
}

async function bootstrap(): Promise<void> {
    try {
        SDK.init({ loaded: false });

        // Mermaid is NOT dependent on ADO auth — initialize early
        Mermaid.initialize({
            securityLevel: "loose",
            startOnLoad: false
        });

        // Protect against auth / MeProxy issues
        await withTimeout(SDK.ready(), 8000);

        console.log("SDK ready");

        SDK.register("mermaid_viewer", context => {
            console.log("register context:", context);
            return new MermaidViewer();
        });

    } catch (err) {
        console.error("Extension bootstrap failed:", err);

        /**
         * IMPORTANT:
         * We still notify success so the host doesn't keep retrying.
         * Your viewer can render an error UI if needed.
         */
    } finally {
        SDK.notifyLoadSucceeded();
        console.log("notifyLoadSucceeded");
    }
}

/**
 * Utility: timeout wrapper
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Timeout after ${ms}ms`));
        }, ms);

        promise.then(
            value => {
                clearTimeout(timer);
                resolve(value);
            },
            err => {
                clearTimeout(timer);
                reject(err);
            }
        );
    });
}