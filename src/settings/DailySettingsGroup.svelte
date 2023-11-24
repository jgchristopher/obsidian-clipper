<script lang="ts">
	import type { App } from 'obsidian';
	import Suggest from './components/TemplateSuggest.svelte';
	import { ClipperType, type ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';

	export let app: App;
	export let settings: Writable<ObsidianClipperSettings>;
	const onChange = (entry: string) => {
		$settings.entryTemplateLocation = entry;
	};
</script>

<div class="clp_section_margin">
	{#if $settings.type === ClipperType.DAILY}
		<div class="setting-item mod-toggle">
			<div class="setting-item-info">
				<h1 class="setting-item-name">Daily Note Entry</h1>
			</div>
		</div>
	{/if}
	{#if $settings.type === ClipperType.WEEKLY}
		<div class="setting-item mod-toggle">
			<div class="setting-item-info">
				<h1 class="setting-item-name">Weekly Note Entry</h1>
			</div>
		</div>
	{/if}
	{#if $settings.type === ClipperType.TOPIC}
		<div class="setting-item mod-toggle">
			<div class="setting-item-info">
				<h1 class="setting-item-name">Topic Note Entry</h1>
			</div>
		</div>
	{/if}
	<div class="clp_section_margin">
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">Note Header</div>
				<div class="setting-item-description">
					What header should highlight data be prepended/appended under? <br
					/>(Don't include the '#')
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="text"
					bind:value={$settings.heading}
					spellcheck="false"
					placeholder=""
				/>
			</div>
		</div>
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">Note Position</div>
				<div class="setting-item-description">
					Prepend clippings to the top of the section or append them to the
					bottom of the section?
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
			description="Choose the template to use as for the clipped entry"
			initialValue={$settings.entryTemplateLocation}
			dataProvider={() => app.vault.getMarkdownFiles()}
			{onChange}
		/>
	</div>
	<div class="clp_section_margin">
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">Tags</div>
				<div class="setting-item-description">
					Tags to add to captured highlights?
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="text"
					bind:value={$settings.tags}
					spellcheck="false"
					placeholder="tags,seperated,by,commas"
				/>
			</div>
		</div>
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">Time Format</div>
				<div class="setting-item-description">
					<div>
						Format to use for the &#123&#123 time &#125&#125 template in
						clippings. See
					</div>
					<a href="https://momentjs.com/docs/#/displaying/format/"
						>format reference</a
					>
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="text"
					bind:value={$settings.timestampFormat}
					spellcheck="false"
					placeholder="HH:mm"
				/>
			</div>
		</div>
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">Date Format</div>
				<div class="setting-item-description">
					<div>
						Format to use for the &#123&#123 date &#125&#125 template in
						clippings. See
					</div>
					<a href="https://momentjs.com/docs/#/displaying/format/"
						>format reference</a
					>
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="text"
					bind:value={$settings.dateFormat}
					spellcheck="false"
					placeholder="MM/DD/YY"
				/>
			</div>
		</div>
	</div>
</div>
