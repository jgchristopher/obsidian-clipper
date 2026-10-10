<script lang="ts">
	import type { App } from 'obsidian';

	import { pluginSettings } from '../../settingsstore';
	import { newClipper } from '../../types';
	import { openClipperSettingsModal } from '../clippersettingsmodal';
	import { getFileName } from 'src/utils/fileutils';

	export let app: App;
	export let filePath: string;
	export let type: 'topic' | 'canvas';

	// Do we have an existing clipper for this note?
	let settingsIndex = $pluginSettings.clippers.findIndex((c) => {
		return c.notePath === filePath;
	});

	// We don't, so genrate a new clipper
	if (settingsIndex === -1) {
		// create new setting
		const clipperPlaceholderSettings = newClipper({
			vaultName: app.vault.getName(),
			notePath: filePath,
			name: getFileName(filePath),
			type,
		});
		settingsIndex =
			$pluginSettings.clippers.push(clipperPlaceholderSettings) - 1;
		$pluginSettings = $pluginSettings;
		// Update settingsIndex to find the newly created clipper
	}

	// Open on the Browser tab so the new bookmarklet is right there.
	openClipperSettingsModal(app, settingsIndex, 2);
</script>
