# Mermaid Viewer

Get a preview of your [mermaid](https://mermaid-js.github.io/mermaid/) diagrams in the Azure DevOps Repo.

This extension currently works with `.mmd` and `.md` files.

## Usage

Install this extension to your Azure DevOps Organization.

Go to Repos:
- in Files: if you select a Mermaid (`.mmd` or `.md`) file you can find a new Preview tab
  
  ![Code: Preview Diagram](./doc/code_preview_diagram.png)

- in Pull Requests: if you select a Mermaid (`.mmd` or `.md`) file you can find a Raw Content/Preview toggle button
  
  ![Pull Request: Preview Diagram](./doc/pr_preview_diagram.png)


note: in `.md` extension you need to use  `:::mermaid` convention to avoid conflicts with markdown statements, you can find an example in src/test/markdown-test.md Mermaid Diagram 2

The extension is based on Mermaid 11.8.0 version, so potentially breaking changes will not affect your stable features (unfortunately this is happened with others extensions) 

## Feedback

Please let me know how the extension can be improved! Contributions are also welcome!

- Create an issue in [GitHub](https://github.com/daniecas/azure-devops-mermaid-viewer/issues)


<br/><br/>
<a href="https://www.flaticon.com/free-icons/mermaid" title="mermaid icons">Mermaid icons created by Freepik - Flaticon</a>
