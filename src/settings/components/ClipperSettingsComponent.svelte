<script lang="ts">
	import type { App } from 'obsidian';
	import Tabs from '../Tabs.svelte';
	import type { TabItem } from '../sveltesettingstypes';
	import BaseSettingsTab from '../BaseSettingsTab.svelte';
	import LinksSettingsGroup from '../LinksSettingsGroup.svelte';
	import AdvancedSettingsGroup from '../AdvancedSettingsGroup.svelte';
	import { pluginSettings } from '../settingsstore';
	import { propertyStore } from 'svelte-writable-derived';
	import { ClipperType } from '../types';
	import Suggest from './TemplateSuggest.svelte';

	export let app: App;
	export let settingsIndex: number;

	const settings = propertyStore(pluginSettings, ['clippers', settingsIndex]);

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

	const onChange = (entry: string) => {
		$settings.notePath = entry;
	};
</script>

{#if $settings}
	<!-- Gross Hack -->
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
	{#if $settings.type === ClipperType.TOPIC || $settings.type === ClipperType.CANVAS}
		<Suggest
			name="Topic Note"
			description="Choose the note/canvas to add clipped entries to"
			initialValue={$settings.notePath}
			dataProvider={() => app.vault.getMarkdownFiles()}
			{onChange}
		/>
	{/if}

	<Tabs {tabs} />
{/if}
