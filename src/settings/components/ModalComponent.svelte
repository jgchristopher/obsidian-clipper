<script lang="ts">
	import type { App } from 'obsidian';
	import Tabs from '../Tabs.svelte';
	import type { TabItem } from '../sveltesettingstypes';
	import BaseSettingsTab from '../BaseSettingsTab.svelte';
	import TopicSettingsTab from '../TopicSettingsTab.svelte';
	import LinksSettingsGroup from '../LinksSettingsGroup.svelte';
	import AdvancedSettingsGroup from '../AdvancedSettingsGroup.svelte';
	import type { ObsidianClipperSettings } from '../types';
	import type { Writable } from 'svelte/store';
	import { pluginSettings } from '../settingsstore';

	export let app: App;
	export let settings: Writable<ObsidianClipperSettings>;

	const vaultName = app.vault.getName();

	let tabs: TabItem[] = [
		{
			label: 'Base',
			value: 1,
			component: BaseSettingsTab,
			props: {
				settings: settings,
				app: app,
			},
		},
		{
			label: 'Topic Note',
			value: 2,
			component: TopicSettingsTab,
			props: {
				settings: settings,
				app: app,
			},
		},
		{
			label: 'Browser',
			value: 3,
			component: LinksSettingsGroup,
			props: {
				settings: settings,
				vaultName: vaultName,
			},
		},
		{
			label: 'Advanced',
			value: 4,
			component: AdvancedSettingsGroup,
			props: {
				pluginSettings: pluginSettings,
				settings: settings,
				app: app,
			},
		},
	];
</script>

<div class="setting-item">
	<div class="setting-item-info">
		<div class="setting-item-name">Clipper Name</div>
		<div class="setting-item-description">A unique name for this clipper</div>
	</div>
	<div class="setting-item-control">
		<input
			type="text"
			bind:value={$settings.name}
			spellcheck="false"
			placeholder=""
		/>
	</div>
</div>

<Tabs {tabs} />
