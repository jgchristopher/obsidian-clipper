import type { TAbstractFile } from 'obsidian';
import { NoteEntry } from './abstracts/noteentry';
import type { ClippedData } from './clippeddata';
import { Utility } from './utils/utility';

export class TopicNoteEntry extends NoteEntry {
	async writeToNote(file: TAbstractFile | null, noteEntry: ClippedData) {
		Utility.assertNotNull(file);
		const formattedEntry = await noteEntry.formattedEntry(this.template);
		await this.handleWrite(file.path, formattedEntry);
	}
}
