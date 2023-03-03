// Get contents of bookmarklet file

const fs = require('fs');
const bookmarkletFilePath = './src/bookmarklet/obsidian-clipper.min.js';
const bookmarkletGeneratorFilePath = './src/bookmarkletgenerator.ts';
const bookmarkletGeneratorTemplate = `/* DO NOT EDIT THIS IS GENERATED CODE */
export class BookmarketlGenerator {
  vaultName: string;
  constructor(vaultName: string) {
    this.vaultName = vaultName;
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
  const bookmarketGenerator = bookmarkletGeneratorTemplate.replace(
    '~BookmarkletReplace~',
    bookmarkletData
  );
  fs.writeFileSync(bookmarkletGeneratorFilePath, bookmarketGenerator);
} catch (err) {
  console.error(err);
}
