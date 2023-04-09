// Get contents of bookmarklet file

const fs = require('fs');
const bookmarkletFilePath = './src/bookmarklet/obsidian-clipper.min.js';
const bookmarkletGeneratorFilePath = './src/bookmarkletgenerator.ts';
const bookmarkletGeneratorTemplate = `
/**
* DO NOT EDIT THIS IS GENERATED CODE!
* 
*
* SERIOUSLY! STOP GOING TO THIS FILE AND EDITING IT AND WONDERING WHY IT ISN'T WORKING :)
**/
export class BookmarketlGenerator {
  vaultName: string;
  notePath: string;
  h1Setting: string; 
  constructor(vaultName: string, notePath = '', h1Setting: string ) {
    this.vaultName = vaultName;
    this.notePath = notePath;
    this.h1Setting = h1Setting;
  }
  public generateBookmarklet(): string {
    return \`~BookmarkletReplace~\`;
  }
 
}`;

try {
	let bookmarkletData = fs.readFileSync(bookmarkletFilePath, 'utf8');

	bookmarkletData = bookmarkletData.replace(
		'~VaultNameFiller~',
		'${this.vaultName}'
	);

	bookmarkletData = bookmarkletData.replace('~NotePath~', '${this.notePath}');

	bookmarkletData = bookmarkletData.replace('~H1Setting~', '${this.h1Setting}');

	const bookmarketGenerator = bookmarkletGeneratorTemplate.replaceAll(
		'~BookmarkletReplace~',
		bookmarkletData
	);

	fs.writeFileSync(bookmarkletGeneratorFilePath, bookmarketGenerator);
} catch (err) {
	console.error(err);
}
