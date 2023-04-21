<script lang="ts">
	import BaseSettingsTab from './BaseSettingsTab.svelte';
	import MarkdownSettingsTab from './MarkdownSettingsTab.svelte';
	import type { TabItem } from './sveltesettingstypes';
	import Tabs from './Tabs.svelte';
	import Notice from './Notice.svelte';
	import type { App } from 'obsidian';
	import TopicSettingsTab from './TopicSettingsTab.svelte';
	import LinksSettingsGroup from './LinksSettingsGroup.svelte';

	export let app: App;

	let tabs: TabItem[] = [
		{
			label: 'Base Settings',
			value: 1,
			component: BaseSettingsTab,
			props: {
				app: app,
			},
		},
		{
			label: 'Topic Note Settings',
			value: 2,
			component: TopicSettingsTab,
			props: {
				app: app,
			},
		},
		{
			label: 'Markdown Settings',
			value: 3,
			component: MarkdownSettingsTab,
		},
		{
			label: 'Bookmarklet & Extension',
			value: 4,
			component: LinksSettingsGroup,
			props: {
				app: app,
			},
		},
	];
</script>

<Notice />
<br />
<Tabs {tabs} />
