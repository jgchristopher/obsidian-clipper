/**
 * Stand-in for Svelte components, which vitest cannot compile without a
 * Svelte plugin. Use as a vi.mock factory:
 *
 *   vi.mock('./Foo.svelte', async () =>
 *     (await import('../test/fakes/sveltestub')).stub('Foo'));
 */
export const mounted: { name: string; props: Record<string, unknown> }[] = [];

export function stub(name: string) {
	return {
		default: class {
			constructor(options: { props?: Record<string, unknown> } = {}) {
				mounted.push({ name, props: options.props ?? {} });
			}
			$destroy() {}
			$set() {}
		},
	};
}
