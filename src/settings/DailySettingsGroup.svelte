<script lang="ts">
	import type { App } from 'obsidian';
	import { slide } from 'svelte/transition';
	import Suggest from './components/TemplateSuggest.svelte';
	import { settings } from './settingsstore';

	export let app: App;
	const onChange = (entry: string) => {
		$settings.dailyEntryTemplateLocation = entry;
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
				class:is-enabled={$settings.useDailyNote}
			>
				<input type="checkbox" bind:checked={$settings.useDailyNote} />
			</label>
		</div>
	</div>
	{#if $settings.useDailyNote}
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
						bind:value={$settings.dailyNoteHeading}
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
					<select class="dropdown" bind:value={$settings.dailyPosition}>
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
					<select class="dropdown" bind:value={$settings.dailyOpenOnWrite}>
						<option value={true}>Yes</option>
						<option value={false}>No</option>
					</select>
				</div>
			</div>
			<Suggest
				name="Clipped Entry Template - Daily"
				description="Choose the template to use as for the clipped entry in the daily 
			periodic note"
				initialValue={$settings.dailyEntryTemplateLocation}
				dataProvider={() => app.vault.getMarkdownFiles()}
				{onChange}
			/>
		</div>
	{/if}
</div>
