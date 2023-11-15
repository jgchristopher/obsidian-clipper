<script lang="ts">
	import type { App } from 'obsidian';
	import Suggest from './components/TemplateSuggest.svelte';
	import { settings } from './settingsstore';
	import { propertyStore } from 'svelte-writable-derived';

	export let app: App;
	let chosenSettingStore = propertyStore(settings, ['clippers', 0]);
	const onChange = (entry: string) => {
		$chosenSettingStore.topicEntryTemplateLocation = entry;
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
			<select class="dropdown" bind:value={$chosenSettingStore.topicPosition}>
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
			<select
				class="dropdown"
				bind:value={$chosenSettingStore.topicOpenOnWrite}
			>
				<option value={true}>Yes</option>
				<option value={false}>No</option>
			</select>
		</div>
	</div>
	<Suggest
		name="Clipped Entry Template"
		description="Choose the template to use for the clipped entry in a topic note"
		initialValue={$chosenSettingStore.topicEntryTemplateLocation}
		dataProvider={() => app.vault.getMarkdownFiles()}
		{onChange}
	/>
</div>
