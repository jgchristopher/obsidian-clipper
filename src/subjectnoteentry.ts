import { App, TFile, Notice, TAbstractFile } from 'obsidian';
import type { ClippedNoteEntry } from './clippednoteentry';
import { AppendWriter } from './periodicnotes/appendwriter';

export class SubjectNoteEntry {
  protected app: App;
  protected notice: string;
  protected openFileOnWrite: boolean;
  protected template: string;

  constructor(app: App, openFileOnWrite: boolean, template: string) {
    this.app = app;
    this.openFileOnWrite = openFileOnWrite;
    this.template = template;
    this.notice = 'Wrote to Subject Note';
  }

  async writeToNote(file: TAbstractFile | null, noteEntry: ClippedNoteEntry) {
    if (file) {
      this.handleWrite(
        file.path,
        await noteEntry.formattedEntry(this.template)
      );
    }
  }

  private async handleWrite(noteFilePath: string, data: string) {
    const file = this.app.vault.getAbstractFileByPath(noteFilePath);
    if (file instanceof TFile) {
      new AppendWriter(this.app, this.openFileOnWrite).write(file, data);
    } else {
      new Notice(`Obsidian Clipper couldn't find the note to write to`);
    }
  }
}
