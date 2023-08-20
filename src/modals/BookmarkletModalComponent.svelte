<script lang="ts">
	import Notice from 'src/settings/Notice.svelte';
	import LinksSettingsGroup from 'src/settings/LinksSettingsGroup.svelte';

	export let noticeText: string;
	export let vaultName: string;
	export let filePath = '';
</script>

<div class="clp_section_margin">
	{#if noticeText}
		<Notice>
			<span slot="noticeText">
				{noticeText}
			</span>
		</Notice>
	{/if}

	<LinksSettingsGroup {vaultName} {filePath} />
</div>
