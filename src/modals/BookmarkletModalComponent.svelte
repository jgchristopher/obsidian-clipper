<script lang="ts">
	import ExtensionSettingsGroup from 'src/settings/ExtensionSettingsGroup.svelte';
	import Notice from 'src/settings/Notice.svelte';

	export let noticeText: string;
	export let vaultName: string;
	export let filePath = '';
	export let fileName = '';
</script>

<div class="clp_section_margin">
	{#if noticeText}
		<Notice>
			<span slot="noticeText">
				{noticeText}
			</span>
		</Notice>
	{/if}

	<ExtensionSettingsGroup {vaultName} {filePath} {fileName} />
</div>
