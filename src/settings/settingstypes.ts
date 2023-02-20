import type { SvelteComponent } from 'svelte';

export interface TabItem {
	label: string;
	value: number;
	component: SvelteComponent;
	props?: Record<string, unknown>;
}
