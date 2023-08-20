<script lang="ts">
	import { requestUrl } from 'obsidian';

	export let clipperHref: string;
	export let noteOrVault: string;
	// eslint-disable-next-line
	let s3LinkContainer: HTMLElement;

	const getExtension = async () => {
		const response = await requestUrl({
			url: 'https://obsidianclipper.com/api/extension',
			contentType: 'application/json',
			method: 'POST',
			body: JSON.stringify({
				name: noteOrVault,
				bookmarklet_code: clipperHref,
			}),
		});

		// eslint-disable-next-line
		const s3Link = window.document.createElement('a');
		s3Link.href = response.json.data.link;
		s3Link.textContent = 'Download Chrome Extension';
		s3LinkContainer.replaceChildren(s3Link);
	};
</script>

<div class="clp_section_margin">
	<div>
		<div>
			Click the button below to generate a personalized Chrome-based extension
			for the <span class="font-extrabold">{noteOrVault}</span>. After clicking
			the button, use the link to download the .zip file.
		</div>
		<div class="my-4" bind:this={s3LinkContainer}>
			<button on:click={getExtension}>Chrome Extension ({noteOrVault})</button>
		</div>
	</div>
</div>
