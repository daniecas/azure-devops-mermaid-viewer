# AGENTS.md

## Project Overview

This repository contains an Azure DevOps extension named **Mermaid Viewer**. It adds a rendered preview for Mermaid diagrams in Azure Repos, mainly for `.mmd` and `.md` files.

The extension is a TypeScript/Webpack app that runs inside the Azure DevOps extension host and registers the `mermaid_viewer` content renderer.

## Important Files

- `src/index.ts` - Extension entry point. Initializes the Azure DevOps SDK, initializes Mermaid, registers `mermaid_viewer`, and notifies the host that loading succeeded.
- `src/viewer.ts` - Main renderer implementation. Converts Markdown with Mermaid code blocks, renders raw Mermaid diagrams, falls back to Markdown on parse/render failures, and requests host iframe resizing.
- `index.html` - HTML template used by Webpack and loaded by the Azure DevOps contribution.
- `webpack.config.js` - Build configuration. Copies markdown CSS assets, bundles TypeScript, and configures the HTTPS dev server on `localhost:44300`.
- `vss-extension.json` - Base Azure DevOps Marketplace extension manifest.
- `configs/dev.json` - Development manifest overrides. Uses `https://localhost:44300` and includes dev-only settings.
- `configs/release.json` - Production manifest overrides. Points the contribution URI at `dist/index.html`.
- `src/test/test.ts` and files under `src/test/` - Lightweight manual render fixtures.
- `doc/` - Marketplace/readme images and extension overview content.

## Build And Run Commands

- Install dependencies: `npm install`
- Production build: `npm run build`
- Development build: `npm run build:dev`
- Watch build: `npm run watch`
- Local dev server: `npm run serve`
- Create a development VSIX: `npx tfx-cli extension create --rev-version --overrides-file configs/dev.json`
- Create a production VSIX: `npx tfx-cli extension create --rev-version --env mode=production --overrides-file configs/release.json`

There is currently no real automated test suite. `npm test` is a placeholder that exits with an error.

## Runtime Behavior

- Mermaid is initialized with `securityLevel: 'loose'` and `startOnLoad: false`.
- Markdown content is parsed with `commonmark`.
- Markdown Mermaid blocks using fenced code blocks are supported:

  ````markdown
  ```mermaid
  sequenceDiagram
      Alice ->> Bob: Hello
  ```
  ````

- The viewer also normalizes Azure DevOps-style `:::mermaid ... :::` blocks into fenced Mermaid blocks.
- If raw content does not contain backticks, the renderer treats it as a raw Mermaid diagram first.
- If Mermaid parsing or rendering fails, the viewer falls back to rendering the original content as Markdown.
- After rendering, the viewer calls `SDK.resize(width, height)` when hosted in an iframe so Azure DevOps can size the preview correctly.

## Contribution Registration

The Azure DevOps contribution type is `ms.vss-code-web.content-renderer`.

The contribution property `registeredObjectId` must match the object registered in `src/index.ts`:

```ts
SDK.register("mermaid_viewer", ...)
```

Be careful when changing either value, because mismatches will prevent Azure DevOps from finding the renderer.

## Development Notes

- Prefer small, focused changes. This project is compact and most behavior lives in `src/viewer.ts`.
- Keep package and manifest changes intentional. VSIX files are generated artifacts and should not be edited manually.
- Do not assume `dist/` is current after source edits; run a build when verifying packaged output.
- Avoid broad refactors unless they directly support the requested behavior.
- If changing rendering behavior, test both raw `.mmd` content and Markdown files containing Mermaid blocks.
- If changing iframe sizing, verify content in Azure DevOps or the local hosted extension flow, because normal browser rendering may not expose host-frame issues.

## Packaging Notes

Development packages use `configs/dev.json`, which sets:

- extension id: `azure-devops-mermaid-viewer-dev`
- base URI: `https://localhost:44300`
- contribution URI: `index.html`

Production packages use `configs/release.json`, which sets:

- contribution URI: `dist/index.html`
- file extensions: `mmd`, `md`

## Style Notes

- Existing code uses TypeScript with simple classes and direct DOM APIs.
- Match the current style unless making a deliberate cleanup.
- Keep comments concise and useful.
- Prefer explicit error handling around Azure DevOps SDK calls, since the renderer may run in different host contexts.
