import { randomUUID } from 'crypto';
import dagre from '@dagrejs/dagre';
import type { App, TFile } from 'obsidian';
import type {
	AllCanvasNodeData,
	CanvasData,
	CanvasEdgeData,
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

		const newNode = this.createTextNode(
			canvasData.nodes,
			`${content}\n[^1]\n\n[^1](${noteEntry.getUrl()})`,
			{
				width: 600,
				height: 400,
			}
		);
		const domainNode = this.findDomainNodeOrCreate(
			canvasData,
			Utility.parseDomainFromUrl(noteEntry.getUrl())
		);

		canvasData.nodes.push(newNode);
		this.linkNewNodeToDomainNode(canvasData, domainNode, newNode);

		const layout = this.processWithDagre(canvasData);
		const nodesWithLayout: CanvasTextData[] = [];
		layout.nodes().forEach((element) => {
			const nodeData = layout.node(element);
			console.log(nodeData);
			const label = nodeData.label;
			Utility.assertNotNull(label);
			nodesWithLayout.push({
				id: element,
				type: 'text',
				text: label,
				width: nodeData.width,
				height: nodeData.height,
				x: nodeData.x,
				y: nodeData.y,
			});
		});

		canvasData.nodes = nodesWithLayout;

		await this.app.vault.modify(file, JSON.stringify(canvasData));
		await new Promise((r) => setTimeout(r, 50));
	}

	private findDomainNodeOrCreate(canvasData: CanvasData, domain: string) {
		let domainNode = canvasData.nodes.find((node) => node.text === domain);
		if (!domainNode) {
			domainNode = this.createTextNode(canvasData.nodes, domain);
			canvasData.nodes.push(domainNode);
		}
		return domainNode;
	}

	private createTextNode(
		nodes: AllCanvasNodeData[],
		content: string,
		options = { width: 240, height: 50 }
	): CanvasTextData {
		const { x, y } = this.getPositionCoordinatesForNewNode(nodes);

		return {
			id: randomUUID(),
			type: 'text',
			text: content,
			x,
			y,
			width: options.width,
			height: options.height,
			createdBy: 'obsidian-clipper',
		};
	}

	private getPositionCoordinatesForNewNode(nodes: AllCanvasNodeData[]) {
		return { x: -1300, y: -800 };
	}

	private linkNewNodeToDomainNode(
		canvasData: CanvasData,
		domainNode: CanvasNodeData,
		newNode: CanvasNodeData
	) {
		const edge: CanvasEdgeData = {
			id: randomUUID(),
			fromNode: newNode.id,
			fromSide: 'top',
			toNode: domainNode.id,
			toSide: 'bottom',
		};
		canvasData.edges.push(edge);
	}

	private processWithDagre(canvasData: CanvasData) {
		const g = new dagre.graphlib.Graph({ directed: true, multigraph: true });
		g.setGraph({});
		g.setDefaultEdgeLabel(function () {
			return {};
		});

		canvasData.nodes.forEach((node) => {
			g.setNode(node.id, {
				label: node.text,
				width: node.width,
				height: node.height,
				createdBy: node.createdBy,
				type: node.type,
				x: node.x,
				y: node.y,
			});
		});

		canvasData.edges.forEach((edge) => {
			g.setEdge(edge.toNode, edge.fromNode);
		});

		dagre.layout(g, { rankdir: 'lr', align: 'dr', ranker: 'tight-tree' });
		return g;
	}
}
