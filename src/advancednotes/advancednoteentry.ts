import { Notice, TFile, TFolder, type App } from "obsidian";
import { NoteEntry } from "src/abstracts/noteentry";
import { AppendWriter } from "src/periodicnotes/appendwriter";
import { SectionPosition } from "src/settings/types";

export class AdvancedNoteEntry extends NoteEntry {
  private storageFolder: string;

  constructor(app: App, storageFolder: string) {
    super(app, false, SectionPosition.APPEND, "");
    this.storageFolder = storageFolder;
  }

  async writeToAdvancedNoteStorage(
    hostName: string,
    data: string,
    url: string
  ) {
    const noteFilePath = `${this.storageFolder}/${hostName}.md`;
    const folder = this.app.vault.getAbstractFileByPath(this.storageFolder);
    let file = this.app.vault.getAbstractFileByPath(noteFilePath);

    const sectionHeader = window.moment().toISOString().replaceAll(":", "-");
    const entry = `\n# ${sectionHeader} \n ${data}\n[^1] \n\n [^1]: ${url}  \n`;

    if (!(file instanceof TFile)) {
      // create the file and write data
      if (!(folder instanceof TFolder)) {
        this.app.vault.createFolder(this.storageFolder);
        await new Promise((r) => setTimeout(r, 50));
      }
      file = await this.app.vault.create(noteFilePath, entry);
    } else {
      new AppendWriter(this.app, this.openFileOnWrite).write(file, entry);
    }
    // Wait for the new note or note data to be available then return
    await new Promise((r) => setTimeout(r, 50));

    if (!file) {
      const errorMessage = `Unable to create clipper storage file. Most likely ${this.storageFolder} doesn't exist and we were unable to create it.`;

      console.error(errorMessage);
      new Notice(errorMessage);
      throw Error(errorMessage);
    }

    return `![[${this.storageFolder}/${hostName}#${sectionHeader}|clipped]]`;
  }
}
