<script lang="ts">
	import type { App } from 'obsidian';
	import { ClipperType, type ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';
	import Suggest from './components/TemplateSuggest.svelte';
	import SettingItem from './components/SettingItem.svelte';

	export let app: App;
	export let settings: Writable<ObsidianClipperSettings>;

	const headings: Record<ClipperType, string> = {
		[ClipperType.DAILY]: 'Daily Note Entry',
		[ClipperType.WEEKLY]: 'Weekly Note Entry',
		[ClipperType.TOPIC]: 'Topic Note Entry',
		[ClipperType.CANVAS]: 'Canvas Entry',
	};

	const onChange = (entry: string) => {
		$settings.entryTemplateLocation = entry;
	};
</script>

<div class="clp_section_margin">
	<div class="setting-item setting-item-heading">
		<div class="setting-item-info">
			<div class="setting-item-name">{headings[$settings.type]}</div>
		</div>
	</div>
	{#if $settings.type === ClipperType.CANVAS}
		<div class="setting-item-description">
			Canvas clippers add each clipping as a card under a card for its website.
		</div>
	{:else}
		<div class="clp_section_margin">
			<SettingItem>
				<span slot="name">Header</span>
				<span slot="description">
					The heading to add clippings under, without the #. It must be at the
					Header Level below. If it's missing, it is added at the end of the
					note (append) or the top (prepend). Leave empty to add clippings at
					the end or top of the note.
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
				<span slot="name">Header Level</span>
				<span slot="description">What level of heading to use?</span>
				<select
					slot="control"
					class="dropdown"
					bind:value={$settings.headingLevel}
				>
					<option value={1}>#</option>
					<option value={2}>##</option>
					<option value={3}>###</option>
					<option value={4}>####</option>
					<option value={5}>#####</option>
				</select>
			</SettingItem>

			<SettingItem>
				<span slot="name">Position</span>
				<span slot="description"
					>Prepend clippings to the top of the section or append them to the
					bottom of the section?</span
				>
				<select slot="control" class="dropdown" bind:value={$settings.position}>
					<option value="prepend">prepend</option>
					<option value="append">append</option>
				</select>
			</SettingItem>

			<SettingItem>
				<span slot="name">Focus Note After Adding Clipping?</span>
				<span slot="description"
					>Should this note take focus in Obsidian after adding the clipping to
					the note?</span
				>
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
				<span slot="description">Tags to add to captured clippings?</span>
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
	{/if}
</div>
