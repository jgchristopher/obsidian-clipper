import { randomUUID } from 'crypto';
import type { App, TFile } from 'obsidian';
import type {
	AllCanvasNodeData,
	CanvasData,
	CanvasNodeData,
	CanvasTextData,
} from 'obsidian/canvas';
import type { ClippedData } from './clippeddata';
import { Utility } from './utils/utility';

export class CanvasEntry {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}
	public async writeToCanvas(file: TFile, noteEntry: ClippedData) {
		const content = noteEntry.getEntryContent();
		Utility.assertNotNull(content);
		const fileData = await this.app.vault.read(file);
		const canvasData: CanvasData = JSON.parse(fileData);
		debugger;
		console.log(canvasData);
		const newNode: CanvasTextData = {
			id: randomUUID(),
			type: 'text',
			text: content,
			x: -1300,
			y: -800,
			width: 300,
			height: 500,
			createdBy: 'obsidian-clipper',
		};

		canvasData.nodes.push(newNode);
		await this.app.vault.modify(file, JSON.stringify(canvasData));
		await new Promise((r) => setTimeout(r, 50));
	}

	private findDomainNodeOrCreate(nodes: AllCanvasNodeData[], domain: string) {
		let domainNode = nodes.find((node) => node.text === domain);
		if (!domainNode) {
			domainNode = this.createTextNode(nodes, domain);
		}
		return domainNode;
	}

	private createTextNode(
		nodes: AllCanvasNodeData[],
		content: string
	): CanvasTextData {
		return {
			id: randomUUID(),
			type: 'text',
			text: content,
			x: -1300,
			y: -800,
			width: 300,
			height: 100,
			createdBy: 'obsidian-clipper',
		};
	}
}
