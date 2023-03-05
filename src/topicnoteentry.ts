import { App, TFile, Notice, TAbstractFile } from 'obsidian';
import type { ClippedNoteEntry } from './clippednoteentry';
import { AppendWriter } from './periodicnotes/appendwriter';
import { PrependWriter } from './periodicnotes/prependwriter';
import { SectionPosition } from './settings/types';

export class TopicNoteEntry {
	private app: App;
	private openFileOnWrite: boolean;
	private sectionPosition: SectionPosition;
	private template: string;

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
			if (this.sectionPosition === SectionPosition.PREPEND) {
				new PrependWriter(this.app, this.openFileOnWrite).write(file, data);
			} else {
				new AppendWriter(this.app, this.openFileOnWrite).write(file, data);
			}
		} else {
			new Notice(`Obsidian Clipper couldn't find the note to write to`);
		}
	}
}
