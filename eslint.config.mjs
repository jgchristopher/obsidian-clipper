import { defineConfig, globalIgnores } from 'eslint/config';
import obsidianmd from 'eslint-plugin-obsidianmd';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const { disableTypeChecked } = tseslint.configs;

// Obsidian review rules only apply to code that runs inside Obsidian.
const obsidianRulesOff = Object.fromEntries(
	[
		...Object.keys(obsidianmd.rules ?? {}).map((r) => `obsidianmd/${r}`),
		'@microsoft/sdl/no-inner-html',
		'no-unsanitized/property',
		'@typescript-eslint/no-restricted-imports',
		'depend/ban-dependencies',
	].map((rule) => [rule, 'off'])
);

export default defineConfig([
	globalIgnores([
		'main.js',
		// Build output and generated code
		'src/build/bookmarkletcode/dist/',
		'src/build/bookmarkletcode/**/*.js',
		'src/bookmarkletlink/bookmarkletgenerator.ts',
	]),

	// Plugin code: Obsidian's review rules (includes eslint and
	// typescript-eslint type-checked recommended configs).
	...obsidianmd.configs.recommended,
	{
		files: ['**/*.ts', '**/*.mts'],
		languageOptions: {
			globals: { ...globals.browser },
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.mjs', '*.js', '*.mts'],
				},
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
			// TypeScript reports undefined names itself; no-undef misfires on
			// DOM and ambient types.
			'no-undef': 'off',
		},
	},

	// Svelte components: syntax-level linting only; type-aware rules need
	// the Svelte language service.
	...svelte.configs['flat/recommended'].map((config) => ({
		...config,
		files: ['**/*.svelte'],
	})),
	{
		files: ['**/*.svelte'],
		languageOptions: {
			globals: { ...globals.browser },
			parserOptions: {
				...disableTypeChecked.languageOptions.parserOptions,
				parser: tseslint.parser,
				extraFileExtensions: ['.svelte'],
			},
		},
		rules: disableTypeChecked.rules,
	},

	// The bookmarklet runs in web pages, not Obsidian. `alert` is its UI.
	{
		files: ['src/build/**/*.ts'],
		languageOptions: disableTypeChecked.languageOptions,
		rules: {
			...disableTypeChecked.rules,
			...obsidianRulesOff,
			'no-alert': 'off',
		},
	},

	// Node build scripts.
	{
		files: [
			'*.js',
			'*.mjs',
			'*.mts',
			'src/**/*.js',
			'src/**/*.mjs',
			'testing/**/*.mjs',
		],
		languageOptions: {
			globals: { ...globals.node },
			...disableTypeChecked.languageOptions,
		},
		rules: {
			...disableTypeChecked.rules,
			...obsidianRulesOff,
			'@typescript-eslint/no-require-imports': 'off',
			// Node scripts use fetch; requestUrl only exists inside Obsidian.
			'no-restricted-globals': 'off',
		},
	},

	// Tests exercise plugin code from Node with DOM fixtures and mocks.
	{
		files: ['test/**/*.ts', 'src/**/*.spec.ts'],
		languageOptions: { globals: { ...globals.node } },
		rules: {
			...obsidianRulesOff,
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-implied-eval': 'off',
		},
	},
]);
