<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';
	import { settings } from './settingsstore';
	import { requestUrl } from 'obsidian';

	export let vaultName: string;
	let s3LinkContainer;

	let clipperHref = new BookmarketlGenerator(
		vaultName,
		'',
		$settings.markdownSettings
	).generateBookmarklet();

	async function getExtension() {
		const response = await requestUrl({
			url: 'https://obsidianclipper.com/api/extension',
			contentType: 'application/json',
			method: 'POST',
			body: JSON.stringify({
				name: vaultName,
				bookmarklet_code: clipperHref,
			}),
		});
		const s3Link = window.document.createElement('a');
		s3Link.href = response.json.data.link;
		s3Link.textContent = 'Download Chrome Extension';
		s3LinkContainer.replaceChildren(s3Link);
	}
</script>

<div class="clp_section_margin">
	<div>
		<div>
			Click the button below to download a Chrome-based extension for the {vaultName}
			vault
		</div>
		<div bind:this={s3LinkContainer}>
			<button on:click={getExtension}>Chrome Extension ({vaultName})</button>
		</div>
	</div>
</div>
