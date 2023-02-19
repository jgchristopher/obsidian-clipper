import type { App, TFile } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  getAllDailyNotes,
  getDailyNote,
  createDailyNote,
} from "obsidian-daily-notes-interface";
import { PeriodicNoteEntry } from "./periodicnoteentry";
import type { SectionPosition } from "./sectionposition";
import type { Moment } from "moment";

export class DailyPeriodicNoteEntry extends PeriodicNoteEntry {
  constructor(
    app: App,
    openFileOnWrite: boolean,
    sectionPosition: SectionPosition
  ) {
    super(app, openFileOnWrite, sectionPosition);
    this.notice =
      "To use a daily note with Obsidian Clipper the daily note needs to be enabled from the periodic-notes plugin";
  }

  protected getPeriodicNote(moment: Moment, allNotes: Record<string, TFile>) {
    return getDailyNote(moment, allNotes);
  }

  protected hasPeriodicNoteEnabled() {
    return appHasDailyNotesPluginLoaded();
  }

  protected async waitForNoteCreation(moment: Moment) {
    const dailyNote = await createDailyNote(moment);
    await new Promise((r) => setTimeout(r, 50));
    return dailyNote;
  }

  protected getAllNotes() {
    return getAllDailyNotes();
  }
}
