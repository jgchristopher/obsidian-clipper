import type { SvelteComponent } from 'svelte';

export type TabItem = {
	label: string;
	value: number;
	component: SvelteComponent;
	props?: Record<string, unknown>;
};
