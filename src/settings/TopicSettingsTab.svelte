<script lang="ts">
	import type { App } from 'obsidian';
	import TopicSettingsGroup from './TopicSettingsGroup.svelte';

	export let app: App;
</script>

<TopicSettingsGroup {app} />
