import type ObsidianClipperPlugin from 'src/main';
import type { ObsidianClipperPluginSettings } from 'src/settings/types';
import { type Writable, writable } from 'svelte/store';

export let settings: Writable<ObsidianClipperPluginSettings>;

export function init(plugin: ObsidianClipperPlugin) {
	if (settings) {
		return;
	}
	const { subscribe, set, update } = writable(plugin.settings);
	settings = {
		subscribe,
		update,
		// save the plugin values when setting the store
		set: (value: ObsidianClipperPluginSettings) => {
			set(value);
			plugin.saveSettings();
		},
	};
}
