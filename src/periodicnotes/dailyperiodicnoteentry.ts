import type { App, TFile } from 'obsidian';
import {
	appHasDailyNotesPluginLoaded,
	getAllDailyNotes,
	getDailyNote,
	createDailyNote,
} from 'obsidian-daily-notes-interface';
import { PeriodicNoteEntry } from './periodicnoteentry';
import type { SectionPosition } from '../settings/types';
import type { Moment } from 'moment';

export class DailyPeriodicNoteEntry extends PeriodicNoteEntry {
	constructor(
		app: App,
		openFileOnWrite: boolean,
		sectionPosition: SectionPosition,
		template: string
	) {
		super(app, openFileOnWrite, sectionPosition, template);
		this.periodName = 'daily';
		this.notice =
			'Obsidian Clipper: turn on the core Daily notes plugin, or daily notes in Periodic Notes, to use a daily clipper.';
	}

	protected getPeriodicNote(
		moment: Moment,
		allNotes: Record<string, TFile>
	): TFile {
		return getDailyNote(moment, allNotes);
	}

	protected hasPeriodicNoteEnabled(): boolean {
		return appHasDailyNotesPluginLoaded();
	}

	protected async waitForNoteCreation(
		moment: Moment
	): Promise<TFile | undefined> {
		const dailyNote = await createDailyNote(moment);
		await new Promise((r) => setTimeout(r, 150));
		return dailyNote;
	}

	protected getAllNotes(): Record<string, TFile> {
		return getAllDailyNotes();
	}
}
