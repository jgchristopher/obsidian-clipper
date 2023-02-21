<script lang="ts">
	import type { TabItem } from './settingstypes';

	export let tabs: TabItem[];
	export let activeTabValue = 1;

	const handleClick = (tabValue: number) => (activeTabValue = tabValue);
</script>

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
{#each tabs as tab}
	{#if activeTabValue == tab.value}
		<div class="obs_clp_box">
			<svelte:component this={tab.component} {...tab.props} />
		</div>
	{/if}
{/each}

<style>
	.obs_clp_box {
		margin-bottom: 10px;
		padding: 40px;
		border: 1px solid #dee2e6;
		border-radius: 0 0 0.5rem 0.5rem;
		border-top: 0;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		padding-left: 0;
		margin-bottom: 0;
		list-style: none;
		border-bottom: 1px solid #dee2e6;
	}
	li {
		margin-bottom: -1px;
	}

	span {
		border: 1px solid transparent;
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
		display: block;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	span:hover {
		border-color: #e9ecef #e9ecef #dee2e6;
	}

	li.active > span {
		color: #495057;
		background-color: #fff;
		border-color: #dee2e6 #dee2e6 #fff;
	}
</style>
