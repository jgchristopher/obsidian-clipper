import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
	plugins: [],
	resolve: {
		alias: {
			src: path.resolve('./src'),
			// `obsidian` ships types only; tests run against a runtime mock.
			obsidian: path.resolve('./test/mocks/obsidian.ts'),
		},
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
	},
});
