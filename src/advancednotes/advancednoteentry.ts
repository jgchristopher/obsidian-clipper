import { TFile, type App } from 'obsidian';
import { NoteEntry } from 'src/abstracts/noteentry';
import { AppendWriter } from 'src/periodicnotes/appendwriter';
import { SectionPosition } from 'src/settings/types';

export class AdvancedNoteEntry extends NoteEntry {
	constructor(app: App) {
		super(app, false, SectionPosition.APPEND, '');
	}

	async writeToAdvancedNoteStorage(hostName: string, data: string) {
		const noteFilePath = `clippings/${hostName}.md`;
		const file = this.app.vault.getAbstractFileByPath(noteFilePath);

		const sectionHeader = window.moment().toISOString().replaceAll(':', '-');
		const entry = `\n# ${sectionHeader} \n ${data}`;

		if (!(file instanceof TFile)) {
			// create the file and write data
			this.app.vault.create(noteFilePath, entry);
		} else {
			new AppendWriter(this.app, this.openFileOnWrite).write(file, entry);
		}
		return `![[${hostName}#${sectionHeader}]]`;
	}
}
