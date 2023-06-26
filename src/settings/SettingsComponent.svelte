<script lang="ts">
	import BaseSettingsTab from './BaseSettingsTab.svelte';
	import type { TabItem } from './sveltesettingstypes';
	import Tabs from './Tabs.svelte';
	import Notice from './Notice.svelte';
	import type { App } from 'obsidian';
	import TopicSettingsTab from './TopicSettingsTab.svelte';
	import LinksSettingsGroup from './LinksSettingsGroup.svelte';
	import AdvancedSettingsGroup from './AdvancedSettingsGroup.svelte';

	export let app: App;
	const noticeText =
		'Check out the new Chrome-based browser Extension on the Browser setting tab! That is also where you will find the Bookmarklet link for your vault.';

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
			label: 'Browser',
			value: 3,
			component: LinksSettingsGroup,
			props: {
				app: app,
			},
		},
		{
			label: 'Advanced',
			value: 4,
			component: AdvancedSettingsGroup,
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
