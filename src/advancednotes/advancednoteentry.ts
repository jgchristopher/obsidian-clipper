import { TFile, type App } from 'obsidian';
import { NoteEntry } from 'src/abstracts/noteentry';
import { AppendWriter } from 'src/periodicnotes/appendwriter';
import { SectionPosition } from 'src/settings/types';

export class AdvancedNoteEntry extends NoteEntry {
	private storageFolder: string;

	constructor(app: App, storageFolder: string) {
		super(app, false, SectionPosition.APPEND, '');
		this.storageFolder = storageFolder;
	}

	async writeToAdvancedNoteStorage(
		hostName: string,
		data: string,
		url: string
	) {
		const noteFilePath = `${this.storageFolder}/${hostName}.md`;
		const file = this.app.vault.getAbstractFileByPath(noteFilePath);

		const sectionHeader = window.moment().toISOString().replaceAll(':', '-');
		const entry = `\n# ${sectionHeader} \n ${data}\n[^1] \n\n [^1]: ${url}  \n`;

		if (!(file instanceof TFile)) {
			// create the file and write data
			this.app.vault.create(noteFilePath, entry);
		} else {
			new AppendWriter(this.app, this.openFileOnWrite).write(file, entry);
		}
		// Wait for the new note or note data to be available then return
		await new Promise((r) => setTimeout(r, 50));

		return `![[${hostName}#${sectionHeader}]]`;
	}
}
