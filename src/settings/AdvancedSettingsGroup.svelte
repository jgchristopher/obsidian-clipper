<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';
	import { TAbstractFile, type App, TFolder } from 'obsidian';
	import Suggest from './components/TemplateSuggest.svelte';

	export let app: App;

	export let settings: Writable<ObsidianClipperSettings>;

	const onChange = (entry: string) => {
		$settings.advancedStorageFolder = entry;
	};

	const getFolders = (files: TAbstractFile[]) => {
		const folders = files.filter((file) => {
			return file instanceof TFolder;
		});
		return folders;
	};
</script>

<div class="clp_section_margin">
	<h1>Advanced Settings</h1>
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<div class="setting-item-name">Store Clippings Per Domain</div>
			<div class="setting-item-description">
				Creates a note per top-level domain and stores all clippings from that
				domain within it. It will add an embedded document link in your Daily
				Note.
			</div>
		</div>
		<div class="setting-item-control">
			<label
				class="checkbox-container"
				class:is-enabled={$settings.advancedStorage}
			>
				<input type="checkbox" bind:checked={$settings.advancedStorage} />
			</label>
		</div>
	</div>
	{#if $settings.advancedStorage}
		<div in:slide|local={{ duration: 300 }} out:slide|local={{ duration: 300 }}>
			<Suggest
				name="Clipped Entry Storage Location"
				description="Choose the folder to store all of your clippings. A note per domain
						clipped from. Default is a `clippings`"
				initialValue={$settings.advancedStorageFolder}
				dataProvider={() => getFolders(app.vault.getAllLoadedFiles())}
				{onChange}
			/>
		</div>
	{/if}
</div>
