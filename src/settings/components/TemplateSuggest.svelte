<script lang="ts">
	import { createPopperActions } from 'svelte-popperjs';

	export let name: string;
	export let description: string;
	export let initialValue: string;
	export let onChange: (string: string) => void;

	export let dataProvider: () => any[]; // eslint-disable-line

	const [popperRef, popperContent] = createPopperActions({
		placement: 'bottom-start',
		strategy: 'fixed',
	});
	const extraOpts = {
		modifiers: [
			{ name: 'offset', options: { offset: [0, 5] } },
			{
				name: 'sameWidth',
				enabled: true,
				// eslint-disable-next-line
				fn: ({ state, instance }: any) => {
					const targetWidth = `${state.rects.reference.width}px`;
					if (state.styles.popper.width === targetWidth) {
						return;
					}
					state.styles.popper.width = targetWidth;
					instance.update();
				},
				phase: 'beforeWrite',
				requires: ['computeStyles'],
			},
		],
	};

	let templateOptions: string[] = [];

	$: if (!initialValue) {
		templateOptions = [];
	}

	const setInputVal = (templateOption: string) => {
		templateOptions = [];
		initialValue = templateOption;
		onChange(templateOption);
	};

	// eslint-disable-next-line
	const handleMouseOver = (e: MouseEvent) => {
		if (e && e.target) {
			const target = e.target;
			(target as HTMLElement).addClass('is-selected'); // eslint-disable-line
		}
	};

	// eslint-disable-next-line
	const handleMouseOut = (e: MouseEvent) => {
		if (e && e.target) {
			const target = e.target;
			(target as HTMLElement).removeClass('is-selected'); // eslint-disable-line
		}
	};

	const filterFiles = () => {
		let storageArr: string[] = [];
		dataProvider().forEach((file) => {
			if (initialValue) {
				if (file.path.toLowerCase().startsWith(initialValue.toLowerCase())) {
					storageArr = [...storageArr, file.path];
				}
			} else {
				storageArr = [...storageArr, file.path];
			}
		});
		templateOptions = storageArr;
	};
</script>

<div class="setting-item align-start">
	<div class="setting-item-info">
		<div class="setting-item-name">{name}</div>
		<div class="setting-item-description">
			{description}
			{#if $$slots.message}
				<slot name="message" />
			{/if}
		</div>
	</div>
</div>
<div class="setting-item-control">
	<div class="search_input">
		<input
			type="text"
			use:popperRef
			bind:value={initialValue}
			on:input={filterFiles}
			spellcheck="false"
			class="search_input"
			on:focusin={filterFiles}
		/>
	</div>
	{#if templateOptions.length > 0}
		<div class="suggestion-container" use:popperContent={extraOpts}>
			<div class="suggestion">
				<div
					class="suggestion-item"
					on:keydown
					on:focus
					on:blur
					on:click={() => setInputVal('')}
					on:mouseover={handleMouseOver}
					on:mouseout={handleMouseOut}
				>
					None
				</div>
				{#each templateOptions as templateOption}
					<div
						class="suggestion-item"
						on:keydown
						on:focus
						on:blur
						on:click={() => setInputVal(templateOption)}
						on:mouseover={handleMouseOver}
						on:mouseout={handleMouseOut}
					>
						{templateOption}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.search_input {
		width: calc(100% - 20px);
	}

	.suggestion-container {
		text-align: left;
	}
</style>
