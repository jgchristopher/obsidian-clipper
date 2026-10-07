import { App, TFile, Notice } from 'obsidian';
import type { Moment } from 'moment';
import type { ClippedData } from '../clippeddata';
import { NoteEntry } from 'src/abstracts/noteentry';
import type { SectionPosition } from 'src/settings/types';

export abstract class PeriodicNoteEntry extends NoteEntry {
	protected notice: string;
	protected periodName: string;

	protected abstract getPeriodicNote(
		moment: Moment,
		allNotes: Record<string, TFile>
	): TFile;
	protected abstract hasPeriodicNoteEnabled(): boolean;
	protected abstract getAllNotes(): Record<string, TFile>;
	// Resolves undefined when obsidian-daily-notes-interface fails to create
	// the note (it catches the error and shows its own notice).
	protected abstract waitForNoteCreation(
		moment: Moment
	): Promise<TFile | undefined>;

	constructor(
		app: App,
		openFileOnWrite: boolean,
		sectionPosition: SectionPosition,
		template: string
	) {
		super(app, openFileOnWrite, sectionPosition, template);
		this.template = template;
	}

	async writeToPeriodicNote(
		noteEntry: ClippedData,
		heading: string,
		headingLevel: number
	): Promise<void> {
		if (!this.hasPeriodicNoteEnabled()) {
			new Notice(this.notice);
			return;
		}

		const note = await this.getNote();
		if (!note) {
			new Notice(
				`Obsidian Clipper couldn't create the ${this.periodName} note to write to`
			);
			return;
		}

		await this.handleWrite(
			note.path,
			await noteEntry.formattedEntry(this.template),
			heading,
			headingLevel
		);
	}

	protected async getNote() {
		const now = globalThis.moment();
		const allNotes = this.getAllNotes();
		const periodicNote = this.getPeriodicNote(now, allNotes);
		if (!periodicNote) {
			return await this.waitForNoteCreation(now);
		}
		return periodicNote;
	}
}
