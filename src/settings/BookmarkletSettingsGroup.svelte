<script lang="ts">
	export let clipperHref: string;
	export let clipperName: string;
</script>

<div class="clp_section_margin">
	<div class="flex flex-row">
		<div class="flex-1 basis-0">
			<div>
				You can drag or copy the link below to your browser bookmark bar. This
				bookmarklet will allow you to highlight information on the web and send
				it to obsidian
			</div>
			<a href={clipperHref}>{clipperName}</a>
		</div>
	</div>
</div>
