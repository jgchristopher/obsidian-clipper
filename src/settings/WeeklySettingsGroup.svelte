<script lang="ts">
	import type { App } from 'obsidian';
	import { slide } from 'svelte/transition';
	import Suggest from './components/TemplateSuggest.svelte';
	import type { ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';

	export let app: App;
	export let settings: Writable<ObsidianClipperSettings>;

	const onChange = (entry: string) =>
		($settings.weeklyEntryTemplateLocation = entry);
</script>

<div class="clp_section_margin">
	<div class="setting-item mod-toggle">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Weekly Note Entry</h1>
		</div>
		<div class="setting-item-control">
			<label
				class="checkbox-container"
				class:is-enabled={$settings.useWeeklyNote}
			>
				<input type="checkbox" bind:checked={$settings.useWeeklyNote} />
			</label>
		</div>
	</div>
	{#if $settings.useWeeklyNote}
		<div in:slide|local={{ duration: 300 }} out:slide|local={{ duration: 300 }}>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Weekly Note Header</div>
					<div class="setting-item-description">
						What header should highlight data be prepended/appended under in the
						weekly note?
					</div>
				</div>
				<div class="setting-item-control">
					<input
						type="text"
						bind:value={$settings.weeklyNoteHeading}
						spellcheck="false"
						placeholder=""
					/>
				</div>
			</div>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Weekly Note Position</div>
					<div class="setting-item-description">
						Prepend clippings to the top of the section or append them to the
						bottom of the section?
					</div>
				</div>
				<div class="setting-item-control">
					<select class="dropdown" bind:value={$settings.weeklyPosition}>
						<option value="prepend">prepend</option>
						<option value="append">append</option>
					</select>
				</div>
			</div>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Open Note After Adding Clipping?</div>
					<div class="setting-item-description">
						Open the weekly note after adding the clipping?
					</div>
				</div>
				<div class="setting-item-control">
					<select class="dropdown" bind:value={$settings.weeklyOpenOnWrite}>
						<option value={true}>Yes</option>
						<option value={false}>No</option>
					</select>
				</div>
			</div>
			<Suggest
				name="Clipped Entry Template - Weekly"
				description="Choose the template to use as for the clipped entry in the weekly
			periodic note"
				initialValue={$settings.weeklyEntryTemplateLocation}
				dataProvider={() => app.vault.getMarkdownFiles()}
				{onChange}
			/>
		</div>
	{/if}
</div>
