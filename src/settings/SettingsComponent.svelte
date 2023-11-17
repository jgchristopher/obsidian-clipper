<script lang="ts">
	import Notice from './Notice.svelte';
	import ModalComponent from './components/ModalComponent.svelte';
	import { Modal, type App } from 'obsidian';
	import { settings } from './settingsstore';
	import { propertyStore } from 'svelte-writable-derived';
	import { get } from 'svelte/store';
	import { DEFAULT_DAILY_NOTE_SETTING } from './types';
	import { deepmerge } from 'deepmerge-ts';
	import { randomUUID } from 'crypto';

	export let app: App;
	const noticeText =
		'Lost on how to get started? Check out the new documentation website';

	const addClipper = () => {
		console.log('Adding a Clipper');
		let clipperPlaceholderSettings = deepmerge({}, DEFAULT_DAILY_NOTE_SETTING);
		clipperPlaceholderSettings.clipperId = randomUUID();
		$settings.clippers.push(clipperPlaceholderSettings);
		$settings = $settings;
	};

	const handleClick = (id: string) => {
		console.log(id);

		let settingsIndex = $settings.clippers.findIndex((c) => c.clipperId === id);
		if (settingsIndex !== -1) {
			const settingsStore = propertyStore(settings, [
				'clippers',
				settingsIndex,
			]);
			const settingsScreen = new Modal(this.app);
			settingsScreen.titleEl.createEl('h2', {
				text: get(settingsStore).name,
			});

			new ModalComponent({
				target: settingsScreen.contentEl,
				props: {
					app: app,
					settings: settingsStore,
				},
			});

			settingsScreen.open();
		}
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
<p class="text-sm font-semibold leading-6">
	<span on:keypress={() => addClipper()} on:click={() => addClipper()}>
		+ New Clipper
	</span>
</p>
<ul class="divide-y divide-gray-100 space-y-3">
	{#each $settings.clippers as clipper}
		<li class="flex justify-between gap-x-3 py-3 overflow-hidden px-3 shadow">
			<div class="min-w-0">
				<div class="flex items-start gap-x-1">
					<p class="text-sm font-semibold leading-6">
						{clipper.name}
					</p>
				</div>
				<div
					class="mt-1 flex items-center gap-x-1 text-xs leading-5 text-gray-500"
				>
					<p class="whitespace-nowrap">
						Created on <time datetime={moment(clipper.createdAt).toISOString()}
							>{moment(clipper.createdAt).format('MMMM DD, YYYY')}</time
						>
					</p>
					<svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
						<circle cx="1" cy="1" r="1" />
					</svg>
				</div>
			</div>
			<div class="flex flex-none items-center gap-x-4">
				<span
					on:keypress={() => handleClick(clipper.clipperId)}
					on:click={() => handleClick(clipper.clipperId)}
					class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
					>Edit</span
				>
			</div>
			<hr />
		</li>
	{/each}
</ul>
