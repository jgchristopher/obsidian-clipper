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

export const CANVAS_GAP = 40;
export const DOMAIN_SIZE = { width: 240, height: 50 };
export const CLIP_SIZE = { width: 600, height: 400 };

type Rect = Pick<CanvasNodeData, 'x' | 'y' | 'width' | 'height'>;

const bottom = (r: Rect) => r.y + r.height;
const right = (r: Rect) => r.x + r.width;

/**
 * Adds a clip to a canvas as a text node linked to a node for its site
 * (domain). Only the new nodes are positioned; existing nodes are written
 * back exactly as read, since there is no way to tell which positions the
 * user chose.
 */
export class CanvasEntry {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	public async writeToCanvas(file: TFile, noteEntry: ClippedData) {
		const content = noteEntry.getEntryContent();
		Utility.assertNotNull(content);
		const fileData = await this.app.vault.read(file);
		const canvasData: CanvasData =
			fileData === ''
				? { nodes: [], edges: [] }
				: (JSON.parse(fileData) as CanvasData);
		canvasData.nodes ??= [];
		canvasData.edges ??= [];

		const domain = Utility.parseDomainFromUrl(noteEntry.getUrl());
		const domainNode =
			this.findDomainNode(canvasData, domain) ??
			this.addDomainNode(canvasData, domain);

		const clipNode = this.textNode(
			`${content}\n[^1]\n\n[^1](${noteEntry.getUrl()})`,
			this.clipPosition(canvasData, domainNode),
			CLIP_SIZE
		);
		canvasData.nodes.push(clipNode);
		canvasData.edges.push(this.edge(clipNode, domainNode));

		await this.app.vault.modify(file, JSON.stringify(canvasData));
		await new Promise((r) => window.setTimeout(r, 50));
	}

	private findDomainNode(
		canvasData: CanvasData,
		domain: string
	): CanvasTextData | undefined {
		return canvasData.nodes.find(
			(node): node is CanvasTextData =>
				node.type === 'text' && node.text === domain
		);
	}

	/** A new site goes right of all content, level with the topmost node. */
	private addDomainNode(canvasData: CanvasData, domain: string) {
		const { nodes } = canvasData;
		const position = nodes.length
			? {
					x: Math.max(...nodes.map(right)) + CANVAS_GAP,
					y: Math.min(...nodes.map((n) => n.y)),
			  }
			: { x: 0, y: 0 };
		const node = this.textNode(domain, position, DOMAIN_SIZE);
		nodes.push(node);
		return node;
	}

	/**
	 * Below the domain node or its lowest linked clip, whichever is lower, in
	 * the domain node's column. Moves further down past anything in the way.
	 */
	private clipPosition(canvasData: CanvasData, domainNode: CanvasTextData) {
		const linkedIds = new Set(
			canvasData.edges
				.filter((edge) => edge.toNode === domainNode.id)
				.map((edge) => edge.fromNode)
		);
		const column = [
			domainNode,
			...canvasData.nodes.filter((node) => linkedIds.has(node.id)),
		];
		const rect: Rect = {
			x: domainNode.x,
			y: Math.max(...column.map(bottom)) + CANVAS_GAP,
			...CLIP_SIZE,
		};

		// A group the domain node sits in is its background, not an obstacle.
		const obstacles = canvasData.nodes.filter(
			(node) => !(node.type === 'group' && contains(node, domainNode))
		);
		let blocker = obstacles.find((node) => overlaps(rect, node));
		while (blocker) {
			rect.y = bottom(blocker) + CANVAS_GAP;
			blocker = obstacles.find((node) => overlaps(rect, node));
		}
		return { x: rect.x, y: rect.y };
	}

	private textNode(
		text: string,
		position: { x: number; y: number },
		size: { width: number; height: number }
	): CanvasTextData {
		return {
			id: crypto.randomUUID(),
			type: 'text',
			text,
			...position,
			...size,
			createdBy: 'obsidian-clipper',
		};
	}

	private edge(from: CanvasNodeData, to: CanvasNodeData): CanvasEdgeData {
		return {
			id: crypto.randomUUID(),
			fromNode: from.id,
			fromSide: 'top',
			toNode: to.id,
			toSide: 'bottom',
		};
	}
}

function overlaps(a: Rect, b: AllCanvasNodeData) {
	return a.x < right(b) && b.x < right(a) && a.y < bottom(b) && b.y < bottom(a);
}

function contains(outer: Rect, inner: Rect) {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		right(inner) <= right(outer) &&
		bottom(inner) <= bottom(outer)
	);
}
