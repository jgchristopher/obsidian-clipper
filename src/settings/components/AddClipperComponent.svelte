<script lang="ts">
	import { createPopperActions } from 'svelte-popperjs';
	import { ClipperType, DEFAULT_CLIPPER_SETTING } from '../types';
	import { deepmerge } from 'deepmerge-ts';
	import { randomUUID } from 'crypto';
	import { pluginSettings } from '../settingsstore';

	let addClipperName: string;
	let addClipperType: ClipperType;
	const ALL_TYPES = [
		ClipperType.DAILY,
		ClipperType.WEEKLY,
		ClipperType.TOPIC,
		ClipperType.CANVAS,
	];

	const [popperRef, popperContent] = createPopperActions({
		placement: 'left-start',
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

	const plusButtonClicked = () => {
		showAddClipperPopup = !showAddClipperPopup;
	};

	const addClipper = () => {
		let clipperPlaceholderSettings = deepmerge({}, DEFAULT_CLIPPER_SETTING);
		clipperPlaceholderSettings.clipperId = randomUUID();
		clipperPlaceholderSettings.name = addClipperName;
		clipperPlaceholderSettings.type = addClipperType;
		$pluginSettings.clippers.push(clipperPlaceholderSettings);
		$pluginSettings = $pluginSettings; //eslint-disable-line
		showAddClipperPopup = false;
		addClipperName = '';
	};
</script>

<button use:popperRef on:click={plusButtonClicked}>
	{@html showAddClipperPopup ? '&#215;' : '+'}
</button>
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
				<button on:click={() => addClipper()}>Add Clipper</button>
			</div>
		</div>

		<div id="arrow" data-popper-arrow />
	</div>
{/if}

<style>
	.addPopOver {
		border-radius: var(--modal-radius);
		border: var(--modal-border-width) solid var(--modal-border-color);
		padding: 1rem;
		background: var(--background-primary) !important;
		z-index: 100 !important;
	}
</style>
