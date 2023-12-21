//@ts-ignore
/* eslint @typescript-eslint/no-var-requires: "off" */
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
import type { ObsidianClipperMarkdownSettings } from 'src/settings/types';

export class BookmarketlGenerator {
	clipperId: string;
  vaultName: string;
  markdownSettings: ObsidianClipperMarkdownSettings; 
	captureComments: string;  
constructor(clipperId: string, vaultName: string, notePath = '', markdownSettings: ObsidianClipperMarkdownSettings, captureComments: string ) {
		this.clipperId = clipperId;
    this.vaultName = vaultName;
    this.markdownSettings = markdownSettings;
		this.captureComments = captureComments;
  }
  public generateBookmarklet(): string {
    return \`~BookmarkletReplace~\`;
  }
 
}`;

try {
	let bookmarkletData = fs.readFileSync(bookmarkletFilePath, 'utf8');

	bookmarkletData = bookmarkletData.replace(
		'~ClipperIdFiller~',
		'${this.clipperId}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~VaultNameFiller~',
		'${this.vaultName}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H1Setting~',
		'${this.markdownSettings.h1}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H2Setting~',
		'${this.markdownSettings.h2}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H3Setting~',
		'${this.markdownSettings.h3}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H4Setting~',
		'${this.markdownSettings.h4}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H5Setting~',
		'${this.markdownSettings.h5}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H6Setting~',
		'${this.markdownSettings.h6}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~CaptureComment~',
		'${this.captureComments}'
	);

	const bookmarketGenerator = bookmarkletGeneratorTemplate.replaceAll(
		'~BookmarkletReplace~',
		bookmarkletData
	);

	fs.writeFileSync(bookmarkletGeneratorFilePath, bookmarketGenerator);
} catch (err) {
	console.error(err);
}
