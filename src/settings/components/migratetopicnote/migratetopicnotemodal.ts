import { App, Modal } from 'obsidian';
import { mount } from 'svelte';
import { ClipperType } from 'src/settings/types';
import AddNoteCommandComponent from '../addnotecommand/AddNoteCommandComponent.svelte';
import MigrateTopicNoteComponent from './MigrateTopicNoteComponent.svelte';

export class MigrateTopicNoteModal extends Modal {
	private notePath: string;

	constructor(app: App, notePath: string) {
		super(app);
		this.notePath = notePath;

		mount(MigrateTopicNoteComponent, {
			target: this.modalEl,
			props: {
				notePath: notePath,
			},
		});
	}

	onClose() {
		mount(AddNoteCommandComponent, {
			target: createEl('div'),
			props: {
				app: this.app,
				filePath: this.notePath,
				type: ClipperType.TOPIC,
			},
		});
	}
}
