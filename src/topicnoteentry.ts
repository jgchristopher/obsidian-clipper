import type { TAbstractFile } from 'obsidian';
import { NoteEntry } from './abstracts/noteentry';
import type { ClippedData } from './clippeddata';
import { Utility } from './utils/utility';

export class TopicNoteEntry extends NoteEntry {
	async writeToNote(
		file: TAbstractFile | null,
		noteEntry: ClippedData,
		heading: string
	) {
		Utility.assertNotNull(file);
		this.handleWrite(
			file.path,
			await noteEntry.formattedEntry(this.template),
			heading
		);
	}
}
