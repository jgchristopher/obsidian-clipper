import { App, TAbstractFile, TFile, Notice } from "obsidian";
import type { Moment } from "moment";
import { ClippedNoteEntry } from "../clippednoteentry";
import { SectionPosition } from "./sectionposition";
import { PrependWriter } from "./prependwriter";
import { AppendWriter } from "./appendwriter";

export abstract class PeriodicNoteEntry {
	protected app: App;
	protected notice: string;
	protected openFileOnWrite: boolean;
	protected sectionPosition: SectionPosition;

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
		sectionPosition: SectionPosition
	) {
		this.app = app;
		this.openFileOnWrite = openFileOnWrite;
		this.sectionPosition = sectionPosition;
	}

	async writeToPeriodicNote(noteEntry: ClippedNoteEntry, heading: string) {
		if (!this.hasPeriodicNoteEnabled()) {
			new Notice(this.notice);
			return;
		}

		let note = await this.getNote();

		this.handleWrite(
			note.path,
			await noteEntry.formattedEntry(),
			this.sectionPosition,
			heading
		);
	}

	protected async getNote() {
		let now = window.moment();
		const allNotes = this.getAllNotes();
		let periodicNote = this.getPeriodicNote(now, allNotes);
		if (!periodicNote) {
			return await this.waitForNoteCreation(now);
		}
		return periodicNote;
	}

	private async handleWrite(
		noteFilePath: string,
		data: string,
		sectionPosition: SectionPosition,
		heading?: string
	) {
		let file: TAbstractFile | null;
		file = this.app.vault.getAbstractFileByPath(noteFilePath);
		if (file instanceof TFile) {
			if (sectionPosition === SectionPosition.PREPEND) {
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
				`Obsidian Clipper couldn't find the note to ${sectionPosition} to`
			);
		}
	}
}
