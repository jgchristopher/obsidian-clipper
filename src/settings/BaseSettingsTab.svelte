<script lang="ts">
	import DailySettingsGroup from './DailySettingsGroup.svelte';
	import WeeklySettingsGroup from './WeeklySettingsGroup.svelte';
	import CommonSettingsGroup from './CommonSettingsGroup.svelte';
	import type { App } from 'obsidian';
	import type { ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';

	export let app: App;
	export let settings: Writable<ObsidianClipperSettings>;
</script>

<DailySettingsGroup {app} {settings} />
<WeeklySettingsGroup {app} {settings} />
<CommonSettingsGroup {settings} />
