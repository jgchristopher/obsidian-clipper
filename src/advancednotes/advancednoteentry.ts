import { TFile, TFolder, type App } from 'obsidian';
import { NoteEntry } from 'src/abstracts/noteentry';
import { AppendWriter } from 'src/periodicnotes/appendwriter';
import { SectionPosition } from 'src/settings/types';

export class AdvancedNoteEntry extends NoteEntry {
	private storageFolder: string;

	private getEntry(sectionHeader: string, data: string, url: string): string {
		if (url === "shortcut") {
			return `\n# ${sectionHeader} \n ${data}\n`;
		} else {
			return `\n# ${sectionHeader} \n ${data}\n[^1] \n\n [^1]: ${url}  \n`;
		}
	}

	constructor(app: App, storageFolder: string) {
		super(app, false, SectionPosition.APPEND, '');
		this.storageFolder = storageFolder;
	}

	async writeToAdvancedNoteStorage(
		hostName: string,
		data: string,
		url: string
	): Promise<string> {
		const noteFilePath = `${this.storageFolder}/${hostName}.md`;
		const folder = this.app.vault.getAbstractFileByPath(this.storageFolder);
		const file = this.app.vault.getAbstractFileByPath(noteFilePath);

		const sectionHeader = window.moment().toISOString().replaceAll(':', '-');
		const entry = this.getEntry(sectionHeader, data, url); //`\n# ${sectionHeader} \n ${data}\n[^1] \n\n [^1]: ${url}  \n`;

		if (!(file instanceof TFile)) {
			// create the file and write data
			if (!(folder instanceof TFolder)) {
				await this.app.vault.createFolder(this.storageFolder);
			}
			await this.app.vault.create(noteFilePath, entry);
		} else {
			await new AppendWriter(this.app, this.openFileOnWrite).write(file, entry);
		}

		return `![[${this.storageFolder}/${hostName}#${sectionHeader}|clipped]]`;
	}
}
