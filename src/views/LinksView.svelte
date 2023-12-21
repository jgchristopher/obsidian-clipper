<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';
	import { pluginSettings } from '../settings/settingsstore';
</script>

<h2>Clipper Bookmarklets</h2>
{#each $pluginSettings.clippers as clipper (clipper.clipperId)}
	<div class="px-4 py-2">
		<a
			href={new BookmarketlGenerator(
				clipper.clipperId,
				clipper.vaultName,
				clipper.notePath,
				clipper.markdownSettings,
				clipper.captureComments.toString()
			).generateBookmarklet()}>{clipper.name}</a
		>
	</div>
{/each}
