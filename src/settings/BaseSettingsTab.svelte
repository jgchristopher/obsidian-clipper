<script lang="ts">
	import type { App } from 'obsidian';
	import { ClipperType, type ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';
	import Suggest from './components/TemplateSuggest.svelte';
	import SettingItem from './components/SettingItem.svelte';

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
	{#if $settings.type === ClipperType.CANVAS}
		<div class="setting-item mod-toggle">
			<div class="setting-item-info">
				<h1 class="setting-item-name">Canvas Entry</h1>
			</div>
		</div>
	{/if}
	<div class="clp_section_margin">
		{#if $settings.type !== ClipperType.CANVAS}
			<SettingItem>
				<span slot="name">Note Header</span>
				<span slot="description">
					What header should highlight data be prepended/appended under? <br
					/>(Don't include the '#')
				</span>
				<input
					slot="control"
					type="text"
					bind:value={$settings.heading}
					spellcheck="false"
					placeholder=""
				/>
			</SettingItem>

			<SettingItem>
				<span slot="name">Note Position</span>
				<span slot="description"
					>Prepend clippings to the top of the section or append them to the
					bottom of the section?</span
				>
				<select slot="control" class="dropdown" bind:value={$settings.position}>
					<option value="prepend">prepend</option>
					<option value="append">append</option>
				</select>
			</SettingItem>
		{/if}

		<SettingItem>
			<span slot="name">Open Note After Adding Clipping?</span>
			<span slot="description"></span>
			<select
				slot="control"
				class="dropdown"
				bind:value={$settings.openOnWrite}
			>
				<option value={true}>Yes</option>
				<option value={false}>No</option>
			</select>
		</SettingItem>

		<Suggest
			name="Clipped Entry Template"
			description="Choose the template to use as for the clipped entry"
			initialValue={$settings.entryTemplateLocation}
			dataProvider={() => app.vault.getMarkdownFiles()}
			{onChange}
		>
			<a
				slot="message"
				href="https://raw.githubusercontent.com/jgchristopher/obsidian-clipper/main/docs/example-template.md"
				>Template Example</a
			>
		</Suggest>
	</div>

	<div class="clp_section_margin">
		<SettingItem>
			<span slot="name">Tags</span>
			<span slot="description">Tags to add to captured highlights?</span>
			<input
				slot="control"
				type="text"
				bind:value={$settings.tags}
				spellcheck="false"
				placeholder="tags,seperated,by,commas"
			/>
		</SettingItem>

		<SettingItem>
			<span slot="name">Time Format</span>
			<div slot="description">
				<div>
					Format to use for the &#123&#123 time &#125&#125 template in
					clippings. See
				</div>
				<a href="https://momentjs.com/docs/#/displaying/format/"
					>format reference</a
				>
			</div>
			<input
				slot="control"
				type="text"
				bind:value={$settings.timestampFormat}
				spellcheck="false"
				placeholder="HH:mm"
			/>
		</SettingItem>

		<SettingItem>
			<span slot="name">Date Format</span>
			<div slot="description">
				<div>
					Format to use for the &#123&#123 date &#125&#125 template in
					clippings. See
				</div>
				<a href="https://momentjs.com/docs/#/displaying/format/"
					>format reference</a
				>
			</div>
			<input
				slot="control"
				type="text"
				bind:value={$settings.dateFormat}
				spellcheck="false"
				placeholder="MM/DD/YY"
			/>
		</SettingItem>
	</div>
</div>
