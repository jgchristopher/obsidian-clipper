<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';
	import { getFileName } from 'src/utils/fileutils';

	import { settings } from './settingsstore';

	export let vaultName: string;
	export let filePath = '';

	let linkDisplay = vaultName;
	if (filePath !== '') {
		linkDisplay = getFileName(filePath);
	}

	let clipperHref = new BookmarketlGenerator(
		vaultName,
		filePath,
		$settings.markdownSettings
	).generateBookmarklet();
</script>

<div class="clp_section_margin">
	<div class="flex flex-row">
		<div class="flex-1 basis-0">
			<div>
				You can drag or copy the link below to your browser bookmark bar. This
				bookmarklet will allow you to highlight information on the web and send
				it to obsidian
			</div>
			<a href={clipperHref}>Obsidian Clipper ({linkDisplay})</a>
		</div>
	</div>
</div>
