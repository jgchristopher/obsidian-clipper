// Get contents of bookmarklet file

const fs = require('fs');
const bookmarkletFilePath = './src/bookmarklet/obsidian-clipper.min.js';
const bookmarkletGeneratorFilePath = './src/bookmarkletgenerator.ts';
const bookmarkletGeneratorTemplate = `/* DO NOT EDIT THIS IS GENERATED CODE */
export class BookmarketlGenerator {
  vaultName: string;
  notePath: string;
  constructor(vaultName: string) {
    this.vaultName = vaultName;
    this.notePath = '';
  }
  public generateBookmarklet(): string {
    return \`~BookmarkletReplace~\`;
  }
  
  public generateNoteBookmarklet(noteName:string): string {
    this.notePath = noteName;
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

	const bookmarketGenerator = bookmarkletGeneratorTemplate.replaceAll(
		'~BookmarkletReplace~',
		bookmarkletData
	);

	fs.writeFileSync(bookmarkletGeneratorFilePath, bookmarketGenerator);
} catch (err) {
	console.error(err);
}
