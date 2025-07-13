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
		'~HeaderLevelBase~',
		'${this.headingLevel}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H1Setting~',
		'${"#".repeat(this.headingLevel + 1)}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H2Setting~',
		'${"#".repeat(this.headingLevel + 2)}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H3Setting~',
		'${"#".repeat(this.headingLevel + 3)}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H4Setting~',
		'${"#".repeat(this.headingLevel + 4)}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H5Setting~',
		'${"#".repeat(this.headingLevel + 5)}'
	);

	bookmarkletData = bookmarkletData.replace(
		'~H6Setting~',
		'${"#".repeat(this.headingLevel + 5)}'
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
