import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeApp, tfile } from '../test/fakes/fakeapp';
import { clipper } from '../test/fakes/clippers';
import { CanvasEntry } from './canvasentry';
import { ClippedData } from './clippeddata';

type Node = {
	id: string;
	type: string;
	text: string;
	x: number;
	y: number;
	width: number;
	height: number;
	createdBy?: string;
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

function byText(canvas: Canvas, text: string) {
	return canvas.nodes.filter((n) => n.text === text);
}

describe('CanvasEntry.writeToCanvas', () => {
	beforeEach(() => {
		// writeToCanvas logs every laid-out node.
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
	});

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

	it('lays out every node with numeric coordinates and keeps clip size', async () => {
		const canvas = await clip(new FakeApp({ [CANVAS]: '' }), 'https://ex.com');
		for (const node of canvas.nodes) {
			expect(node.type).toBe('text');
			expect(Number.isFinite(node.x)).toBe(true);
			expect(Number.isFinite(node.y)).toBe(true);
		}
		const [clipNode] = canvas.nodes.filter((n) => n.text !== 'ex.com');
		expect(clipNode).toMatchObject({ width: 600, height: 400 });
		const [domain] = byText(canvas, 'ex.com');
		expect(domain).toMatchObject({ width: 240, height: 50 });
	});

	it('places the domain node above the clips linked to it', async () => {
		const fake = new FakeApp({ [CANVAS]: '' });
		await clip(fake, 'https://ex.com/1', 'first');
		const canvas = await clip(fake, 'https://ex.com/2', 'second');
		const [domain] = byText(canvas, 'ex.com');
		for (const node of canvas.nodes.filter((n) => n !== domain)) {
			expect(domain.y).toBeLessThan(node.y);
		}
	});

	// Current behavior: re-layout rebuilds nodes and drops the createdBy tag.
	it('does not keep createdBy after layout', async () => {
		const canvas = await clip(new FakeApp({ [CANVAS]: '' }), 'https://ex.com');
		expect(canvas.nodes.every((n) => n.createdBy === undefined)).toBe(true);
	});

	it('reuses the domain node for a second clip from the same site', async () => {
		const fake = new FakeApp({ [CANVAS]: '' });
		await clip(fake, 'https://ex.com/1', 'first');
		const canvas = await clip(fake, 'https://ex.com/2', 'second');

		expect(byText(canvas, 'ex.com')).toHaveLength(1);
		expect(canvas.nodes).toHaveLength(3);
		expect(canvas.edges).toHaveLength(2);
		const domainId = byText(canvas, 'ex.com')[0].id;
		expect(canvas.edges.every((e) => e.toNode === domainId)).toBe(true);
	});

	it('adds a new domain node for a different site', async () => {
		const fake = new FakeApp({ [CANVAS]: '' });
		await clip(fake, 'https://a.com', 'first');
		const canvas = await clip(fake, 'https://b.com', 'second');
		expect(byText(canvas, 'a.com')).toHaveLength(1);
		expect(byText(canvas, 'b.com')).toHaveLength(1);
		expect(canvas.nodes).toHaveLength(4);
	});

	it('requires clipped content', async () => {
		const fake = new FakeApp({ [CANVAS]: '' });
		const data = new ClippedData('T', 'https://ex.com', clipper(), fake.app);
		await expect(
			new CanvasEntry(fake.app).writeToCanvas(tfile(CANVAS), data)
		).rejects.toThrow('Value is null');
	});

	// Current behavior: every node is rebuilt as a text node from its `text`,
	// so a canvas holding a file node (no text) fails.
	it('fails on a canvas that contains a non-text node', async () => {
		const fake = new FakeApp({
			[CANVAS]: JSON.stringify({
				nodes: [
					{
						id: 'f1',
						type: 'file',
						file: 'a.md',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
					},
				],
				edges: [],
			}),
		});
		const data = new ClippedData(
			'T',
			'https://ex.com',
			clipper(),
			fake.app,
			'x'
		);
		await expect(
			new CanvasEntry(fake.app).writeToCanvas(tfile(CANVAS), data)
		).rejects.toThrow('Value is null');
	});
});
