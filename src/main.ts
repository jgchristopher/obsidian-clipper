import { App, PluginSettingTab, Plugin, Modal, Notice } from 'obsidian';
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
import { BookmarketlGenerator } from './bookmarkletlink/bookmarkletgenerator';
import { fromUrl, parseDomain } from 'parse-domain';
import { AdvancedNoteEntry } from './advancednotes/advancednoteentry';

export default class ObsidianClipperPlugin extends Plugin {
	settings: ObsidianClipperSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: 'copy-bookmarklet-address-clipboard',
			name: 'Vault Bookmarklet to Clipboard',
			callback: () => this.handleCopyBookmarkletToClipboard(),
		});

		this.addCommand({
			id: 'copy-bookmarklet-address',
			name: 'Vault Bookmarklet',
			callback: () => this.handleCopyBookmarkletCommand(),
		});

		this.addCommand({
			id: 'copy-note-bookmarklet-address-clipboard',
			name: 'Topic Bookmarklet to Clipboard',
			editorCallback: (_editor, ctx) => {
				this.handleCopyBookmarkletToClipboard(ctx.file.path);
			},
		});

		this.addCommand({
			id: 'copy-note-bookmarklet-address',
			name: 'Topic Bookmarklet',
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
			const comments = parameters.comments;

			// For a brief time the bookmarklet was sending over raw html instead of processed markdown and we need to alert the user to reinstall the bookmarklet
			if (parameters.format === 'html') {
				// Need to alert user
				if (notePath !== '') {
					// Was this a Topic Note bookMarklet?
					this.handleCopyBookmarkletCommand(true, notePath);
				} else {
					// show vault modal
					this.handleCopyBookmarkletCommand(true);
				}
				return;
			}

			let entryReference = highlightData;

			if (this.settings.advanced && highlightData) {
				const domain = parseDomain(fromUrl(url));
				entryReference = await new AdvancedNoteEntry(
					this.app,
					this.settings.advancedStorageFolder
				).writeToAdvancedNoteStorage(
					domain.hostname.toString(),
					highlightData,
					url
				);
			}

			const noteEntry = new ClippedData(
				title,
				url,
				this.settings,
				this.app,
				entryReference,
				comments
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

	handleCopyBookmarkletToClipboard(notePath = '') {
		navigator.clipboard.writeText(
			new BookmarketlGenerator(
				this.app.vault.getName(),
				notePath,
				this.settings.markdownSettings,
				this.settings.captureComments.toString()
			).generateBookmarklet()
		);
		new Notice('Obsidian Clipper Bookmarklet copied to clipboard.');
	}

	handleCopyBookmarkletCommand(updateRequired = false, filePath = '') {
		let noticeText = '';
		if (updateRequired) {
			noticeText = `Notice: Your Bookmarklet is out of date and needs to be updated.
				Please Drag the link below to replace your current bookmarklet`;
		}

		const bookmarkletLinkModal = new Modal(this.app);
		bookmarkletLinkModal.titleEl.createEl('h2', {
			text: 'Copy Your Bookmarklet',
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
