import { Notice, type TAbstractFile } from 'obsidian';
import { NoteEntry } from './abstracts/noteentry';
import type { ClippedData } from './clippeddata';
import { Utility } from './utils/utility';

export const canvasTopicNotice = (path: string) =>
	`Obsidian Clipper won't write Markdown into the canvas "${path}". Create a canvas clipper for it instead.`;

export class TopicNoteEntry extends NoteEntry {
	async writeToNote(
		file: TAbstractFile | null,
		noteEntry: ClippedData,
		heading?: string,
		headingLevel?: number
	): Promise<void> {
		Utility.assertNotNull(file);
		// Appending Markdown to a canvas corrupts its JSON.
		if (file.path.toLowerCase().endsWith('.canvas')) {
			new Notice(canvasTopicNotice(file.path));
			return;
		}
		await this.handleWrite(
			file.path,
			await noteEntry.formattedEntry(this.template),
			heading,
			headingLevel
		);
	}
}
