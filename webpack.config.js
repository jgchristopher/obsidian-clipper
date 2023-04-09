/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

module.exports = {
	entry: './src/build/bookmarkletcode/index.js',
	output: {
		path: path.resolve(__dirname, './src/build/bookmarkletcode/dist/'),
		filename: 'bookmarklet.js',
	},
	mode: 'production',
};
