/** @type {import('tailwindcss').Config} */
module.exports = {
	prefix: 'clp-',
	content: [
		'./src/modals/*.svelte',
		'./src/settings/*.svelte',
		'./src/settings/components/migratetopicnote/*.svelte',
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
