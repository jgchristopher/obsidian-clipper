<script lang="ts">
	import Notice from './Notice.svelte';
	import ModalComponent from './components/ModalComponent.svelte';
	import { Modal, type App } from 'obsidian';
	import { pluginSettings } from './settingsstore';
	import { propertyStore } from 'svelte-writable-derived';
	import { get } from 'svelte/store';
	import { createPopperActions } from 'svelte-popperjs';
	import {
		DEFAULT_CLIPPER_SETTING,
		type ObsidianClipperSettings,
		ClipperType,
	} from './types';
	import { deepmerge } from 'deepmerge-ts';
	import { randomUUID } from 'crypto';
	import moment from 'moment';

	export let app: App;
	const noticeText =
		'Lost on how to get started? Check out the new documentation website';

	let addClipperName: string;
	let addClipperType: ClipperType;
	const ALL_TYPES = [
		ClipperType.DAILY,
		ClipperType.WEEKLY,
		ClipperType.TOPIC,
		ClipperType.CANVAS,
	];

	const [popperRef, popperContent] = createPopperActions({
		placement: 'left-end',
		strategy: 'fixed',
	});

	const extraOpts = {
		modifiers: [
			{ name: 'offset', options: { offset: [0, 5] } },
			{
				name: 'preventOverflow',
				options: {
					padding: 4,
				},
			},
		],
	};

	let showAddClipperPopup = false;

	const plusButtonClicked = () => (showAddClipperPopup = !showAddClipperPopup);

	const cancelAdd = () => {
		showAddClipperPopup = false;
		addClipperName = '';
	};

	const addClipper = () => {
		console.log('Adding a Clipper');
		let clipperPlaceholderSettings = deepmerge({}, DEFAULT_CLIPPER_SETTING);
		clipperPlaceholderSettings.clipperId = randomUUID();
		clipperPlaceholderSettings.name = addClipperName;
		clipperPlaceholderSettings.type = addClipperType;
		$pluginSettings.clippers.push(clipperPlaceholderSettings);
		$pluginSettings = $pluginSettings; //eslint-disable-line
		showAddClipperPopup = false;
		addClipperName = '';
	};

	const handleClick = (id: string) => {
		console.log(id);

		let settingsIndex = $pluginSettings.clippers.findIndex(
			(c) => c.clipperId === id
		);
		if (settingsIndex !== -1) {
			const settingsStore = propertyStore(pluginSettings, [
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
		$pluginSettings.clippers = $pluginSettings.clippers.filter(
			(c: ObsidianClipperSettings) => c.clipperId !== id
		);
		$pluginSettings = $pluginSettings; //eslint-disable-line
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
	<button use:popperRef on:click={plusButtonClicked}> + </button>
	{#if showAddClipperPopup}
		<div class="addPopOver" use:popperContent={extraOpts}>
			<div class="clp_section_margin">
				<h1>Add New Clipper</h1>
				<div class="setting-item">
					<div class="setting-item-info">
						<div class="setting-item-name">Clipper Name</div>
						<div class="setting-item-description">Name of the new clipper?</div>
					</div>
					<div class="setting-item-control">
						<input
							type="text"
							bind:value={addClipperName}
							spellcheck="false"
							placeholder="Daily Clipper"
						/>
					</div>
				</div>
			</div>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">Clipper Type</div>
					<div class="setting-item-description">
						What type of note are you clipping to?
					</div>
				</div>
				<div class="setting-item-control">
					<select bind:value={addClipperType}>
						<option value="">Select Clipper Type</option>
						{#each ALL_TYPES as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="setting-item">
				<div class="setting-item-control">
					<button on:click={() => cancelAdd()}>Cancel</button>

					<button on:click={() => addClipper()}>Add Clipper</button>
				</div>
			</div>

			<div id="arrow" data-popper-arrow />
		</div>
	{/if}
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
					{#each $pluginSettings.clippers as clipper}
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

<style>
	.addPopOver {
		border-radius: var(--modal-radius);
		border: var(--modal-border-width) solid var(--modal-border-color);
		padding: 2rem;
		background: var(--background-primary) !important;
		z-index: 100 !important;
	}
</style>
