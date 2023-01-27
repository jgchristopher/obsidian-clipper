import { Moment } from "moment";
import { App, TFile } from "obsidian";
import {
	appHasWeeklyNotesPluginLoaded,
	createWeeklyNote,
	getAllWeeklyNotes,
	getWeeklyNote,
} from "obsidian-daily-notes-interface";
import { PeriodicNoteEntry } from "./periodicnoteentry";

export class WeeklyPeriodicNoteEntry extends PeriodicNoteEntry {
	constructor(app: App, openFileOnWrite: boolean) {
		super();
		this.app = app;
		this.openFileOnWrite = openFileOnWrite;
		this.notice =
			"To use a weekly note with Obsidian Clipper the weekly note needs to be enabled from the periodic-notes plugin";
	}

	getAllNotes() {
		return getAllWeeklyNotes();
	}

	getNote(allNotes: Record<string, TFile>) {
		return getWeeklyNote(window.moment(), allNotes);
	}

	hasPeriodicNoteEnabled() {
		return appHasWeeklyNotesPluginLoaded();
	}

	async waitForNoteCreation(moment: Moment) {
		let weeklyNote = await createWeeklyNote(moment);
		await new Promise((r) => setTimeout(r, 50));
		return weeklyNote;
	}
}
