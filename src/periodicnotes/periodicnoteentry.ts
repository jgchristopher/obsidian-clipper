import { App, TFile, Notice } from 'obsidian';
import type { Moment } from 'moment';
import type { ClippedNoteEntry } from '../clippednoteentry';
import { SectionPosition } from '../settings/types';
import { PrependWriter } from './prependwriter';
import { AppendWriter } from './appendwriter';

export abstract class PeriodicNoteEntry {
	protected app: App;
	protected notice: string;
	protected openFileOnWrite: boolean;
	protected sectionPosition: SectionPosition;
	protected template: string;

	protected abstract getPeriodicNote(
		moment: Moment,
		allNotes: Record<string, TFile>
	): TFile;
	protected abstract hasPeriodicNoteEnabled(): boolean;
	protected abstract getAllNotes(): Record<string, TFile>;
	protected abstract waitForNoteCreation(moment: Moment): Promise<TFile>;

	constructor(
		app: App,
		openFileOnWrite: boolean,
		sectionPosition: SectionPosition,
		template: string
	) {
		this.app = app;
		this.openFileOnWrite = openFileOnWrite;
		this.sectionPosition = sectionPosition;
		this.template = template;
	}

	async writeToPeriodicNote(noteEntry: ClippedNoteEntry, heading: string) {
		if (!this.hasPeriodicNoteEnabled()) {
			new Notice(this.notice);
			return;
		}

		const note = await this.getNote();

		this.handleWrite(
			note.path,
			await noteEntry.formattedEntry(this.template),
			heading
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

	private async handleWrite(
		noteFilePath: string,
		data: string,
		heading?: string
	) {
		const file = this.app.vault.getAbstractFileByPath(noteFilePath);
		if (file instanceof TFile) {
			if (this.sectionPosition === SectionPosition.PREPEND) {
				new PrependWriter(this.app, this.openFileOnWrite).write(
					file,
					data,
					heading
				);
			} else {
				new AppendWriter(this.app, this.openFileOnWrite).write(
					file,
					data,
					heading
				);
			}
		} else {
			new Notice(
				`Obsidian Clipper couldn't find the note to ${this.sectionPosition} to`
			);
		}
	}
}
