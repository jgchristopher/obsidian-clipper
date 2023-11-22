<script lang="ts">
	import Notice from './Notice.svelte';
	import ModalComponent from './components/ModalComponent.svelte';
	import { Modal, type App } from 'obsidian';
	import { pluginSettings } from './settingsstore';
	import { propertyStore } from 'svelte-writable-derived';
	import moment from 'moment';
	import AddClipperComponent from './components/AddClipperComponent.svelte';
	import type { ObsidianClipperSettings } from './types';

	export let app: App;
	const noticeText =
		'Lost on how to get started? Check out the new documentation website';

	const handleClick = (id: string) => {
		console.log(id);

		let settingsIndex = $pluginSettings.clippers.findIndex(
			(c) => c.clipperId === id
		);
		if (settingsIndex !== -1) {
			editSetting(settingsIndex);
		}
	};

	const handleDelete = (id: string) => {
		const remainingClippers = $pluginSettings.clippers.filter(
			(c: ObsidianClipperSettings) => c.clipperId !== id
		);
		$pluginSettings.clippers = remainingClippers;
		pluginSettings.set($pluginSettings);
	};

	const editSetting = (settingsIndex: number) => {
		const settingsScreen = new Modal(this.app);
		settingsScreen.titleEl.createEl('h2', {
			text: 'Edit Clipper Settings',
		});

		new ModalComponent({
			target: settingsScreen.contentEl,
			props: {
				app: app,
				settingsIndex,
			},
		});

		settingsScreen.open();
	};

	const getSettingStore = (index: number) => {
		return propertyStore(pluginSettings, ['clippers', index]);
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

<div class="flex flex-row-reverse text-sm font-semibold leading-6 gap-2 pb-4">
	<AddClipperComponent />
</div>

<div class="px-4 sm:px-6 lg:px-8">
	<div class="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle">
			<table class="min-w-full border-separate border-spacing-0">
				<thead>
					<tr>
						<th scope="col" class="sticky top-0 z-10 text-center">Name</th>
						<th scope="col" class="sticky top-0 z-10 text-center">
							Created On
						</th>
						<th scope="col" class="sticky top-0 z-10 text-center" />
					</tr>
				</thead>
				<tbody>
					{#each $pluginSettings.clippers as clipper (clipper.clipperId)}
						<tr>
							<td class="text-center">{clipper.name}</td>
							<td class="py-4 pl-4 text-sm text-center">
								Created on <time
									datetime={moment(clipper.createdAt).toISOString()}
								>
									{moment(clipper.createdAt).format('MMMM DD, YYYY')}
								</time>
							</td>

							<td>
								<button
									on:keypress={() => handleClick(clipper.clipperId)}
									on:click={() => handleClick(clipper.clipperId)}
									>Edit
								</button>
								{#if $pluginSettings.clippers.length > 1}
									<button
										on:keypress={() => handleDelete(clipper.clipperId)}
										on:click={() => handleDelete(clipper.clipperId)}
										>Delete
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
