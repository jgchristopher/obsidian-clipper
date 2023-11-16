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
<ul class="divide-y divide-gray-100 space-y-3">
	{#each $settings.clippers as clipper, i}
		<li class="flex items-center justify-between gap-x-6 py-5">
			<div class="min-w-0">
				<div class="flex items-start gap-x-3">
					<p class="text-sm font-semibold leading-6">
						<span
							on:keypress={() => handleClick(i)}
							on:click={() => handleClick(i)}
						>
							{clipper.name}
						</span>
					</p>
				</div>
				<div
					class="mt-1 flex items-center gap-x-1 text-xs leading-5 text-gray-500"
				>
					<p class="whitespace-nowrap">
						Due on <time datetime="2023-03-17T00:00Z">March 17, 2023</time>
					</p>
					<svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
						<circle cx="1" cy="1" r="1" />
					</svg>
					<p class="truncate">Created by Leslie Alexander</p>
				</div>
			</div>
			<div class="flex flex-none items-center gap-x-4">
				<a
					class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
					>View project</a
				>
			</div>
		</li>
	{/each}
	<li
		class="flex items-center justify-between gap-x-3 py-3 overflow-hidden rounded-md bg-white px-3 shadow"
	>
		<div class="min-w-0">
			<div class="flex items-start gap-x-1">
				<p class="text-sm font-semibold leading-6">
					<span
						on:keypress={() => handleClick(0)}
						on:click={() => handleClick(0)}
					>
						Default
					</span>
				</p>
			</div>
			<div
				class="mt-1 flex items-center gap-x-1 text-xs leading-5 text-gray-500"
			>
				<p class="whitespace-nowrap">
					Due on <time datetime="2023-03-17T00:00Z">March 17, 2023</time>
				</p>
				<svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
					<circle cx="1" cy="1" r="1" />
				</svg>
				<p class="truncate">Created by Leslie Alexander</p>
			</div>
		</div>
		<div class="flex flex-none items-center gap-x-4">
			<a
				class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
				>View project</a
			>
		</div>
	</li>
</ul>
<ul />
<br />
<Tabs {tabs} />
