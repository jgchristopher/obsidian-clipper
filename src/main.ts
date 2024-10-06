import {
	App,
	PluginSettingTab,
	Plugin,
	Modal,
	Notice,
	TFile,
	View,
	type PluginManifest,
} from 'obsidian';
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
// @ts-ignore
import { BookmarketlGenerator } from './bookmarkletlink/build-bookmarkletgenerator';
import { AdvancedNoteEntry } from './advancednotes/advancednoteentry';
import { CanvasEntry } from './canvasentry';
import { Utility } from './utils/utility';

export function hasAdmonitions (app: App): boolean {
	//@ts-ignore
	return app.plugins.enabledPlugins.has('obsidian-admonition');
}

export default class ObsidianClipperPlugin extends Plugin {
	app: App;
	settings: ObsidianClipperSettings;
	manifest: PluginManifest;
	hasAdmonitionsPlugin: boolean;

	constructor (app: App, manifest: PluginManifest) {
		super(app, manifest ?? app.plugins.manifests['obsidian-clipper-dev']);
		this.app = app;
	}

	async onload () {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		// determine formatting for highlighted content formatting within quotes
		this.hasAdmonitionsPlugin = hasAdmonitions(this.app);

		this.addCommand({
			id: 'copy-bookmarklet-address-clipboard',
			name: 'Vault Bookmarklet to Clipboard',
			callback: async () => await this.handleCopyBookmarkletToClipboard(),
		});

		this.addCommand({
			id: 'copy-bookmarklet-address',
			name: 'Vault Bookmarklet',
			callback: () => this.handleCopyBookmarkletCommand(),
		});

		this.addCommand({
			id: 'copy-note-bookmarklet-address-clipboard',
			name: 'Topic Bookmarklet to Clipboard',
			editorCallback: async (_editor, ctx) => {
				await this.handleCopyBookmarkletToClipboard(ctx.file?.path);
			},
		});

		this.addCommand({
			id: 'copy-note-bookmarklet-address',
			name: 'Topic Bookmarklet',
			editorCallback: (_editor, ctx) => {
				this.handleCopyBookmarkletCommand(false, ctx.file?.path);
			},
		});

		this.addCommand({
			id: 'copy-note-bookmarklet-address-canvas',
			name: 'Canvas Bookmarklet',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return (
						this.settings.experimentalCanvas &&
						this.app.workspace.getActiveViewOfType(View)?.file.extension ===
							'canvas'
					);
				} else {
					const ctx = this.app.workspace.getActiveViewOfType(View);
					if (ctx) {
						this.handleCopyBookmarkletCommand(false, ctx.file.path);
					}
				}
			},
		});

		this.registerObsidianProtocolHandler('obsidian-clipper', async e => {
			const parameters = e as unknown as Parameters;

			const url = parameters.url;
			const highlightData = parameters.highlightdata;
			const title = parameters.title;
			const comments = parameters.comments;
			const description = parameters.description;
			const notePath = parameters.notePath;
			let baseURI = parameters.baseURI ?? Utility.parseDomainFromUrl(url);
			const uriHasPrefix = baseURI.match(/^[\w:/]+?\.(?=\S+?\.)/);
			if (uriHasPrefix) baseURI = baseURI.slice(uriHasPrefix[0].length);

			// For a brief time the bookmarklet was sending over raw html instead of processed markdown and we need to alert the user to reinstall the bookmarklet
			if (parameters.format === 'html') {
				// Need to alert user
				if (notePath?.length > 0) {
					// Was this a Topic Note bookMarklet?
					this.handleCopyBookmarkletCommand(true, notePath);
				} else {
					// show vault modal
					this.handleCopyBookmarkletCommand(true);
				}
				return;
			}

			let entryReference = highlightData;

			if (this.settings.advanced) {
				entryReference = await new AdvancedNoteEntry(
					this.app,
					this,
					this.settings.advancedStorageFolder
				).writeToAdvancedNoteStorage(
					baseURI,
					url,
					title,
					description,
					highlightData,
					comments
				);
			}

			const noteEntry = new ClippedData(
				title,
				url,
				this.settings,
				this.app,
				entryReference,
				comments,
				description
			);

			if (this.settings.useDailyNote) {
				await new DailyPeriodicNoteEntry(
					this.app,
					this.settings.dailyOpenOnWrite,
					this.settings.dailyPosition,
					this.settings.dailyEntryTemplateLocation
				).writeToPeriodicNote(noteEntry, this.settings.dailyNoteHeading);
			} else if (this.settings.useWeeklyNote) {
				await new WeeklyPeriodicNoteEntry(
					this.app,
					this.settings.weeklyOpenOnWrite,
					this.settings.weeklyPosition,
					this.settings.weeklyEntryTemplateLocation
				).writeToPeriodicNote(noteEntry, this.settings.weeklyNoteHeading);
			} else if (notePath?.length > 0) {
				let file = this.app.vault.getAbstractFileByPath(notePath);
				if (!(file instanceof TFile)) {
					file = await this.app.vault.create(notePath, '');
					if (!file) throw new Error('Failed to create note.');
				}

				if ((file as TFile).extension === 'canvas') {
					await new CanvasEntry(this.app).writeToCanvas(
						file as TFile,
						noteEntry
					);
				} else {
					await new TopicNoteEntry(
						this.app,
						this.settings.topicOpenOnWrite,
						this.settings.topicPosition,
						this.settings.topicEntryTemplateLocation
					).writeToNote(file, noteEntry);
				}
			}
		});
	}

	async loadSettings () {
		let mergedSettings = DEFAULT_SETTINGS;
		const settingsData = await this.loadData();
		if (settingsData !== null) {
			mergedSettings = deepmerge(DEFAULT_SETTINGS, settingsData);
		}
		this.settings = mergedSettings;
	}

	async saveSettings () {
		await this.saveData(this.settings);
	}

	async handleCopyBookmarkletToClipboard (notePath = '', description = '') {
		await navigator.clipboard.writeText(
			new BookmarketlGenerator(
				this.app.vault.getName(),
				notePath,
				this.settings.markdownSettings,
				(
					this.settings.experimentalBookmarkletComment &&
					this.settings.captureComments
				).toString()
			).generateBookmarklet()
		);
		new Notice('Obsidian Clipper Bookmarklet copied to clipboard.');
	}

	handleCopyBookmarkletCommand (updateRequired = false, filePath = '') {
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

	constructor (app: App, plugin: ObsidianClipperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		init(this.plugin);
	}

	display (): void {
		const { containerEl } = this;

		containerEl.empty();

		this.view = new SettingsComponent({
			target: containerEl,
			props: {
				app: this.app,
			},
		});
	}

	async hide () {
		super.hide();
		this.view.$destroy();
	}
}
