//import testmd from './markdown-test.md'
//import test_md from './markdown-test'
import MermaidViewer from '../viewer'

export default {
	render: function () {
        const mermaidViewer = new MermaidViewer();
		mermaidViewer.renderContent(testmd, null);
	}
}


const testmd = 
`## Mermaid Diagram 1

\`\`\`mermaid
sequenceDiagram
    Alice ->> Bob: Hello Bob, how are you?
    Bob-->Alice: Hi!
\`\`\`

## Mermaid Diagram 2

:::mermaid
sequenceDiagram
    Alice ->> Bob: Hello Bob, how are you?
    Bob-->Alice: Hi!
:::

## Mermaid Diagram 3

:::mermaid
sequenceDiagram
    Alice ->> Bob: Hello Bob, how are you?
    Bob-->Alice: Hi!
:::`

const testmmd =  
`sequenceDiagram
Alice ->> Bob: Hello Bob, how are you?
Bob-->Alice: Hi! `