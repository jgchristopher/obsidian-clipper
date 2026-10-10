<script lang="ts">
	import { createPopperActions } from 'svelte-popperjs';
	import { ClipperType, DEFAULT_CLIPPER_SETTING } from '../types';
	import { pluginSettings } from '../settingsstore';

	export let vaultName: string;
	let addClipperName = '';
	let addClipperType: ClipperType | '' = '';
	const ALL_TYPES = [
		ClipperType.DAILY,
		ClipperType.WEEKLY,
		ClipperType.TOPIC,
		ClipperType.CANVAS,
	];

	const [popperRef, popperContent] = createPopperActions({
		placement: 'left-start',
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

	// A clipper without a type writes nothing, so require both fields.
	$: canAddClipper = addClipperName.trim() !== '' && addClipperType !== '';

	const plusButtonClicked = () => {
		showAddClipperPopup = !showAddClipperPopup;
	};

	const addClipper = () => {
		const name = addClipperName.trim();
		if (name === '' || addClipperType === '') {
			return;
		}
		let clipperPlaceholderSettings = structuredClone(DEFAULT_CLIPPER_SETTING);
		clipperPlaceholderSettings.clipperId = crypto.randomUUID();
		clipperPlaceholderSettings.name = name;
		clipperPlaceholderSettings.type = addClipperType;
		clipperPlaceholderSettings.vaultName = vaultName;
		$pluginSettings.clippers.push(clipperPlaceholderSettings);
		$pluginSettings = $pluginSettings;
		showAddClipperPopup = false;
		addClipperName = '';
		addClipperType = '';
	};
</script>

<button use:popperRef on:click={plusButtonClicked}>
	{@html showAddClipperPopup ? '&#215;' : '+'}
</button>
{#if showAddClipperPopup}
	<div class="addPopOver" use:popperContent={extraOpts}>
		<div class="clp_section_margin">
			<div class="setting-item setting-item-heading">
				<div class="setting-item-info">
					<div class="setting-item-name">Add New Clipper</div>
				</div>
			</div>
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
			<div class="setting-item-info">
				{#if !canAddClipper}
					<div class="setting-item-description">
						Enter a name and choose a type to add a clipper.
					</div>
				{/if}
			</div>
			<div class="setting-item-control">
				<button disabled={!canAddClipper} on:click={() => addClipper()}
					>Add Clipper</button
				>
			</div>
		</div>

		<div id="arrow" data-popper-arrow></div>
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
