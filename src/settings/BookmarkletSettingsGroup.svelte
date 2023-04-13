<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';
	import { settings } from './settingsstore';

	export let vaultName: string;
	let clipperHref = new BookmarketlGenerator(
		vaultName,
		'',
		$settings.markdownSettings
	).generateBookmarklet();
</script>

<div>
	<div>
		You can drag or copy the link below to your browser bookmark bar. This
		bookmarklet will allow you to highlight information on the web and send it
		to obsidian
	</div>
	<a href={clipperHref}>Obsidian Clipper ({vaultName})</a>
</div>
