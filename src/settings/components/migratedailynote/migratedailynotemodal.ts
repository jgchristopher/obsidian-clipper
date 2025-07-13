import { App, Modal } from 'obsidian';
import MigrateDailyNoteComponent from './MigrateDailyNoteComponent.svelte';

export class MigrateDailyNoteModal extends Modal {
	constructor(app: App) {
		super(app);

		new MigrateDailyNoteComponent({
			target: this.modalEl,
		});
	}

	async onClose() {
		const setting = (this.app as any).setting;
		await setting.open();
		setting.openTabById('obsidian-clipper');
	}
}
