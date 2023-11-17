<script lang="ts">
	import type { ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';

	export let settings: Writable<ObsidianClipperSettings>;
</script>

<div class="clp_section_margin">
	<h1>Common Settings</h1>
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
