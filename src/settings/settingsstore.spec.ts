import { describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import type ObsidianClipperPlugin from 'src/main';
import { DEFAULT_SETTINGS_EMPTY } from './types';

async function freshStore() {
	vi.resetModules();
	return import('./settingsstore');
}

function fakePlugin() {
	return {
		settings: structuredClone(DEFAULT_SETTINGS_EMPTY),
		saveSettings: vi.fn(),
	};
}

describe('pluginSettings store', () => {
	it('exposes the plugin settings', async () => {
		const store = await freshStore();
		const plugin = fakePlugin();
		store.init(plugin as unknown as ObsidianClipperPlugin);
		expect(get(store.pluginSettings)).toBe(plugin.settings);
	});

	it('saves to disk on set', async () => {
		const store = await freshStore();
		const plugin = fakePlugin();
		store.init(plugin as unknown as ObsidianClipperPlugin);
		store.pluginSettings.set({ version: 2, clippers: [] });
		expect(plugin.saveSettings).toHaveBeenCalledOnce();
	});

	// Current behavior: update() changes the store but does not persist.
	it('does not save to disk on update', async () => {
		const store = await freshStore();
		const plugin = fakePlugin();
		store.init(plugin as unknown as ObsidianClipperPlugin);
		store.pluginSettings.update((s) => ({ ...s, version: 3 }));
		expect(get(store.pluginSettings).version).toBe(3);
		expect(plugin.saveSettings).not.toHaveBeenCalled();
	});

	it('ignores a second init', async () => {
		const store = await freshStore();
		const first = fakePlugin();
		const second = fakePlugin();
		store.init(first as unknown as ObsidianClipperPlugin);
		store.init(second as unknown as ObsidianClipperPlugin);
		expect(get(store.pluginSettings)).toBe(first.settings);
	});
});
