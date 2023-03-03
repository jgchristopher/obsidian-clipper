<script lang="ts">
	import DailySettingsGroup from './DailySettingsGroup.svelte';
	import WeeklySettingsGroup from './WeeklySettingsGroup.svelte';
	import CommonSettingsGroup from './CommonSettingsGroup.svelte';
	import BookmarkletSettingsGroup from './BookmarkletSettingsGroup.svelte';
	import type { App } from 'obsidian';

	export let app: App;
	const vaultName = app.vault.getName();
</script>

<DailySettingsGroup {app} />
<WeeklySettingsGroup {app} />
<CommonSettingsGroup />
<BookmarkletSettingsGroup {vaultName} />
