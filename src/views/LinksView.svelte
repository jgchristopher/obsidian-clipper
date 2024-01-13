<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';
	import { ShortcutLinkGenerator } from 'src/shortcutslink/ShortcutLinkGenerator';
	import { pluginSettings } from '../settings/settingsstore';
	import type { ObsidianClipperSettings } from 'src/settings/types';
	import { Notice } from 'obsidian';

	const onBookmarkletClick = (clipper: ObsidianClipperSettings) => {
		navigator.clipboard.writeText(
			new BookmarketlGenerator(
				clipper.clipperId,
				clipper.vaultName,
				clipper.notePath,
				clipper.markdownSettings,
				clipper.captureComments.toString()
			).generateBookmarklet()
		);
		new Notice(`${clipper.name} Bookmarklet copied to clipboard.`);
	};

	const onShortcutClick = (clipper: ObsidianClipperSettings) => {
		navigator.clipboard.writeText(
			new ShortcutLinkGenerator(
				clipper.clipperId,
				clipper.vaultName
			).generateShortcutLink()
		);
		new Notice(`${clipper.name} Shortcut link copied to clipboard.`);
	};
</script>

<h2>Clipper Bookmarklets</h2>
{#each $pluginSettings.clippers as clipper (clipper.clipperId)}
	<h4>{clipper.name}</h4>
	<div class="px-4 py-2">
		<li>
			<a
				href="#top"
				on:keypress={() => onBookmarkletClick(clipper)}
				on:click={() => onBookmarkletClick(clipper)}
			>
				Bookmarklet
			</a>
		</li>
		<li>
			<a
				href="#top"
				on:keypress={() => onShortcutClick(clipper)}
				on:click={() => onShortcutClick(clipper)}
			>
				Shortcuts URL
			</a>
		</li>
	</div>
{/each}
