<script lang="ts">
	import type { App } from 'obsidian';
	import TopicSettingsGroup from './TopicSettingsGroup.svelte';
	import type { ObsidianClipperSettings } from './types';
	import type { Writable } from 'svelte/store';

	export let app: App;
	export let settings: Writable<ObsidianClipperSettings>;
</script>

<TopicSettingsGroup {app} {settings} />
