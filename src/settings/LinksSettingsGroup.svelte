<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';

	import BookmarkletSettingsGroup from './BookmarkletSettingsGroup.svelte';
	import ExtensionSettingsGroup from './ExtensionSettingsGroup.svelte';
	import type { ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';

	export let settings: Writable<ObsidianClipperSettings>;

	let clipperHref = new BookmarketlGenerator(
		$settings.clipperId,
		$settings.vaultName,
		$settings.notePath,
		$settings.headingLevel,
		$settings.captureComments.toString()
	).generateBookmarklet();

	let updateClipperHref = () => {
		clipperHref = new BookmarketlGenerator(
			$settings.clipperId,
			$settings.vaultName,
			$settings.notePath,
			$settings.headingLevel,
			$settings.captureComments.toString()
		).generateBookmarklet();
	};
</script>

<div class="clp_section_margin">
	<BookmarkletSettingsGroup {clipperHref} clipperName={$settings.name} />
	<ExtensionSettingsGroup {clipperHref} clipperName={$settings.name} />
</div>

<div class="clp_section_margin">
	<h1>Bookmarklet Settings</h1>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">Capture Comment in Browser</div>
			<div class="setting-item-description">
				Display a modal in the browser to capture any comments before sending to
				Obsidian?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="checkbox"
				bind:checked={$settings.captureComments}
				on:change={updateClipperHref}
			/>
		</div>
	</div>
</div>
