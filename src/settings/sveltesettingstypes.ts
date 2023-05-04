import type { SvelteComponent } from 'svelte';

export type TabItem = {
	label: string;
	value: number;
	component: typeof SvelteComponent; // new (...args: unknown[]) => SvelteComponent;
	props?: Record<string, unknown>;
};
