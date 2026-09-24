import { App, Modal } from 'obsidian';
import { mount } from 'svelte';
import MigrateDailyNoteComponent from './MigrateDailyNoteComponent.svelte';

export class MigrateDailyNoteModal extends Modal {
	constructor(app: App) {
		super(app);

		mount(MigrateDailyNoteComponent, {
			target: this.modalEl,
		});
	}

	async onClose() {
		const setting = (this.app as any).setting;
		await setting.open();
		setting.openTabById('obsidian-clipper');
	}
}
