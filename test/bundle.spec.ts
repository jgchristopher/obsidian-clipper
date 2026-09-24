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
		if (request === 'obsidian') return obsidian;
		return originalLoad.call(this, request, ...rest);
	};
});

afterAll(() => {
	loader._load = originalLoad;
});

async function load(fake: FakeApp, stored: unknown) {
	const PluginClass = freshPluginClass();
	const plugin = new PluginClass(fake.app, {});
	plugin.storedData = stored;
	await plugin.onload();
	return plugin;
}

describe('built main.js', () => {
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
		expect(tab.containerEl.textContent).toMatch(/Created on [A-Z][a-z]+ \d{2}, \d{4}/);
	});
});
