<script lang="ts">
	import DailySettingsGroup from './DailySettingsGroup.svelte';
	import WeeklySettingsGroup from './WeeklySettingsGroup.svelte';
	import CommonSettingsGroup from './CommonSettingsGroup.svelte';
	import BookmarkletSettingsGroup from './BookmarkletSettingsGroup.svelte';

	export let vaultName: string;
</script>

<DailySettingsGroup />
<WeeklySettingsGroup />
<CommonSettingsGroup />
<BookmarkletSettingsGroup {vaultName} />
