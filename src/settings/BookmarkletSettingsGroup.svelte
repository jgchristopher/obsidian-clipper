<script lang="ts">
	import { BookmarketlGenerator } from "src/bookmarkletgenerator";

	export let vaultName: string;
	let clipperHref = new BookmarketlGenerator(vaultName).generateBookmarklet();
</script>

<div>
	<div>
		You can drag or copy the link below to your browser bookmark bar. This
		bookmarklet will allow you to highlight information on the web and send
		it to obsidian
	</div>
	<a href={clipperHref}>Obsidian Clipper ({vaultName})</a>
</div>
