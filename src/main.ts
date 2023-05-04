import { App, PluginSettingTab, Plugin, Modal } from 'obsidian';
import { deepmerge } from 'deepmerge-ts';

import type { Parameters } from './types';
import {
	type ObsidianClipperSettings,
	DEFAULT_SETTINGS,
} from './settings/types';
import { ClippedData } from './clippeddata';
import { DailyPeriodicNoteEntry } from './periodicnotes/dailyperiodicnoteentry';
import { WeeklyPeriodicNoteEntry } from './periodicnotes/weeklyperiodicnoteentry';
import SettingsComponent from './settings/SettingsComponent.svelte';
import { init } from './settings/settingsstore';
import type { SvelteComponent } from 'svelte';
import BookmarkletModalComponent from './modals/BookmarkletModalComponent.svelte';
import { TopicNoteEntry } from './topicnoteentry';

export default class ObsidianClipperPlugin extends Plugin {
	settings: ObsidianClipperSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: 'copy-bookmarklet-address',
			name: 'Vault Bookmarklet',
			callback: () => this.handleCopyBookmarkletCommand(),
		});

		this.addCommand({
			id: 'copy-note-bookmarklet-address',
			name: 'Note Bookmarklet',
			editorCallback: (_editor, ctx) => {
				this.handleCopyBookmarkletCommand(false, ctx.file.path);
			},
		});

		this.registerObsidianProtocolHandler('obsidian-clipper', async (e) => {
			const parameters = e as unknown as Parameters;

			const url = parameters.url;
			const title = parameters.title;
			const notePath = parameters.notePath;
			const highlightData = parameters.highlightdata;

			if (parameters.format === 'html') {
				// Need to alert user
				if (notePath !== '') {
					this.handleCopyBookmarkletCommand(true, notePath);
				} else {
					// show vault modal
					this.handleCopyBookmarkletCommand(true);
				}
				return;
			}

			const noteEntry = new ClippedData(
				title,
				url,
				this.settings,
				this.app,
				highlightData
			);

			if (notePath && notePath !== '') {
				const file = this.app.vault.getAbstractFileByPath(notePath);
				new TopicNoteEntry(
					this.app,
					this.settings.topicOpenOnWrite,
					this.settings.topicPosition,
					this.settings.topicEntryTemplateLocation
				).writeToNote(file, noteEntry);
			} else {
				if (this.settings.useDailyNote) {
					new DailyPeriodicNoteEntry(
						this.app,
						this.settings.dailyOpenOnWrite,
						this.settings.dailyPosition,
						this.settings.dailyEntryTemplateLocation
					).writeToPeriodicNote(noteEntry, this.settings.dailyNoteHeading);
				}

				if (this.settings.useWeeklyNote) {
					new WeeklyPeriodicNoteEntry(
						this.app,
						this.settings.weeklyOpenOnWrite,
						this.settings.weeklyPosition,
						this.settings.weeklyEntryTemplateLocation
					).writeToPeriodicNote(noteEntry, this.settings.weeklyNoteHeading);
				}
			}
		});
	}

	async loadSettings() {
		let mergedSettings = DEFAULT_SETTINGS;
		const settingsData = await this.loadData();
		if (settingsData !== null) {
			mergedSettings = deepmerge(DEFAULT_SETTINGS, settingsData);
		}
		this.settings = mergedSettings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	handleCopyBookmarkletCommand(updateRequired = false, filePath = '') {
		let noticeText = '';
		if (updateRequired) {
			noticeText = `Notice: Your Bookmarklet is out of date and needs to be updated.
				Please Drag the link below to replace your current bookmarklet`;
		}

		const bookmarkletLinkModal = new Modal(this.app);
		bookmarkletLinkModal.titleEl.createEl('h2', {
			text: 'Copy Your Vault Bookmarklet',
		});

		new BookmarkletModalComponent({
			target: bookmarkletLinkModal.contentEl,
			props: {
				noticeText: noticeText,
				vaultName: this.app.vault.getName(),
				filePath: filePath,
			},
		});

		bookmarkletLinkModal.open();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: ObsidianClipperPlugin;
	private view: SvelteComponent;

	constructor(app: App, plugin: ObsidianClipperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		init(this.plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		this.view = new SettingsComponent({
			target: containerEl,
			props: {
				app: this.app,
			},
		});
	}

	async hide() {
		super.hide();
		this.view.$destroy();
	}
}
