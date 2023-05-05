<script lang="ts">
	import DailySettingsGroup from './DailySettingsGroup.svelte';
	import WeeklySettingsGroup from './WeeklySettingsGroup.svelte';
	import CommonSettingsGroup from './CommonSettingsGroup.svelte';
	import type { App } from 'obsidian';

	export let app: App;
</script>

<DailySettingsGroup {app} />
<WeeklySettingsGroup {app} />
<CommonSettingsGroup />
