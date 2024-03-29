import type { Moment } from 'moment';
import type { App, TFile } from 'obsidian';
import {
	appHasWeeklyNotesPluginLoaded,
	createWeeklyNote,
	getAllWeeklyNotes,
	getWeeklyNote,
} from 'obsidian-daily-notes-interface';
import { PeriodicNoteEntry } from './periodicnoteentry';
import type { SectionPosition } from '../settings/types';

export class WeeklyPeriodicNoteEntry extends PeriodicNoteEntry {
	constructor(
		app: App,
		openFileOnWrite: boolean,
		sectionPosition: SectionPosition,
		template: string
	) {
		super(app, openFileOnWrite, sectionPosition, template);
		this.notice =
			'To use a weekly note with Obsidian Clipper the weekly note needs to be enabled from the periodic-notes plugin';
	}

	protected getPeriodicNote(moment: Moment, allNotes: Record<string, TFile>) {
		return getWeeklyNote(moment, allNotes);
	}

	protected hasPeriodicNoteEnabled() {
		return appHasWeeklyNotesPluginLoaded();
	}

	protected async waitForNoteCreation(moment: Moment) {
		const weeklyNote = await createWeeklyNote(moment);
		await new Promise((r) => setTimeout(r, 50));
		return weeklyNote;
	}

	protected getAllNotes() {
		return getAllWeeklyNotes();
	}
}
