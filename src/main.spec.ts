import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as periodic from 'obsidian-daily-notes-interface';
import { Modal, type Plugin as MockPlugin } from '../test/mocks/obsidian';
import { FakeApp, notices, settle, tfile } from '../test/fakes/fakeapp';
import { clipper } from '../test/fakes/clippers';
import { mounted } from '../test/fakes/sveltestub';
import ObsidianClipperPlugin, { UNKNOWN_CLIPPER_NOTICE } from './main';
import {
	ClipperType,
	type ObsidianClipperPluginSettings,
	type ObsidianClipperSettings,
} from './settings/types';
import dailyData from './utils/daily-data.json';
import weeklyData from './utils/weekly-data.json';
import dailyWeeklyData from './utils/daily-weekly-data.json';
import dailyCommentsData from './utils/daily-comments.json';

vi.mock('svelte', async () =>
	(await import('../test/fakes/sveltestub')).svelteMock()
);
vi.mock(
	'./settings/components/addnotecommand/AddNoteCommandComponent.svelte',
	async () =>
		(await import('../test/fakes/sveltestub')).stub('AddNoteCommandComponent')
);
vi.mock('./settings/SettingsComponent.svelte', async () =>
	(await import('../test/fakes/sveltestub')).stub('SettingsComponent')
);
vi.mock('./views/LinksView.svelte', async () =>
	(await import('../test/fakes/sveltestub')).stub('LinksView')
);
vi.mock(
	'./settings/components/migratetopicnote/MigrateTopicNoteComponent.svelte',
	async () =>
		(await import('../test/fakes/sveltestub')).stub('MigrateTopicNoteComponent')
);
vi.mock(
	'./settings/components/migratedailynote/MigrateDailyNoteComponent.svelte',
	async () =>
		(await import('../test/fakes/sveltestub')).stub('MigrateDailyNoteComponent')
);
vi.mock('obsidian-daily-notes-interface', () => ({
	appHasDailyNotesPluginLoaded: vi.fn(() => true),
	getAllDailyNotes: vi.fn(() => ({})),
	getDailyNote: vi.fn(),
	createDailyNote: vi.fn(),
	appHasWeeklyNotesPluginLoaded: vi.fn(() => true),
	getAllWeeklyNotes: vi.fn(() => ({})),
	getWeeklyNote: vi.fn(),
	createWeeklyNote: vi.fn(),
}));

type Harness = ObsidianClipperPlugin & MockPlugin;

async function loadPlugin(fake: FakeApp, stored: unknown = null) {
	const plugin = new ObsidianClipperPlugin(fake.app, {} as never) as Harness;
	plugin.storedData = stored;
	await plugin.onload();
	return plugin;
}

function settingsWith(
	...clippers: ObsidianClipperSettings[]
): ObsidianClipperPluginSettings {
	return { version: 2, clippers };
}

function command(plugin: Harness, id: string) {
	const found = plugin.commands.find((c) => c.id === id);
	if (!found) throw new Error(`No command ${id}`);
	return found.checkCallback as (checking: boolean) => boolean | void;
}

async function clip(plugin: Harness, params: Record<string, string>) {
	await plugin.protocolHandlers['obsidian-clipper']({
		action: 'obsidian-clipper',
		vault: 'TestVault',
		url: 'https://ex.com/page',
		title: 'Page',
		...params,
	});
	await settle();
}

beforeEach(() => {
	mounted.length = 0;
	vi.restoreAllMocks();
});

describe('plugin registration', () => {
	it('registers the commands, protocol handler, view, and settings tab', async () => {
		const plugin = await loadPlugin(new FakeApp());
		expect(plugin.commands.map((c) => c.id)).toEqual([
			'create-topic-bookmarklet',
			'copy-note-bookmarklet-address-canvas',
			'copy-topic-bookmarklet-clipboard',
			'copy-topic-apple-shortcut-clipboard',
			'show-clipper-view',
		]);
		expect(Object.keys(plugin.protocolHandlers)).toEqual(['obsidian-clipper']);
		expect(Object.keys(plugin.views)).toEqual(['Clipper']);
		expect(plugin.settingTabs).toHaveLength(1);
	});
});

describe('loadSettings', () => {
	it('starts fresh installs with one daily clipper', async () => {
		const plugin = await loadPlugin(new FakeApp());
		expect(plugin.settings.version).toBe(2);
		expect(plugin.settings.clippers).toHaveLength(1);
		expect(plugin.settings.clippers[0]).toMatchObject({
			type: 'daily',
			name: 'Default Clipper',
			headingLevel: 1,
			position: 'append',
		});
	});

	it('uses versioned settings as-is', async () => {
		const stored = settingsWith(clipper({ name: 'Mine' }));
		const plugin = await loadPlugin(new FakeApp(), stored);
		expect(plugin.settings).toBe(stored);
	});

	it('migrates pre-1.0 daily settings into a daily clipper and saves', async () => {
		const plugin = await loadPlugin(new FakeApp(), structuredClone(dailyData));
		expect(plugin.settings.version).toBe(2);
		expect(plugin.settings.clippers).toHaveLength(1);
		expect(plugin.settings.clippers[0]).toMatchObject({
			type: 'daily',
			name: 'Clipped 1',
			heading: 'Clipped 1',
			vaultName: 'TestVault',
			position: 'append',
			advancedStorage: false,
			advancedStorageFolder: 'clippings',
		});
		expect(plugin.settings.clippers[0].clipperId).toMatch(/^[0-9a-f-]{36}$/);
		expect(plugin.storedData).toBe(plugin.settings);
	});

	it('carries non-default daily options through migration', async () => {
		const old = {
			...structuredClone(dailyData),
			dailyPosition: 'prepend',
			dailyOpenOnWrite: true,
			dailyEntryTemplateLocation: 'tpl/daily',
			timestampFormat: 'h:mm a',
			dateFormat: 'YYYY-MM-DD',
			tags: 'x,y',
		};
		const plugin = await loadPlugin(new FakeApp(), old);
		expect(plugin.settings.clippers[0]).toMatchObject({
			position: 'prepend',
			openOnWrite: true,
			entryTemplateLocation: 'tpl/daily',
			timestampFormat: 'h:mm a',
			dateFormat: 'YYYY-MM-DD',
			tags: 'x,y',
		});
	});

	it('migrates pre-1.0 weekly settings into a weekly clipper', async () => {
		const plugin = await loadPlugin(new FakeApp(), structuredClone(weeklyData));
		expect(plugin.settings.clippers).toEqual([
			expect.objectContaining({
				type: 'weekly',
				heading: 'Clipped Weekly',
				position: 'prepend',
				entryTemplateLocation: 'templates',
			}),
		]);
	});

	it('migrates daily and weekly together, carrying shared options to both', async () => {
		const plugin = await loadPlugin(
			new FakeApp(),
			structuredClone(dailyWeeklyData)
		);
		const [daily, weekly] = plugin.settings.clippers;
		expect(daily).toMatchObject({
			type: 'daily',
			heading: 'Clipped Daily',
			position: 'append',
			entryTemplateLocation: 'templates',
			tags: 'some-tag,tags',
			advancedStorage: true,
		});
		expect(weekly).toMatchObject({
			type: 'weekly',
			heading: 'Clipped Weekly',
			position: 'prepend',
			entryTemplateLocation: 'other-templates',
			tags: 'some-tag,tags',
			advancedStorage: true,
		});
		expect(daily.clipperId).not.toBe(weekly.clipperId);
	});

	it('migrates captureComments', async () => {
		expect(dailyCommentsData.captureComments).toBe(true);
		const plugin = await loadPlugin(
			new FakeApp(),
			structuredClone(dailyCommentsData)
		);
		expect(plugin.settings.clippers[0].captureComments).toBe(true);
	});

	it('migrates captureComments to both daily and weekly clippers', async () => {
		const plugin = await loadPlugin(new FakeApp(), {
			...structuredClone(dailyWeeklyData),
			captureComments: true,
		});
		expect(plugin.settings.clippers.map((c) => c.captureComments)).toEqual([
			true,
			true,
		]);
	});

	it('leaves captureComments off when old settings lack it', async () => {
		const old: Record<string, unknown> = structuredClone(dailyData);
		delete old.captureComments;
		const plugin = await loadPlugin(new FakeApp(), old);
		expect(plugin.settings.clippers[0].captureComments).toBe(false);
	});
});

describe('obsidian://obsidian-clipper handler', () => {
	it('writes a topic clip into the configured note', async () => {
		const fake = new FakeApp({ 'topics/rust.md': '## Clips\n- old' });
		const plugin = await loadPlugin(
			fake,
			settingsWith(
				clipper({
					type: ClipperType.TOPIC,
					notePath: 'topics/rust.md',
					heading: 'Clips',
					headingLevel: 2,
				})
			)
		);
		await clip(plugin, {
			clipperId: 'clipper-1',
			highlightdata: '> quote',
			comments: 'hmm',
		});
		expect(fake.read('topics/rust.md')).toBe(
			'## Clips\n- old\n- [ ] [Page](https://ex.com/page) \n> quote\n >hmm \n\n---'
		);
	});

	it('routes the clip by clipperId when several clippers exist', async () => {
		const fake = new FakeApp({ 'a.md': 'A', 'b.md': 'B' });
		const plugin = await loadPlugin(
			fake,
			settingsWith(
				clipper({ clipperId: 'a', type: ClipperType.TOPIC, notePath: 'a.md' }),
				clipper({ clipperId: 'b', type: ClipperType.TOPIC, notePath: 'b.md' })
			)
		);
		await clip(plugin, { clipperId: 'b', highlightdata: 'x' });
		expect(fake.read('a.md')).toBe('A');
		expect(fake.read('b.md')).toContain('[Page](https://ex.com/page)');
	});

	it('writes daily clips through the daily note', async () => {
		const fake = new FakeApp({ 'daily/today.md': '' });
		vi.mocked(periodic.getDailyNote).mockReturnValue(tfile('daily/today.md'));
		const plugin = await loadPlugin(
			fake,
			settingsWith(clipper({ type: ClipperType.DAILY }))
		);
		await clip(plugin, { clipperId: 'clipper-1' });
		expect(fake.read('daily/today.md')).toBe(
			'\n- [ ] [Page](https://ex.com/page) \n\n---'
		);
	});

	it('writes weekly clips through the weekly note', async () => {
		const fake = new FakeApp({ 'weekly/w.md': 'W' });
		vi.mocked(periodic.getWeeklyNote).mockReturnValue(tfile('weekly/w.md'));
		const plugin = await loadPlugin(
			fake,
			settingsWith(clipper({ type: ClipperType.WEEKLY }))
		);
		await clip(plugin, { clipperId: 'clipper-1' });
		expect(fake.read('weekly/w.md')).toBe(
			'W\n- [ ] [Page](https://ex.com/page) \n\n---'
		);
	});

	it('stores the highlight per-domain and embeds it in advanced storage mode', async () => {
		const fake = new FakeApp({ 'n.md': 'N' });
		fake.folders.add('clippings');
		const plugin = await loadPlugin(
			fake,
			settingsWith(
				clipper({
					type: ClipperType.TOPIC,
					notePath: 'n.md',
					advancedStorage: true,
					advancedStorageFolder: 'clippings',
				})
			)
		);
		await clip(plugin, { clipperId: 'clipper-1', highlightdata: 'the text' });

		expect(fake.read('clippings/ex.com.md')).toContain('the text');
		expect(fake.read('n.md')).toMatch(
			/^N\n- \[ \] Page \n!\[\[clippings\/ex\.com#[^|]+\|clipped\]\]\n/
		);
	});

	it('writes canvas clips into the canvas', async () => {
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
		const fake = new FakeApp({ 'b.canvas': '' });
		const plugin = await loadPlugin(
			fake,
			settingsWith(clipper({ type: ClipperType.CANVAS, notePath: 'b.canvas' }))
		);
		await clip(plugin, { clipperId: 'clipper-1', highlightdata: 'x' });
		const canvas = JSON.parse(fake.read('b.canvas') ?? '');
		expect(canvas.nodes).toHaveLength(2);
		expect(canvas.edges).toHaveLength(1);
	});

	it('shows a notice and writes nothing for an unknown clipperId', async () => {
		const fake = new FakeApp({ 'n.md': 'N' });
		const plugin = await loadPlugin(
			fake,
			settingsWith(clipper({ type: ClipperType.TOPIC, notePath: 'n.md' }))
		);
		await clip(plugin, { clipperId: 'deleted-clipper', highlightdata: 'x' });
		expect(fake.read('n.md')).toBe('N');
		expect(notices).toEqual([UNKNOWN_CLIPPER_NOTICE]);
	});

	it('opens the topic migration modal for an old bookmarklet with a notePath', async () => {
		const open = vi.spyOn(Modal.prototype, 'open');
		const plugin = await loadPlugin(new FakeApp(), settingsWith());
		await clip(plugin, { notePath: 'topics/old.md' });
		expect(open).toHaveBeenCalledOnce();
		expect(mounted).toContainEqual({
			name: 'MigrateTopicNoteComponent',
			props: { notePath: 'topics/old.md' },
		});
	});

	it('opens the daily migration modal for an old bookmarklet without a notePath', async () => {
		const open = vi.spyOn(Modal.prototype, 'open');
		const plugin = await loadPlugin(new FakeApp(), settingsWith());
		await clip(plugin, {});
		expect(open).toHaveBeenCalledOnce();
		expect(mounted.map((m) => m.name)).toContain('MigrateDailyNoteComponent');
	});
});

describe('commands', () => {
	let writeText: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		writeText = vi.fn();
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText },
			configurable: true,
		});
	});

	it('offers topic commands only for markdown files and canvas commands only for canvases', async () => {
		const fake = new FakeApp();
		const plugin = await loadPlugin(fake);

		fake.activeFile = 'note.md';
		expect(command(plugin, 'create-topic-bookmarklet')(true)).toBe(true);
		expect(command(plugin, 'copy-note-bookmarklet-address-canvas')(true)).toBe(
			false
		);

		fake.activeFile = 'board.canvas';
		expect(command(plugin, 'create-topic-bookmarklet')(true)).toBe(false);
		expect(command(plugin, 'copy-note-bookmarklet-address-canvas')(true)).toBe(
			true
		);
	});

	it('opens the add-clipper dialog for the active note', async () => {
		const fake = new FakeApp();
		const plugin = await loadPlugin(fake);
		fake.activeFile = 'topics/rust.md';
		command(plugin, 'create-topic-bookmarklet')(false);
		expect(mounted).toContainEqual({
			name: 'AddNoteCommandComponent',
			props: expect.objectContaining({
				filePath: 'topics/rust.md',
				type: 'topic',
			}),
		});
	});

	it('passes the full canvas path to the add-clipper dialog', async () => {
		const fake = new FakeApp();
		const plugin = await loadPlugin(fake);
		fake.activeFile = 'boards/research.canvas';
		command(plugin, 'copy-note-bookmarklet-address-canvas')(false);
		expect(mounted).toContainEqual({
			name: 'AddNoteCommandComponent',
			props: expect.objectContaining({
				filePath: 'boards/research.canvas',
				type: 'canvas',
			}),
		});
	});

	it("copies the bookmarklet for the active note's clipper", async () => {
		const fake = new FakeApp();
		const plugin = await loadPlugin(
			fake,
			settingsWith(
				clipper({
					clipperId: 'cid-42',
					type: ClipperType.TOPIC,
					notePath: 'n.md',
				})
			)
		);
		fake.activeFile = 'n.md';
		command(plugin, 'copy-topic-bookmarklet-clipboard')(false);

		expect(writeText).toHaveBeenCalledOnce();
		const bookmarklet = decodeURIComponent(writeText.mock.calls[0][0]);
		expect(bookmarklet.startsWith('javascript:')).toBe(true);
		expect(bookmarklet).toContain('cid-42');
		expect(bookmarklet).toContain('TestVault');
		expect(notices).toContain(
			'Obsidian Clipper Bookmarklet copied to clipboard.'
		);
	});

	it("copies the Apple Shortcut link for the active note's clipper", async () => {
		const fake = new FakeApp();
		const plugin = await loadPlugin(
			fake,
			settingsWith(
				clipper({
					clipperId: 'cid-42',
					type: ClipperType.TOPIC,
					notePath: 'n.md',
				})
			)
		);
		fake.activeFile = 'n.md';
		command(plugin, 'copy-topic-apple-shortcut-clipboard')(false);
		expect(writeText).toHaveBeenCalledWith(
			expect.stringMatching(/^obsidian:\/\/obsidian-clipper\?clipperId=cid-42&/)
		);
	});

	it('shows a notice when the active note has no clipper', async () => {
		const fake = new FakeApp();
		const plugin = await loadPlugin(fake, settingsWith());
		fake.activeFile = 'n.md';
		command(plugin, 'copy-topic-bookmarklet-clipboard')(false);
		command(plugin, 'copy-topic-apple-shortcut-clipboard')(false);
		expect(writeText).not.toHaveBeenCalled();
		expect(notices).toEqual([
			"Couldn't find setting for this note",
			"Couldn't find setting for this note",
		]);
	});
});
