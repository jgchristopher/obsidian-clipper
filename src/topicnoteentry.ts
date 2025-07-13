import type { TAbstractFile } from 'obsidian';
import { NoteEntry } from './abstracts/noteentry';
import type { ClippedData } from './clippeddata';
import { Utility } from './utils/utility';

export class TopicNoteEntry extends NoteEntry {
	async writeToNote(
		file: TAbstractFile | null,
		noteEntry: ClippedData,
		heading?: string,
		headingLevel?: number
	): Promise<void> {
		Utility.assertNotNull(file);
		this.handleWrite(
			file.path,
			await noteEntry.formattedEntry(this.template),
			heading,
			headingLevel
		);
	}
}
