<script lang="ts">
	import { createPopperActions } from 'svelte-popperjs';

	export let initialValue: string;
	//export let dataSet: TFile[];
	export let onChange;
	export let dataProvider;

	const [popperRef, popperContent] = createPopperActions({
		placement: 'bottom',
		strategy: 'fixed',
	});
	const extraOpts = {
		modifiers: [{ name: 'offset', options: { offset: [0, 5] } }],
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
			target.addClass('is-selected');
		}
	};

	const handleMouseOut = (e: MouseEvent) => {
		if (e && e.target) {
			const target = e.target;
			target.removeClass('is-selected');
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
		<div class="setting-item-name">Clipped Entry Template - Weekly</div>
		<div class="setting-item-description">
			Choose the file to use as a template for the clipped entry in the weekly
			periodic note
		</div>
	</div>
	<div class="setting-item-control">
		<input
			type="text"
			use:popperRef
			bind:value={initialValue}
			on:input={filterFiles}
			spellcheck="false"
		/>
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
