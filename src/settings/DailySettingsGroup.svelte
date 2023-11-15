<script lang="ts">
	import type { App } from 'obsidian';
	import { slide } from 'svelte/transition';
	import Suggest from './components/TemplateSuggest.svelte';
	import { settings } from './settingsstore';
	import { propertyStore } from 'svelte-writable-derived';

	export let app: App;
	let chosenSettingStore = propertyStore(settings, ['clippers', 0]);
	const onChange = (entry: string) => {
		$chosenSettingStore.dailyEntryTemplateLocation = entry;
	};
</script>

<div class="clp_section_margin">
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Daily Note Entry</h1>
		</div>
		<div class="setting-item-control">
			<label
				class="checkbox-container"
				class:is-enabled={$chosenSettingStore.useDailyNote}
			>
				<input
					type="checkbox"
					bind:checked={$chosenSettingStore.useDailyNote}
				/>
			</label>
		</div>
	</div>
	{#if $chosenSettingStore.useDailyNote}
		<div in:slide|local={{ duration: 300 }} out:slide|local={{ duration: 300 }}>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Daily Note Header</div>
					<div class="setting-item-description">
						What header should highlight data be prepended/appended under in the
						daily note?
					</div>
				</div>
				<div class="setting-item-control">
					<input
						type="text"
						bind:value={$chosenSettingStore.dailyNoteHeading}
						spellcheck="false"
						placeholder=""
					/>
				</div>
			</div>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Daily Note Position</div>
					<div class="setting-item-description">
						Prepend clippings to the top of the section or append them to the
						bottom of the section?
					</div>
				</div>
				<div class="setting-item-control">
					<select
						class="dropdown"
						bind:value={$chosenSettingStore.dailyPosition}
					>
						<option value="prepend">prepend</option>
						<option value="append">append</option>
					</select>
				</div>
			</div>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Open Note After Adding Clipping?</div>
					<div class="setting-item-description">
						Open the daily note after adding the clipping?
					</div>
				</div>
				<div class="setting-item-control">
					<select
						class="dropdown"
						bind:value={$chosenSettingStore.dailyOpenOnWrite}
					>
						<option value={true}>Yes</option>
						<option value={false}>No</option>
					</select>
				</div>
			</div>
			<Suggest
				name="Clipped Entry Template - Daily"
				description="Choose the template to use as for the clipped entry in the daily 
			periodic note"
				initialValue={$chosenSettingStore.dailyEntryTemplateLocation}
				dataProvider={() => app.vault.getMarkdownFiles()}
				{onChange}
			/>
		</div>
	{/if}
</div>
