<script lang="ts">
	import BaseSettingsTab from './BaseSettingsTab.svelte';
	import type { TabItem } from './sveltesettingstypes';
	import Tabs from './Tabs.svelte';
	import Notice from './Notice.svelte';
	import type { App } from 'obsidian';
	import TopicSettingsTab from './TopicSettingsTab.svelte';
	import LinksSettingsGroup from './LinksSettingsGroup.svelte';
	import AdvancedSettingsGroup from './AdvancedSettingsGroup.svelte';
	import { settings } from './settingsstore';

	export let app: App;
	const vaultName = app.vault.getName();
	const noticeText =
		'Lost on how to get started? Check out the new documentation website';

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
				vaultName: vaultName,
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

	const handleClick = (settingsNumber: number) => {
		console.log(settingsNumber);
		// const settingsChosenStore = propertyStore(settings, [
		// 	'level2settings',
		// 	settingsNumber,
		// ]);
		// const settingsScreen = new Modal(this.app);
		// settingsScreen.titleEl.createEl('h2', {
		// 	text: get(settingsChosenStore).title,
		// });
		//
		// new ModalComponent({
		// 	target: settingsScreen.contentEl,
		// 	props: {
		// 		chosenSetting: settingsChosenStore,
		// 	},
		// });
		//
		// settingsScreen.open();
	};
</script>

<Notice>
	<span slot="noticeText">
		{noticeText}
	</span>
	<span slot="calloutLink">
		<a
			href="https://docs.obsidianclipper.com"
			class="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
		>
			Details
			<span aria-hidden="true"> &rarr;</span>
		</a>
	</span>
</Notice>
<br />
<ul>
	{#each $settings.clippers as clipper, i}
		<li>
			<span on:keypress={() => handleClick(i)} on:click={() => handleClick(i)}>
				{clipper.name}
			</span>
		</li>
	{/each}
</ul>
<br />
<Tabs {tabs} />
