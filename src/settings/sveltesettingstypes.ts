import type { Component } from 'svelte';

export type TabItem = {
	label: string;
	value: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- tabs take differing props
	component: Component<any>;
	props?: Record<string, unknown>;
};
