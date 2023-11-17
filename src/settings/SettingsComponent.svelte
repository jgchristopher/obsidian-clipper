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
		$settings = $settings; //eslint-disable-line
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

	const handleDelete = (id: string) => {
		console.log('Deleting: ', id);
		$settings.clippers = $settings.clippers.filter((c) => c.clipperId !== id);
		$settings = $settings; //eslint-disable-line
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

<div class="flex flex-row-reverse text-sm font-semibold leading-6">
	<button on:keypress={() => addClipper()} on:click={() => addClipper()}>
		+ New Clipper
	</button>
</div>

<div class="px-4 sm:px-6 lg:px-8">
	<div class="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle">
			<table class="min-w-full border-separate border-spacing-0">
				<thead>
					<tr>
						<th scope="col" class="sticky top-0 z-10 text-left">Name</th>
						<th scope="col" class="sticky top-0 z-10 text-left">Created On</th>
						<th scope="col" class="sticky top-0 z-10 text-left" />
					</tr>
				</thead>
				<tbody>
					{#each $settings.clippers as clipper}
						<tr>
							<td>{clipper.name}</td>
							<td class="py-4 pl-4 text-sm"
								><p>
									Created on <time
										datetime={moment(clipper.createdAt).toISOString()}
									>
										{moment(clipper.createdAt).format('MMMM DD, YYYY')}
									</time>
								</p>
							</td>

							<td>
								<button
									on:keypress={() => handleClick(clipper.clipperId)}
									on:click={() => handleClick(clipper.clipperId)}
									>Edit
								</button>
								{#if $settings.clippers.length > 1}
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
