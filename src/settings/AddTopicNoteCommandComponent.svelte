<script lang="ts">
	import { App, Modal } from 'obsidian';

	import { randomUUID } from 'crypto';
	import { deepmerge } from 'deepmerge-ts';
	import { pluginSettings } from './settingsstore';
	import { DEFAULT_CLIPPER_SETTING } from './types';
	import ClipperSettingsComponent from './components/ClipperSettingsComponent.svelte';

	export let app: App;
	export let filePath: string;

	// create new setting
	let clipperPlaceholderSettings = deepmerge({}, DEFAULT_CLIPPER_SETTING);
	clipperPlaceholderSettings.clipperId = randomUUID();
	clipperPlaceholderSettings.vaultName = app.vault.getName();
	clipperPlaceholderSettings.notePath = filePath;
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
