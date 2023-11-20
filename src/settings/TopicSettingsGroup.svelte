<script lang="ts">
	import type { App } from 'obsidian';
	import Suggest from './components/TemplateSuggest.svelte';
	import type { ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';

	export let app: App;
	export let settings: Writable<ObsidianClipperSettings>;
	const onChange = (entry: string) => {
		$settings.entryTemplateLocation = entry;
	};
</script>

<div class="clp_section_margin">
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Topic Note Position</div>
			<div class="setting-item-description">
				Prepend clippings or append them to the bottom?
			</div>
		</div>
		<div class="setting-item-control">
			<select class="dropdown" bind:value={$settings.position}>
				<option value="prepend">prepend</option>
				<option value="append">append</option>
			</select>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Open Note After Adding Clipping?</div>
			<div class="setting-item-description">
				Open the note after adding the clipping?
			</div>
		</div>
		<div class="setting-item-control">
			<select class="dropdown" bind:value={$settings.openOnWrite}>
				<option value={true}>Yes</option>
				<option value={false}>No</option>
			</select>
		</div>
	</div>
	<Suggest
		name="Clipped Entry Template"
		description="Choose the template to use for the clipped entry in a topic note"
		initialValue={$settings.entryTemplateLocation}
		dataProvider={() => app.vault.getMarkdownFiles()}
		{onChange}
	/>
</div>
