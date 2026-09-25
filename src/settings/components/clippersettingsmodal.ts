import { Modal, type App } from 'obsidian';
import { mount } from 'svelte';
import ClipperSettingsComponent from './ClipperSettingsComponent.svelte';

/**
 * Opens the "Edit Clipper Settings" modal. The clipper-settings-modal class
 * (styled in input.css) gives it a fixed size, so switching tabs does not
 * resize or re-center it.
 */
export function openClipperSettingsModal(
	app: App,
	settingsIndex: number,
	activeTabNumber = 1
) {
	const modal = new Modal(app);
	modal.modalEl.classList.add('clipper-settings-modal');
	modal.titleEl.createEl('h2', { text: 'Edit Clipper Settings' });
	mount(ClipperSettingsComponent, {
		target: modal.contentEl,
		props: { app, settingsIndex, activeTabNumber },
	});
	modal.open();
}
