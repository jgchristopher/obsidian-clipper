<script lang="ts">
	import type { App } from 'obsidian';
	import { slide } from 'svelte/transition';
	import Suggest from './components/Suggest.svelte';
	import { settings } from './settingsstore';

	export let app: App;
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
						What header should highlight data be prepended/appended under in
						your daily note?
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
						Would you like to prepend clippings to the top of the section or
						append them to the bottom of the section?
					</div>
				</div>
				<div class="setting-item-control">
					<select class="dropdown" bind:value={$settings.weeklyPosition}>
						<option value="prepend">prepend</option>
						<option value="append">append</option>
					</select>
				</div>
			</div>
			<Suggest
				initialValue={$settings.weeklyEntryTemplateLocation}
				dataProvider={() => app.vault.getMarkdownFiles()}
				onChange={(entry) => ($settings.weeklyEntryTemplateLocation = entry)}
			/>
		</div>
	{/if}
</div>
