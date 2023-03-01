<script lang="ts">
	import type { App } from 'obsidian';
	import { slide } from 'svelte/transition';
	import { settings } from './settingsstore';
	import TemplateOption from './TemplateOption.svelte';

	export let app: App;

	let templateOptions: string[] = [];

	let searchInput; // use with bind:this to focus element

	$: if (!$settings.weeklyEntryTemplateLocation) {
		templateOptions = [];
	}

	const filterFiles = () => {
		let storageArr: string[] = [];
		if ($settings.weeklyEntryTemplateLocation) {
			app.vault.getMarkdownFiles().forEach((file) => {
				if (
					file.path
						.toLowerCase()
						.startsWith($settings.weeklyEntryTemplateLocation.toLowerCase())
				) {
					storageArr = [...storageArr, file.path.toLowerCase()];
				}
			});
		}
		templateOptions = storageArr;
	};

	const setInputVal = (templateOption: string) => {
		debugger;
		templateOptions = [];
		$settings.weeklyEntryTemplateLocation = templateOption;
	};
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
		</div>
		<div class="setting-item items-start">
			<div class="setting-item-info">
				<div class="setting-item-name">Clipped Entry Template - Weekly</div>
				<div class="setting-item-description">
					Choose the file to use as a template for the clipped entry in the
					weekly periodic note
				</div>
			</div>
			<div class="setting-item-control autocomplete">
				<input
					type="text"
					bind:this={searchInput}
					bind:value={$settings.weeklyEntryTemplateLocation}
					on:input={filterFiles}
					spellcheck="false"
				/>
				<!--FILTERED LIST OF COUNTRIES -->
				{#if templateOptions.length > 0}
					<ul id="autocomplete-items-list">
						{#each templateOptions as templateOption, i}
							<TemplateOption
								itemLabel={templateOption}
								on:click={() => setInputVal(templateOption)}
							/>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	div.autocomplete {
		/*the container must be positioned relative:*/
		position: relative;
		display: inline-block;
		/*width: 300px;*/
	}

	#autocomplete-items-list {
		position: relative;
		margin: 0;
		padding: 0;
		top: 0;
		border: 1px solid #ddd;
		background-color: #ddd;
		text-align: left;
		margin-top: 5px;
		width: calc(100% - 20px);
	}
</style>
