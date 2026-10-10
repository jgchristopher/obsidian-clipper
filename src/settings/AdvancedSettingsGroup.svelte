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
	<div class="setting-item setting-item-heading">
		<div class="setting-item-info">
			<div class="setting-item-name">Advanced Settings</div>
		</div>
	</div>
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<div class="setting-item-name">Store Clippings Per Domain</div>
			<div class="setting-item-description">
				Saves each clipping to a note named after the site's host name (such as
				www.example.com) and adds an embed of it to this clipper's note or
				canvas.
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
				description="The folder for the per-site notes. Defaults to clippings."
				initialValue={$settings.advancedStorageFolder}
				dataProvider={() => getFolders(app.vault.getAllLoadedFiles())}
				{onChange}
			/>
		</div>
	{/if}
</div>
