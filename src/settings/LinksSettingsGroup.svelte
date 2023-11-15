<script lang="ts">
	import { settings } from './settingsstore';
	import { getFileName } from 'src/utils/fileutils';
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';

	import BookmarkletSettingsGroup from './BookmarkletSettingsGroup.svelte';
	import ExtensionSettingsGroup from './ExtensionSettingsGroup.svelte';
	import { propertyStore } from 'svelte-writable-derived';

	export let vaultName = '';

	export let filePath = '';
	let chosenSettingStore = propertyStore(settings, ['clippers', 0]);

	let fileName = '';

	if (filePath !== '') {
		fileName = getFileName(filePath);
	}

	let noteOrVault = fileName !== '' ? `${fileName} file` : `${vaultName} vault`;
	let clipperHref = new BookmarketlGenerator(
		vaultName,
		filePath,
		$chosenSettingStore.markdownSettings,
		(
			$chosenSettingStore.experimentalBookmarkletComment &&
			$chosenSettingStore.captureComments
		).toString()
	).generateBookmarklet();

	let updateClipperHref = () => {
		clipperHref = new BookmarketlGenerator(
			vaultName,
			filePath,
			$chosenSettingStore.markdownSettings,
			(
				$chosenSettingStore.experimentalBookmarkletComment &&
				$chosenSettingStore.captureComments
			).toString()
		).generateBookmarklet();
	};
</script>

<div class="clp_section_margin">
	<BookmarkletSettingsGroup {clipperHref} {noteOrVault} />
	<ExtensionSettingsGroup {clipperHref} {noteOrVault} />
</div>

<div class="clp_section_margin">
	<h1>Bookmarklet Settings</h1>
	{#if $chosenSettingStore.experimentalBookmarkletComment}
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">Capture Comment in Browser</div>
				<div class="setting-item-description">
					Display a modal in the browser to capture any comments before sending
					to Obsidian?
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="checkbox"
					bind:checked={$chosenSettingStore.captureComments}
					on:change={updateClipperHref}
				/>
			</div>
		</div>
	{/if}
	<div class="setting-item">
		<div class="setting-item-info">
			<h1 class="setting-item-name">Markdown Headings</h1>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H2</div>
			<div class="setting-item-description">
				What should replace H2 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$chosenSettingStore.markdownSettings.h2}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H3</div>
			<div class="setting-item-description">
				What should replace H3 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$chosenSettingStore.markdownSettings.h3}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H4</div>
			<div class="setting-item-description">
				What should replace H4 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$chosenSettingStore.markdownSettings.h4}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H5</div>
			<div class="setting-item-description">
				What should replace H5 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$chosenSettingStore.markdownSettings.h5}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">H6</div>
			<div class="setting-item-description">
				What should replace H6 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$chosenSettingStore.markdownSettings.h6}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
</div>
