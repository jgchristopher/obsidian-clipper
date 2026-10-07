import type { App, TFile as ObsidianTFile } from 'obsidian';
import { TFile, TFolder } from '../mocks/obsidian';

export { notices } from '../mocks/obsidian';

/** A mock TFile typed as the real one, for passing into plugin code. */
export function tfile(path: string): ObsidianTFile {
	return new TFile(path) as unknown as ObsidianTFile;
}

type Loc = { line: number; col: number; offset: number };
type Pos = { start: Loc; end: Loc };
export type FakeHeading = { heading: string; level: number; position: Pos };
export type FakeSection = { type: string; position: Pos };

function pos(startLine: number, endLine = startLine): Pos {
	return {
		start: { line: startLine, col: 0, offset: 0 },
		end: { line: endLine, col: 0, offset: 0 },
	};
}

/**
 * Computes the parts of Obsidian's CachedMetadata the plugin reads: headings
 * (with 0-based line numbers) and a `yaml` section for leading frontmatter.
 */
export function computeMetadata(content: string) {
	const lines = content.split('\n');
	const sections: FakeSection[] = [];
	const headings: FakeHeading[] = [];

	let bodyStart = 0;
	if (lines[0] === '---') {
		const close = lines.indexOf('---', 1);
		if (close !== -1) {
			sections.push({ type: 'yaml', position: pos(0, close) });
			bodyStart = close + 1;
		}
	}

	let inFence = false;
	for (let i = bodyStart; i < lines.length; i++) {
		if (lines[i].startsWith('```')) inFence = !inFence;
		if (inFence) continue;
		const match = /^(#{1,6})\s+(.*)$/.exec(lines[i]);
		if (match) {
			headings.push({
				heading: match[2].trim(),
				level: match[1].length,
				position: pos(i),
			});
		}
	}

	return {
		sections,
		headings: headings.length ? headings : undefined,
	};
}

type FakeLeaf = { view: { file?: { path: string } } };

/**
 * An in-memory Obsidian App: a vault keyed by path, a metadata cache derived
 * from file contents, and a workspace that records opens. Cast to `App` at
 * the call site with `fake.app`.
 */
export class FakeApp {
	files = new Map<string, string>();
	folders = new Set<string>();
	openLeaves: FakeLeaf[] = [];
	opened: string[] = [];
	activated: string[] = [];
	vaultName = 'TestVault';
	/** Path of the file shown in the active view, if any. */
	activeFile: string | null = null;

	constructor(initial: Record<string, string> = {}) {
		for (const [path, content] of Object.entries(initial)) {
			this.addFile(path, content);
		}
	}

	addFile(path: string, content: string) {
		this.files.set(path, content);
		const parts = path.split('/');
		for (let i = 1; i < parts.length; i++) {
			this.folders.add(parts.slice(0, i).join('/'));
		}
	}

	read(path: string): string | undefined {
		return this.files.get(path);
	}

	get app(): App {
		const vault = {
			getName: () => this.vaultName,
			getMarkdownFiles: () =>
				[...this.files.keys()]
					.filter((p) => p.endsWith('.md'))
					.map((p) => new TFile(p)),
			getFiles: () => [...this.files.keys()].map((p) => new TFile(p)),
			getAllLoadedFiles: () => [
				...[...this.folders].map((p) => new TFolder(p)),
				...[...this.files.keys()].map((p) => new TFile(p)),
			],
			getAbstractFileByPath: (path: string) => {
				if (this.files.has(path)) return new TFile(path);
				if (this.folders.has(path)) return new TFolder(path);
				return null;
			},
			read: async (file: TFile) => this.mustRead(file.path),
			cachedRead: async (file: TFile) => this.mustRead(file.path),
			modify: async (file: TFile, data: string) => {
				this.mustRead(file.path);
				this.files.set(file.path, data);
			},
			create: async (path: string, data: string) => {
				if (this.files.has(path)) throw new Error('File already exists.');
				this.addFile(path, data);
				return new TFile(path);
			},
			createBinary: async (path: string) => {
				this.addFile(path, '<binary>');
				return new TFile(path);
			},
			createFolder: async (path: string) => {
				this.folders.add(path);
			},
		};

		const metadataCache = {
			getFileCache: (file: TFile) => {
				const content = this.files.get(file.path);
				return content === undefined ? null : computeMetadata(content);
			},
			getFirstLinkpathDest: (linkpath: string) => {
				for (const candidate of [linkpath, `${linkpath}.md`]) {
					if (this.files.has(candidate)) return new TFile(candidate);
				}
				return null;
			},
		};

		const workspace = {
			iterateAllLeaves: (cb: (leaf: FakeLeaf) => void) =>
				this.openLeaves.forEach(cb),
			setActiveLeaf: (leaf: FakeLeaf) => {
				this.activated.push(leaf.view.file?.path ?? '');
			},
			openLinkText: async (path: string) => {
				this.opened.push(path);
			},
			getLeavesOfType: () => [],
			getActiveViewOfType: () =>
				this.activeFile ? { file: new TFile(this.activeFile) } : null,
		};

		return { vault, metadataCache, workspace } as unknown as App;
	}

	private mustRead(path: string): string {
		const content = this.files.get(path);
		if (content === undefined) throw new Error(`No such file: ${path}`);
		return content;
	}
}

/**
 * Yields to the event loop a few times. Write paths are awaited end to end
 * now, so this only matters for timers such as the canvas write's delay.
 */
export async function settle(ms = 0) {
	for (let i = 0; i < 10; i++) {
		await new Promise((r) => setTimeout(r, ms));
	}
}
