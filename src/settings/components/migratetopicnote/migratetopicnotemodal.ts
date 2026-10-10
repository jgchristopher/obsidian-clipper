import { App, Modal } from 'obsidian';
import { mount } from 'svelte';
import { ClipperType } from 'src/settings/types';
import AddNoteCommandComponent from '../addnotecommand/AddNoteCommandComponent.svelte';
import MigrateTopicNoteComponent from './MigrateTopicNoteComponent.svelte';

export class MigrateTopicNoteModal extends Modal {
	private notePath: string;
	// 0.x had an experimental canvas bookmarklet that sent the canvas path.
	private isCanvas: boolean;

	constructor(app: App, notePath: string) {
		super(app);
		this.notePath = notePath;
		this.isCanvas = notePath.toLowerCase().endsWith('.canvas');

		mount(MigrateTopicNoteComponent, {
			target: this.modalEl,
			props: {
				notePath: notePath,
				isCanvas: this.isCanvas,
			},
		});
	}

	onClose() {
		// Same component and props as the Canvas Bookmarklet and Create Topic
		// Bookmarklet commands, so the clipper matches one made there.
		mount(AddNoteCommandComponent, {
			target: createEl('div'),
			props: {
				app: this.app,
				filePath: this.notePath,
				type: this.isCanvas ? ClipperType.CANVAS : ClipperType.TOPIC,
			},
		});
	}
}
