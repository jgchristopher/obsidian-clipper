<script lang="ts">
	import BaseSettingsTab from './BaseSettingsTab.svelte';
	import MarkdownSettingsTab from './MarkdownSettingsTab.svelte';
	import type { TabItem } from './settingstypes';
	import Tabs from './Tabs.svelte';

	export let vaultName: string;

	let tabs: TabItem[] = [
		{
			label: 'Base Settings',
			value: 1,
			component: BaseSettingsTab,
			props: {
				vaultName: vaultName,
			},
		},
		{
			label: 'Markdown Settings',
			value: 2,
			component: MarkdownSettingsTab,
		},
	];
</script>

<Tabs {tabs} />
