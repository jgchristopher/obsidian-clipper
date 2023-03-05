/* DO NOT EDIT THIS IS GENERATED CODE */
export class BookmarketlGenerator {
  vaultName: string;
  notePath: string;
  constructor(vaultName: string) {
    this.vaultName = vaultName;
    this.notePath = '';
  }
  public generateBookmarklet(): string {
    return `javascript:(function()%7B!function(n%2Ce)%7Bvar%20t%2Co%2Cc%2Ca%2Ci%3DencodeURIComponent(%22${this.vaultName}%22)%2Cd%3DencodeURIComponent(%22${this.notePath}%22)%3Bt%3Ddocument.URL%2Co%3Ddocument.title%2Cc%3Dfunction()%7Bvar%20n%3D%22%22%3Bif(void%200!%3D%3Dwindow.getSelection)%7Bvar%20e%3Dwindow.getSelection()%3Bif(e%26%26e.rangeCount)%7Bfor(var%20t%3Ddocument.createElement(%22div%22)%2Co%3D0%2Cc%3De.rangeCount%3Bo%3Cc%3B%2B%2Bo)t.appendChild(e.getRangeAt(o).cloneContents())%3Bn%3Dt.innerHTML%7D%7Dreturn%20n%7D()%2Ca%3D%22obsidian%3A%2F%2Fobsidian-clipper%3Fvault%3D%22.concat(i%2C%22%26notePath%3D%22).concat(d%2C%22%26url%3D%22).concat(encodeURIComponent(t)%2C%22%26title%3D%22).concat(encodeURIComponent(o)%2C%22%26format%3Dhtml%26highlightdata%3D%22).concat(encodeURIComponent(c))%2Cdocument.location.href%3Da%7D()%3B%7D)()`;
  }
  
  public generateNoteBookmarklet(noteName:string): string {
    this.notePath = noteName;
    return `javascript:(function()%7B!function(n%2Ce)%7Bvar%20t%2Co%2Cc%2Ca%2Ci%3DencodeURIComponent(%22${this.vaultName}%22)%2Cd%3DencodeURIComponent(%22${this.notePath}%22)%3Bt%3Ddocument.URL%2Co%3Ddocument.title%2Cc%3Dfunction()%7Bvar%20n%3D%22%22%3Bif(void%200!%3D%3Dwindow.getSelection)%7Bvar%20e%3Dwindow.getSelection()%3Bif(e%26%26e.rangeCount)%7Bfor(var%20t%3Ddocument.createElement(%22div%22)%2Co%3D0%2Cc%3De.rangeCount%3Bo%3Cc%3B%2B%2Bo)t.appendChild(e.getRangeAt(o).cloneContents())%3Bn%3Dt.innerHTML%7D%7Dreturn%20n%7D()%2Ca%3D%22obsidian%3A%2F%2Fobsidian-clipper%3Fvault%3D%22.concat(i%2C%22%26notePath%3D%22).concat(d%2C%22%26url%3D%22).concat(encodeURIComponent(t)%2C%22%26title%3D%22).concat(encodeURIComponent(o)%2C%22%26format%3Dhtml%26highlightdata%3D%22).concat(encodeURIComponent(c))%2Cdocument.location.href%3Da%7D()%3B%7D)()`;
  }
}