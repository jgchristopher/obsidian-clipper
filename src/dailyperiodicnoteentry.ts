import { App, TFile } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	getAllDailyNotes,
	getDailyNote,
	createDailyNote,
} from "obsidian-daily-notes-interface";
import { PeriodicNoteEntry } from "./periodicnoteentry";
import type { Moment } from "moment";

export class DailyPeriodicNoteEntry extends PeriodicNoteEntry {
	constructor(app: App, openFileOnWrite: boolean) {
		super();
		this.app = app;
		this.openFileOnWrite = openFileOnWrite;
		this.notice =
			"To use a daily note with Obsidian Clipper the daily note needs to be enabled from the periodic-notes plugin";
	}

	getAllNotes() {
		return getAllDailyNotes();
	}

	getNote(allNotes: Record<string, TFile>) {
		return getDailyNote(window.moment(), allNotes);
	}

	hasPeriodicNoteEnabled() {
		return appHasDailyNotesPluginLoaded();
	}

	async waitForNoteCreation(moment: Moment) {
		let dailyNote = await createDailyNote(moment);
		await new Promise((r) => setTimeout(r, 50));
		return dailyNote;
	}
}
