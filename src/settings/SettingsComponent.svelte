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
	const noticeText = 'Try out the new Chrome Extension creation service below.';

	let tabs: TabItem[] = [
		{
			label: 'Base',
			value: 1,
			component: BaseSettingsTab,
			props: {
				app: app,
			},
		},
		{
			label: 'Topic Note',
			value: 2,
			component: TopicSettingsTab,
			props: {
				app: app,
			},
		},
		{
			label: 'Markdown',
			value: 3,
			component: MarkdownSettingsTab,
		},
		{
			label: 'Browser',
			value: 4,
			component: LinksSettingsGroup,
			props: {
				app: app,
			},
		},
	];
</script>

<Notice>
	<span slot="noticeText">
		{noticeText}
	</span>
	<span slot="calloutLink">
		<a
			href="https://github.com/jgchristopher/obsidian-clipper#obsidian-clipper"
			class="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
		>
			Details
			<span aria-hidden="true"> &rarr;</span>
		</a>
	</span>
</Notice>
<br />
<Tabs {tabs} />
