<script lang="ts">
	import type { App } from 'obsidian';
	import BookmarkletSettingsGroup from './BookmarkletSettingsGroup.svelte';
	import ExtensionSettingsGroup from './ExtensionSettingsGroup.svelte';

	export let app: App;
	const vaultName = app.vault.getName();
</script>

<div class="clp_section_margin">
	<BookmarkletSettingsGroup {vaultName} />
	<ExtensionSettingsGroup {vaultName} />
</div>
