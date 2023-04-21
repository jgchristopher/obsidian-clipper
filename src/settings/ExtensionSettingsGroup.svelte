<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletgenerator';

	export let vaultName: string;

	let clipperHref = new BookmarketlGenerator(vaultName).generateBookmarklet();
	const extensionHref = `https://obsidianclipper.com/?name=${vaultName}&bookmarklet_code=${clipperHref}`;
</script>

<div class="clp_section_margin">
	<div>
		<div>This is where the extension link goes</div>
		<a href={extensionHref}
			>Generate Obsidian Clipper Chrome Extension ({vaultName})</a
		>
	</div>
</div>
