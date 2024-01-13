<script lang="ts">
	import { App, Modal } from 'obsidian';

	import { deepmerge } from 'deepmerge-ts';
	import { pluginSettings } from './settingsstore';
	import { DEFAULT_CLIPPER_SETTING } from './types';
	import ClipperSettingsComponent from './components/ClipperSettingsComponent.svelte';
	import { getFileName } from 'src/utils/fileutils';

	export let app: App;
	export let filePath: string;
	export let type: 'topic' | 'canvas';

	let clipperPlaceholderSettings = deepmerge({}, DEFAULT_CLIPPER_SETTING);

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
		$pluginSettings = $pluginSettings; //eslint-disable-line
		// Update settingsIndex to find the newly created clipper
	}

	const settingsScreen = new Modal(this.app);
	settingsScreen.titleEl.createEl('h2', {
		text: 'Edit Clipper Settings',
	});

	new ClipperSettingsComponent({
		target: settingsScreen.contentEl,
		props: {
			app,
			settingsIndex,
		},
	});

	settingsScreen.open();
</script>
