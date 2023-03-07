const path = require('path');

module.exports = {
	entry: './src/bookmarklet/index.js',
	output: {
		path: path.resolve(__dirname, './src/bookmarklet/dist'),
		filename: 'bookmarklet.js',
	},
	mode: 'production',
};
