<script lang="ts">
	import { BookmarketlGenerator } from 'src/bookmarkletlink/bookmarkletgenerator';
	import { settings } from './settingsstore';
	import { requestUrl } from 'obsidian';

	export let vaultName: string;
	export let filePath = '';
	export let fileName = '';

	console.log(fileName);

	let noteOrVault = fileName !== '' ? `${fileName} file` : `${vaultName} vault`;

	let s3LinkContainer: HTMLElement;

	let clipperHref = new BookmarketlGenerator(
		vaultName,
		filePath,
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
			Click the button below to generate a personalized Chrome-based extension
			for {noteOrVault}. After clickin the button, use the link displayed to
			download the .zip file.
		</div>
		<div class="my-4" bind:this={s3LinkContainer}>
			<button on:click={getExtension}>Chrome Extension ({noteOrVault})</button>
		</div>
	</div>
</div>
