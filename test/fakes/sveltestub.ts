/**
 * Stand-ins for Svelte components and `mount`, for unit specs that import
 * plugin code which mounts components. Vitest resolves `svelte` to its
 * server build, where mount() throws, and cannot compile .svelte files
 * without a Svelte plugin. Use as vi.mock factories:
 *
 *   vi.mock('svelte', async () =>
 *     (await import('../test/fakes/sveltestub')).svelteMock());
 *   vi.mock('./Foo.svelte', async () =>
 *     (await import('../test/fakes/sveltestub')).stub('Foo'));
 *
 * The built bundle is covered with the real Svelte runtime in
 * test/bundle.spec.ts.
 */
export const mounted: { name: string; props: Record<string, unknown> }[] = [];

type StubComponent = (() => void) & { stubName: string };

export function stub(name: string) {
	const component: StubComponent = Object.assign(() => undefined, {
		stubName: name,
	});
	return { default: component };
}

export function svelteMock() {
	return {
		mount(
			component: Partial<StubComponent>,
			options: { props?: Record<string, unknown> } = {}
		) {
			mounted.push({
				name: component.stubName ?? 'unknown',
				props: options.props ?? {},
			});
			return {};
		},
		unmount() {},
	};
}
