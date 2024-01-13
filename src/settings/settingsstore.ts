import type ObsidianClipperPlugin from 'src/main';
import type { ObsidianClipperPluginSettings } from 'src/settings/types';
import { type Writable, writable } from 'svelte/store';

export let pluginSettings: Writable<ObsidianClipperPluginSettings>;

export function init(plugin: ObsidianClipperPlugin) {
	if (pluginSettings) {
		return;
	}
	const { subscribe, set, update } = writable(plugin.settings);
	pluginSettings = {
		subscribe,
		update,
		// save the plugin values when setting the store
		set: (value: ObsidianClipperPluginSettings) => {
			set(value);
			plugin.saveSettings();
		},
	};
}
