<script lang="ts">
	import { App, Modal } from 'obsidian';

	import { randomUUID } from 'crypto';
	import { deepmerge } from 'deepmerge-ts';
	import { pluginSettings } from './settingsstore';
	import { ClipperType, DEFAULT_CLIPPER_SETTING } from './types';
	import ClipperSettingsComponent from './components/ClipperSettingsComponent.svelte';
	import { getFileName } from 'src/utils/fileutils';

	export let app: App;
	export let filePath: string;

	// create new setting TODO: Make a utility for this and update all cases being duplicated
	let clipperPlaceholderSettings = deepmerge({}, DEFAULT_CLIPPER_SETTING);
	clipperPlaceholderSettings.clipperId = randomUUID();
	clipperPlaceholderSettings.vaultName = app.vault.getName();
	clipperPlaceholderSettings.notePath = filePath;
	clipperPlaceholderSettings.name = getFileName(filePath);
	clipperPlaceholderSettings.type = ClipperType.TOPIC;
	$pluginSettings.clippers.push(clipperPlaceholderSettings);
	$pluginSettings = $pluginSettings; //eslint-disable-line

	let settingsIndex = $pluginSettings.clippers.findIndex(
		(c) => c.clipperId === clipperPlaceholderSettings.clipperId
	);
	if (settingsIndex !== -1) {
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
	}
</script>
