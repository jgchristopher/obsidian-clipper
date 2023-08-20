<script lang="ts">
	import { settings } from './settingsstore';
	import { getFileName } from 'src/utils/fileutils';
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';

	import BookmarkletSettingsGroup from './BookmarkletSettingsGroup.svelte';
	import ExtensionSettingsGroup from './ExtensionSettingsGroup.svelte';

	export let vaultName = '';

	export let filePath = '';
	let fileName = '';

	if (filePath !== '') {
		fileName = getFileName(filePath);
	}

	let noteOrVault = fileName !== '' ? `${fileName} file` : `${vaultName} vault`;
	let clipperHref = new BookmarketlGenerator(
		vaultName,
		filePath,
		$settings.markdownSettings,
		(
			$settings.experimentalBookmarkletComment && $settings.captureComments
		).toString()
	).generateBookmarklet();

	let updateClipperHref = () => {
		clipperHref = new BookmarketlGenerator(
			vaultName,
			filePath,
			$settings.markdownSettings,
			(
				$settings.experimentalBookmarkletComment && $settings.captureComments
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
	{#if $settings.experimentalBookmarkletComment}
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
					bind:checked={$settings.captureComments}
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
			<div class="setting-item-name">H1</div>
			<div class="setting-item-description">
				What should replace H1 elements found in the highlight data?
			</div>
		</div>
		<div class="setting-item-control">
			<input
				type="text"
				bind:value={$settings.markdownSettings.h1}
				spellcheck="false"
				placeholder=""
			/>
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
				bind:value={$settings.markdownSettings.h2}
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
				bind:value={$settings.markdownSettings.h3}
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
				bind:value={$settings.markdownSettings.h4}
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
				bind:value={$settings.markdownSettings.h5}
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
				bind:value={$settings.markdownSettings.h6}
				spellcheck="false"
				placeholder=""
			/>
		</div>
	</div>
</div>
