/**
 * Smoke tests against the built main.js (run `pnpm build` first). Unit specs
 * exercise the TypeScript source; these catch regressions in the bundle
 * itself, such as esbuild output changes or Svelte compile differences.
 */
import { existsSync } from 'fs';
import Module, { createRequire } from 'module';
import * as path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as obsidian from './mocks/obsidian';
import { FakeApp, settle } from './fakes/fakeapp';
import { clipper } from './fakes/clippers';
import dailyData from '../src/utils/daily-data.json';

const BUNDLE = path.resolve('main.js');

type Loader = { _load: (request: string, ...rest: unknown[]) => unknown };
const loader = Module as unknown as Loader;
const originalLoad = loader._load;
// Every module main.js asks `require` for.
const bundleRequests = new Set<string>();

type BundledPlugin = obsidian.Plugin & {
	onload(): Promise<void>;
	settings: { version: number; clippers: { type: string; name: string }[] };
};
type PluginConstructor = new (app: unknown, manifest: unknown) => BundledPlugin;
const requireBundle = createRequire(import.meta.url);

// Obsidian evaluates main.js fresh each time the plugin is enabled. Do the
// same per test, since the settings store is a module-level singleton.
function freshPluginClass(): PluginConstructor {
	delete requireBundle.cache[BUNDLE];
	const bundle = requireBundle(BUNDLE);
	return bundle.default ?? bundle;
}

beforeAll(() => {
	if (!existsSync(BUNDLE)) {
		throw new Error('main.js not found. Run `pnpm build` before testing.');
	}
	// Obsidian provides `obsidian` at runtime; the bundle keeps it external.
	loader._load = function (request: string, ...rest: unknown[]) {
		const parent = rest[0] as { filename?: string } | undefined;
		if (parent?.filename === BUNDLE) bundleRequests.add(request);
		if (request === 'obsidian') return obsidian;
		return originalLoad.call(this, request, ...rest);
	};
});

afterAll(() => {
	loader._load = originalLoad;
});

// Rendered text with template whitespace collapsed, as the browser shows it.
function text(el: HTMLElement) {
	return (el.textContent ?? '').replace(/\s+/g, ' ');
}

async function load(fake: FakeApp, stored: unknown) {
	const PluginClass = freshPluginClass();
	const plugin = new PluginClass(fake.app, {});
	plugin.storedData = stored;
	await plugin.onload();
	return plugin;
}

describe('built main.js', () => {
	// Obsidian mobile provides only `obsidian` to require(); Node built-ins
	// such as crypto would stop the plugin from loading there.
	it('requires nothing but obsidian at runtime', async () => {
		await load(new FakeApp(), null);
		expect([...bundleRequests]).toEqual(['obsidian']);
	});

	it('registers commands and the protocol handler', async () => {
		const plugin = await load(new FakeApp(), null);
		expect(plugin.commands.map((c) => c.id)).toHaveLength(5);
		expect(Object.keys(plugin.protocolHandlers)).toEqual(['obsidian-clipper']);
	});

	it('writes a clip into a topic note', async () => {
		const fake = new FakeApp({ 'topics/rust.md': '## Clips\n- old' });
		const plugin = await load(fake, {
			version: 2,
			clippers: [
				clipper({
					type: 'topic',
					notePath: 'topics/rust.md',
					heading: 'Clips',
					headingLevel: 2,
				}),
			],
		});
		await plugin.protocolHandlers['obsidian-clipper']({
			clipperId: 'clipper-1',
			url: 'https://ex.com/page',
			title: 'Page',
			highlightdata: '> quote',
		});
		await settle();
		expect(fake.read('topics/rust.md')).toBe(
			'## Clips\n- old\n- [ ] [Page](https://ex.com/page) \n> quote\n > \n\n---'
		);
	});

	it('migrates pre-1.0 settings', async () => {
		const plugin = await load(new FakeApp(), structuredClone(dailyData));
		expect(plugin.settings.version).toBe(2);
		expect(plugin.settings.clippers).toEqual([
			expect.objectContaining({ type: 'daily', name: 'Clipped 1' }),
		]);
	});

	// 0.x had an experimental canvas bookmarklet that sent the canvas path and
	// no clipperId. Migrating it must make the same clipper the Canvas
	// Bookmarklet command makes, not a topic clipper that writes Markdown
	// into the canvas JSON.
	it('migrates an old canvas bookmarklet to a canvas clipper', async () => {
		const canvasPath = 'Boards/Research Board.canvas';
		const fake = new FakeApp({ [canvasPath]: '{"nodes":[],"edges":[]}' });
		const plugin = await load(fake, { version: 2, clippers: [] });
		await plugin.protocolHandlers['obsidian-clipper']({
			notePath: canvasPath,
			url: 'https://ex.com/page',
			title: 'Page',
			highlightdata: 'text',
		});
		await settle();

		const [migration] = obsidian.modals.slice(-1);
		expect(text(migration.modalEl)).toContain(
			'A new Canvas clipper has been created for the'
		);
		expect(text(migration.modalEl)).toContain('canvas and you can');
		(migration as unknown as { onClose(): void }).onClose();
		await settle();
		const [migrated] = plugin.settings.clippers;

		const commandFake = new FakeApp({ [canvasPath]: '{}' });
		const commandPlugin = await load(commandFake, { version: 2, clippers: [] });
		commandFake.activeFile = canvasPath;
		const canvasCommand = commandPlugin.commands.find(
			(c) => c.id === 'copy-note-bookmarklet-address-canvas'
		)?.checkCallback as (checking: boolean) => void;
		canvasCommand(false);
		await settle();
		const [created] = commandPlugin.settings.clippers;

		expect(migrated).toMatchObject({ type: 'canvas', notePath: canvasPath });
		expect(migrated).toEqual({
			...created,
			clipperId: expect.any(String),
			createdAt: expect.any(Date),
		});
	});

	it('still migrates an old topic bookmarklet to a topic clipper', async () => {
		const plugin = await load(new FakeApp({ 'topics/old.md': '' }), {
			version: 2,
			clippers: [],
		});
		await plugin.protocolHandlers['obsidian-clipper']({
			notePath: 'topics/old.md',
		});
		await settle();
		const [migration] = obsidian.modals.slice(-1);
		expect(text(migration.modalEl)).toContain(
			'A new Topic clipper has been created for the'
		);
		expect(text(migration.modalEl)).toContain('note and you can');
		(migration as unknown as { onClose(): void }).onClose();
		await settle();
		expect(plugin.settings.clippers).toEqual([
			expect.objectContaining({ type: 'topic', notePath: 'topics/old.md' }),
		]);
	});

	it('renders the compiled Svelte settings tab', async () => {
		const plugin = await load(new FakeApp(), {
			version: 2,
			clippers: [clipper({ name: 'Research clipper' })],
		});
		const tab = plugin.settingTabs[0] as obsidian.PluginSettingTab & {
			display(): void;
		};
		tab.display();
		await settle();
		expect(tab.containerEl.textContent).toContain('Research clipper');
		expect(tab.containerEl.textContent).not.toContain('Default Clipper');
		// Dates render through Obsidian's moment export.
		expect(tab.containerEl.textContent).toMatch(
			/Created on [A-Z][a-z]+ \d{2}, \d{4}/
		);
	});

	it('opens the clipper editor with its tabs from the settings tab', async () => {
		const fake = new FakeApp();
		const plugin = await load(fake, {
			version: 2,
			clippers: [clipper({ name: 'Research clipper' })],
		});
		const tab = plugin.settingTabs[0] as obsidian.PluginSettingTab & {
			display(): void;
		};
		tab.display();
		await settle();

		const gear =
			tab.containerEl.querySelector<HTMLElement>('td .clickable-icon');
		gear?.click();
		await settle();

		expect(obsidian.modals).toHaveLength(1);
		const [modal] = obsidian.modals;
		expect(modal.app).toBe(plugin.app);
		// Fixed size (input.css), so switching tabs does not resize it.
		expect(modal.modalEl.classList.contains('clipper-settings-modal')).toBe(
			true
		);
		expect(modal.titleEl.textContent).toBe('Edit Clipper Settings');
		const tabs = Array.from(modal.contentEl.querySelectorAll('li span')).map(
			(el) => el.textContent
		);
		expect(tabs).toEqual(expect.arrayContaining(['Base', 'Browser']));
		// The active tab's component renders through <svelte:component>.
		expect(modal.contentEl.querySelector('.obs_clp_box')).not.toBeNull();
		expect(modal.contentEl.textContent).toContain('Header');
	});

	it('adds a clipper only once it has a name and a type', async () => {
		const plugin = await load(new FakeApp(), {
			version: 2,
			clippers: [clipper({ name: 'Research clipper' })],
		});
		const tab = plugin.settingTabs[0] as obsidian.PluginSettingTab & {
			display(): void;
		};
		tab.display();
		await settle();
		const buttons = () =>
			Array.from(tab.containerEl.querySelectorAll<HTMLButtonElement>('button'));
		buttons()
			.find((b) => b.textContent === '+')
			?.click();
		await settle();

		const popup = tab.containerEl.querySelector<HTMLElement>('.addPopOver');
		if (!popup) throw new Error('Add clipper popup did not open');
		const name = popup.querySelector<HTMLInputElement>('input[type="text"]');
		const type = popup.querySelector<HTMLSelectElement>('select');
		const add = () =>
			buttons().find((b) => b.textContent?.trim() === 'Add Clipper');
		if (!name || !type) throw new Error('Add clipper fields missing');
		const setName = async (value: string) => {
			name.value = value;
			name.dispatchEvent(new Event('input'));
			await settle();
		};
		const setType = async (value: string) => {
			type.value = value;
			type.dispatchEvent(new Event('change'));
			await settle();
		};

		expect(add()?.disabled).toBe(true);
		expect(popup.textContent).toContain('Enter a name and choose a type');

		await setName('Reading');
		expect(add()?.disabled).toBe(true);

		await setName('   ');
		await setType('topic');
		expect(add()?.disabled).toBe(true);

		// Clicking a disabled button does nothing.
		add()?.click();
		await settle();
		expect(plugin.settings.clippers).toHaveLength(1);

		await setName('  Reading  ');
		expect(add()?.disabled).toBe(false);
		add()?.click();
		await settle();

		expect(plugin.settings.clippers).toHaveLength(2);
		expect(plugin.settings.clippers[1]).toMatchObject({
			name: 'Reading',
			type: 'topic',
			vaultName: 'TestVault',
		});
		expect(plugin.storedData).toEqual(plugin.settings);

		// The popup closes. Reopened, its fields start empty.
		buttons()
			.find((b) => b.textContent === '+')
			?.click();
		await settle();
		const reopened = tab.containerEl.querySelector<HTMLElement>('.addPopOver');
		expect(reopened?.querySelector('input')?.value).toBe('');
		expect(reopened?.querySelector('select')?.value).toBe('');
		expect(add()?.disabled).toBe(true);
	});

	// Obsidian 1.12+ ships `.vertical-tab-content h1 { display: none; }`, so an
	// <h1> anywhere in a settings tab renders blank (issue #88). Headings use
	// Obsidian's setting-item-heading markup instead, in the tab and the modal.
	it('renders headings without <h1>, which Obsidian hides in settings', async () => {
		const plugin = await load(new FakeApp(), {
			version: 2,
			clippers: [clipper({ name: 'Research clipper' })],
		});
		const tab = plugin.settingTabs[0] as obsidian.PluginSettingTab & {
			display(): void;
		};
		tab.display();
		await settle();
		const headings = (root: HTMLElement) =>
			Array.from(
				root.querySelectorAll('.setting-item-heading .setting-item-name')
			).map((el) => el.textContent?.trim());

		const plus = Array.from(
			tab.containerEl.querySelectorAll<HTMLElement>('button')
		).find((b) => b.textContent === '+');
		plus?.click();
		await settle();
		expect(tab.containerEl.querySelector('h1')).toBeNull();
		expect(headings(tab.containerEl)).toContain('Add New Clipper');

		tab.containerEl.querySelector<HTMLElement>('td .clickable-icon')?.click();
		await settle();
		const [modal] = obsidian.modals.slice(-1);
		const seen: (string | undefined)[] = [];
		for (const label of ['Base', 'Browser', 'Advanced']) {
			Array.from(modal.contentEl.querySelectorAll<HTMLElement>('li span'))
				.find((el) => el.textContent === label)
				?.click();
			await settle();
			expect(modal.contentEl.querySelector('h1')).toBeNull();
			seen.push(...headings(modal.contentEl));
		}
		expect(seen).toEqual(
			expect.arrayContaining([
				'Daily Note Entry',
				'Bookmarklet Settings',
				'Advanced Settings',
			])
		);
	});
});
