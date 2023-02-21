import type ObsidianClipperPlugin from 'src/main';
import type { ObsidianClipperSettings } from 'src/settings';
import { type Writable, writable } from 'svelte/store';

export let settings: Writable<ObsidianClipperSettings>;

export function init(plugin: ObsidianClipperPlugin) {
  if (settings) {
    return;
  }
  const { subscribe, set, update } = writable(plugin.settings);
  settings = {
    subscribe,
    update,
    // save the plugin values when setting the store
    set: (value: ObsidianClipperSettings) => {
      set(value);
      plugin.saveSettings();
    },
  };
}
