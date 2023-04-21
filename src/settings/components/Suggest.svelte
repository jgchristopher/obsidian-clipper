<script lang="ts">
	import { createPopperActions } from 'svelte-popperjs';

	export let name: string;
	export let description: string;
	export let initialValue: string;
	export let onChange: (string: string) => void;

	export let dataProvider: () => any[];

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

	const handleMouseOver = (e: MouseEvent) => {
		if (e && e.target) {
			const target = e.target;
			(target as HTMLElement).addClass('is-selected');
		}
	};

	const handleMouseOut = (e: MouseEvent) => {
		if (e && e.target) {
			const target = e.target;
			(target as HTMLElement).removeClass('is-selected');
		}
	};

	const filterFiles = () => {
		let storageArr: string[] = [];
		if (initialValue) {
			dataProvider().forEach((file) => {
				if (file.path.toLowerCase().startsWith(initialValue.toLowerCase())) {
					storageArr = [...storageArr, file.path.toLowerCase()];
				}
			});
		}
		templateOptions = storageArr;
	};
</script>

<div class="setting-item align-start">
	<div class="setting-item-info">
		<div class="setting-item-name">{name}</div>
		<div class="setting-item-description">
			{description}
		</div>
	</div>
</div>
<div class="setting-item">
	<div class="setting-item-control">
		<div class="search_input">
			<input
				type="text"
				use:popperRef
				bind:value={initialValue}
				on:input={filterFiles}
				spellcheck="false"
				class="search_input"
			/>
		</div>
		{#if templateOptions.length > 0}
			<div class="suggestion-container" use:popperContent={extraOpts}>
				<div class="suggestion">
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
</div>

<style>
	.search_input {
		width: calc(100% - 20px);
	}

	.suggestion-container {
		text-align: left;
	}
</style>
