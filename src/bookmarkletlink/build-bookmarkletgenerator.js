//@ts-ignore
const fs = require('fs');
const bookmarkletFilePath =
	'./src/build/bookmarkletcode/dist/obsidian-clipper.min.js';
//'../build/bookmarkletcode/dist/obsidian-clipper.min.js';
const bookmarkletGeneratorFilePath =
	'./src/bookmarkletlink/bookmarkletgenerator.ts';
const bookmarkletGeneratorTemplate = `
/**
* DO NOT EDIT THIS IS GENERATED CODE!
* 
*
* SERIOUSLY! STOP GOING TO THIS FILE AND EDITING IT AND WONDERING WHY IT ISN'T WORKING :)
**/

export class BookmarketlGenerator {
	clipperId: string;
  vaultName: string;
	headingLevel: number;
	captureComments: string;  
constructor(clipperId: string, vaultName: string, notePath = '', headingLevel: number, captureComments: string ) {
		this.clipperId = clipperId;
    this.vaultName = vaultName;
    this.headingLevel = headingLevel;
		this.captureComments = captureComments;
  }
  public generateBookmarklet(): string {
    return \`~BookmarkletReplace~\`;
  }
 
}`;

/**
 * The minified bookmarklet is already percent-encoded, and each placeholder
 * sits inside a quoted string literal: `%22~VaultNameFiller~%22`. Replace the
 * whole literal, quotes included, with an expression that builds a JS string
 * literal with JSON.stringify and percent-encodes it. Browsers percent-decode
 * a javascript: URL before running it, so the bookmarklet sees the exact value
 * whatever quotes, backslashes, spaces, or % signs it contains.
 */
const placeholders = {
	'~ClipperIdFiller~': 'this.clipperId',
	'~VaultNameFiller~': 'this.vaultName',
	'~HeaderLevelBase~': 'this.headingLevel',
	'~CaptureComment~': 'this.captureComments',
};

try {
	let bookmarkletData = fs.readFileSync(bookmarkletFilePath, 'utf8');

	for (const [placeholder, value] of Object.entries(placeholders)) {
		const quotedLiteral = new RegExp(`(%22|%27|')${placeholder}\\1`, 'g');
		if (!quotedLiteral.test(bookmarkletData)) {
			throw new Error(
				`${placeholder} not found as a quoted string literal in ${bookmarkletFilePath}`
			);
		}
		bookmarkletData = bookmarkletData.replace(
			quotedLiteral,
			() => `\${encodeURIComponent(JSON.stringify(String(${value})))}`
		);
	}

	const bookmarketGenerator = bookmarkletGeneratorTemplate.replaceAll(
		'~BookmarkletReplace~',
		() => bookmarkletData
	);

	fs.writeFileSync(bookmarkletGeneratorFilePath, bookmarketGenerator);
} catch (err) {
	console.error(err);
	process.exitCode = 1;
}
