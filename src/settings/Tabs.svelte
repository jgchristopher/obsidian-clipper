<script lang="ts">
	import type { TabItem } from './sveltesettingstypes';

	export let tabs: TabItem[];
	export let activeTabValue = 1;

	const handleClick = (tabValue: number) => (activeTabValue = tabValue);
</script>

<div class="clp-tabs">
	<div class="clp-tab-bar">
		<ul>
			{#each tabs as tab}
				<li class={activeTabValue === tab.value ? 'active' : ''}>
					<span
						on:keypress={() => handleClick(tab.value)}
						on:click={() => handleClick(tab.value)}>{tab.label}</span
					>
				</li>
			{/each}
		</ul>
	</div>
	{#each tabs as tab}
		{#if activeTabValue == tab.value}
			<div class="obs_clp_box">
				<svelte:component this={tab.component} {...tab.props} />
			</div>
		{/if}
	{/each}
</div>

<style>
	/* Fill the space the modal gives us: the tab bar stays fixed and only the
	   active tab's content scrolls. */
	.clp-tabs {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
	}
	.clp-tab-bar {
		flex-shrink: 0;
	}
	.obs_clp_box {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		margin-bottom: 10px;
		padding: 40px;
		border: 1px solid var(--tab-divider-color);
		border-radius: 0 0 0.5rem 0.5rem;
		border-top: 0;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		padding-left: 0;
		margin-bottom: 0;
		list-style: none;
		border-bottom: 1px solid var(--tab-divider-color);
	}

	span {
		border: 1px solid var(--tab-divider-color);
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
		display: block;
		padding: 0.5rem 1rem;
		cursor: pointer;
		color: var(--tab-text-color);
	}

	span:hover {
		border-color: #e9ecef #e9ecef #dee2e6;
		background-color: var(--background-modifier-hover);
		color: var(--tab-text-color-active);
	}

	li:hover {
		background-color: var(--background-modifier-hover);
	}

	li.active > span {
		background-color: var(--tab-background-active);
		border-color: #e9ecef #e9ecef #dee2e6;
		color: var(--tab-text-color-active);
	}
</style>
