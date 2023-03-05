import { Notice, TFile, type App } from 'obsidian';
import { AppendWriter } from 'src/periodicnotes/appendwriter';
import { PrependWriter } from 'src/periodicnotes/prependwriter';
import { SectionPosition } from 'src/settings/types';

export abstract class NoteEntry {
	protected app: App;
	protected openFileOnWrite: boolean;
	protected sectionPosition: SectionPosition;
	protected template: string;

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

	protected async handleWrite(
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
