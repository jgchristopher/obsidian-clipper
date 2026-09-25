<script lang="ts">
	import type { App } from 'obsidian';

	import { pluginSettings } from '../../settingsstore';
	import { DEFAULT_CLIPPER_SETTING } from '../../types';
	import { openClipperSettingsModal } from '../clippersettingsmodal';
	import { getFileName } from 'src/utils/fileutils';

	export let app: App;
	export let filePath: string;
	export let type: 'topic' | 'canvas';

	// let clipperPlaceholderSettings = deepmerge({}, DEFAULT_CLIPPER_SETTING);

	let clipperPlaceholderSettings = structuredClone(DEFAULT_CLIPPER_SETTING);

	// Do we have an existing clipper for this note?
	let settingsIndex = $pluginSettings.clippers.findIndex((c) => {
		return c.notePath === filePath;
	});

	// We don't, so genrate a new clipper
	if (settingsIndex === -1) {
		// create new setting
		clipperPlaceholderSettings.clipperId = crypto.randomUUID();
		clipperPlaceholderSettings.vaultName = app.vault.getName();
		clipperPlaceholderSettings.notePath = filePath;
		clipperPlaceholderSettings.name = getFileName(filePath);
		clipperPlaceholderSettings.type = type;
		settingsIndex =
			$pluginSettings.clippers.push(clipperPlaceholderSettings) - 1;
		$pluginSettings = $pluginSettings;
		// Update settingsIndex to find the newly created clipper
	}

	// Open on the Browser tab so the new bookmarklet is right there.
	openClipperSettingsModal(app, settingsIndex, 2);
</script>
