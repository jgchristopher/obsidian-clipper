import { describe, expect, it } from 'vitest';
import { FakeApp, tfile } from '../test/fakes/fakeapp';
import { clipper } from '../test/fakes/clippers';
import { CANVAS_GAP, CLIP_SIZE, CanvasEntry, DOMAIN_SIZE } from './canvasentry';
import { ClippedData } from './clippeddata';

type Node = {
	id: string;
	type: string;
	text?: string;
	x: number;
	y: number;
	width: number;
	height: number;
	createdBy?: string;
	[key: string]: unknown;
};
type Edge = {
	id: string;
	fromNode: string;
	toNode: string;
	fromSide: string;
	toSide: string;
};
type Canvas = { nodes: Node[]; edges: Edge[] };

const CANVAS = 'board.canvas';

async function clip(fake: FakeApp, url: string, content = 'clipped text') {
	const data = new ClippedData(
		'T',
		url,
		clipper({ type: 'canvas' }),
		fake.app,
		content
	);
	await new CanvasEntry(fake.app).writeToCanvas(tfile(CANVAS), data);
	return JSON.parse(fake.read(CANVAS) ?? '') as Canvas;
}

function canvasWith(nodes: Node[], edges: Edge[] = []) {
	return new FakeApp({ [CANVAS]: JSON.stringify({ nodes, edges }) });
}

function byText(canvas: Canvas, text: string) {
	return canvas.nodes.filter((n) => n.text === text);
}

function clipNodeFor(canvas: Canvas, content: string) {
	const [node] = canvas.nodes.filter((n) => n.text?.startsWith(content));
	return node;
}

function overlaps(a: Node, b: Node) {
	return (
		a.x < b.x + b.width &&
		b.x < a.x + a.width &&
		a.y < b.y + b.height &&
		b.y < a.y + a.height
	);
}

const textNode = (id: string, x: number, y: number, extra = {}): Node => ({
	id,
	type: 'text',
	text: id,
	x,
	y,
	width: 200,
	height: 100,
	...extra,
});

describe('CanvasEntry.writeToCanvas', () => {
	it('adds a domain node, a clip node, and an edge to an empty canvas', async () => {
		const canvas = await clip(
			new FakeApp({ [CANVAS]: '' }),
			'https://www.ex.com/a'
		);

		expect(canvas.nodes).toHaveLength(2);
		const [domain] = byText(canvas, 'www.ex.com');
		const [clipNode] = byText(
			canvas,
			'clipped text\n[^1]\n\n[^1](https://www.ex.com/a)'
		);
		expect(domain).toBeDefined();
		expect(clipNode).toBeDefined();

		expect(canvas.edges).toEqual([
			expect.objectContaining({
				fromNode: clipNode.id,
				fromSide: 'top',
				toNode: domain.id,
				toSide: 'bottom',
			}),
		]);
	});

	it('starts an empty canvas at the origin with the clip below the domain', async () => {
		const canvas = await clip(new FakeApp({ [CANVAS]: '' }), 'https://ex.com');
		const [domain] = byText(canvas, 'ex.com');
		const clipNode = clipNodeFor(canvas, 'clipped text');
		expect(domain).toMatchObject({ x: 0, y: 0, ...DOMAIN_SIZE });
		expect(clipNode).toMatchObject({
			x: 0,
			y: DOMAIN_SIZE.height + CANVAS_GAP,
			...CLIP_SIZE,
		});
	});

	it('tags the nodes it creates with createdBy', async () => {
		const canvas = await clip(new FakeApp({ [CANVAS]: '' }), 'https://ex.com');
		expect(canvas.nodes.every((n) => n.createdBy === 'obsidian-clipper')).toBe(
			true
		);
	});

	it('places a second clip from the same site below the first, in the domain column', async () => {
		const fake = new FakeApp({ [CANVAS]: '' });
		await clip(fake, 'https://ex.com/1', 'first');
		const canvas = await clip(fake, 'https://ex.com/2', 'second');

		const [domain] = byText(canvas, 'ex.com');
		const first = clipNodeFor(canvas, 'first');
		const second = clipNodeFor(canvas, 'second');
		expect(byText(canvas, 'ex.com')).toHaveLength(1);
		expect(canvas.nodes).toHaveLength(3);
		expect(canvas.edges.every((e) => e.toNode === domain.id)).toBe(true);
		expect(second.x).toBe(domain.x);
		expect(second.y).toBe(first.y + first.height + CANVAS_GAP);
	});

	it('places a new site to the right of all content, level with the topmost node', async () => {
		const fake = canvasWith([
			textNode('left', -500, 300),
			textNode('top', 0, -200),
			textNode('right', 800, 100, { width: 300 }),
		]);
		const canvas = await clip(fake, 'https://b.com');
		const [domain] = byText(canvas, 'b.com');
		expect(domain.x).toBe(800 + 300 + CANVAS_GAP);
		expect(domain.y).toBe(-200);
		expect(clipNodeFor(canvas, 'clipped text')).toMatchObject({
			x: domain.x,
			y: domain.y + DOMAIN_SIZE.height + CANVAS_GAP,
		});
	});

	it('leaves every existing node and edge exactly as it was', async () => {
		const existing: Node[] = [
			textNode('note', 0, 0, { color: '4' }),
			{
				id: 'file',
				type: 'file',
				file: 'Topics/Rust.md',
				x: 300,
				y: 0,
				width: 400,
				height: 300,
			},
			{
				id: 'link',
				type: 'link',
				url: 'https://obsidian.md',
				x: 0,
				y: 400,
				width: 400,
				height: 300,
			},
			{
				id: 'group',
				type: 'group',
				label: 'Group',
				x: -50,
				y: -50,
				width: 900,
				height: 800,
			},
		];
		const edges: Edge[] = [
			{
				id: 'e1',
				fromNode: 'note',
				fromSide: 'right',
				toNode: 'file',
				toSide: 'left',
			},
		];
		const canvas = await clip(
			canvasWith(structuredClone(existing), structuredClone(edges)),
			'https://ex.com'
		);
		expect(canvas.nodes.slice(0, existing.length)).toEqual(existing);
		expect(canvas.edges.slice(0, edges.length)).toEqual(edges);
		expect(canvas.nodes).toHaveLength(existing.length + 2);
	});

	it('follows a domain node the user moved', async () => {
		const domain = textNode('ex.com', 1000, 500, { ...DOMAIN_SIZE });
		const canvas = await clip(canvasWith([domain]), 'https://ex.com');
		expect(clipNodeFor(canvas, 'clipped text')).toMatchObject({
			x: 1000,
			y: 500 + DOMAIN_SIZE.height + CANVAS_GAP,
		});
	});

	it('stays below the domain node even when older clips sit above it', async () => {
		const domain = textNode('ex.com', 0, 1000, { ...DOMAIN_SIZE });
		const oldClip = textNode('old', 0, 0);
		const canvas = await clip(
			canvasWith(
				[domain, oldClip],
				[
					{
						id: 'e',
						fromNode: 'old',
						fromSide: 'top',
						toNode: 'ex.com',
						toSide: 'bottom',
					},
				]
			),
			'https://ex.com'
		);
		expect(clipNodeFor(canvas, 'clipped text').y).toBe(
			1000 + DOMAIN_SIZE.height + CANVAS_GAP
		);
	});

	it('moves down past a node that is in the way', async () => {
		const domain = textNode('ex.com', 0, 0, { ...DOMAIN_SIZE });
		const blocker = textNode('blocker', 100, 60, { height: 200 });
		const canvas = await clip(canvasWith([domain, blocker]), 'https://ex.com');
		const clipNode = clipNodeFor(canvas, 'clipped text');
		expect(clipNode.y).toBe(60 + 200 + CANVAS_GAP);
		for (const node of canvas.nodes.filter((n) => n !== clipNode)) {
			expect(overlaps(clipNode, node)).toBe(false);
		}
	});

	it('stays inside a group that contains the domain node', async () => {
		const group: Node = {
			id: 'group',
			type: 'group',
			x: -100,
			y: -100,
			width: 1000,
			height: 1000,
		};
		const domain = textNode('ex.com', 0, 0, { ...DOMAIN_SIZE });
		const canvas = await clip(canvasWith([group, domain]), 'https://ex.com');
		expect(clipNodeFor(canvas, 'clipped text').y).toBe(
			DOMAIN_SIZE.height + CANVAS_GAP
		);
	});

	it('only matches text nodes when looking for the domain node', async () => {
		const file: Node = {
			id: 'file',
			type: 'file',
			file: 'ex.com',
			text: 'ex.com',
			x: 0,
			y: 0,
			width: 400,
			height: 300,
		};
		const canvas = await clip(canvasWith([file]), 'https://ex.com');
		expect(canvas.nodes.filter((n) => n.type === 'text')).toHaveLength(2);
	});

	it('requires clipped content', async () => {
		const fake = new FakeApp({ [CANVAS]: '' });
		const data = new ClippedData('T', 'https://ex.com', clipper(), fake.app);
		await expect(
			new CanvasEntry(fake.app).writeToCanvas(tfile(CANVAS), data)
		).rejects.toThrow('Value is null');
	});
});
