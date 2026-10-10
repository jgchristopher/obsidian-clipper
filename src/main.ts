import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	TFile,
	View,
	WorkspaceLeaf,
} from 'obsidian';

import { mount, unmount } from 'svelte';
import { AdvancedNoteEntry } from './advancednotes/advancednoteentry';
import { BookmarketlGenerator } from './bookmarkletlink/bookmarkletgenerator';
import { CanvasEntry } from './canvasentry';
import { ClippedData } from './clippeddata';
import { DailyPeriodicNoteEntry } from './periodicnotes/dailyperiodicnoteentry';
import { WeeklyPeriodicNoteEntry } from './periodicnotes/weeklyperiodicnoteentry';
import AddNoteCommandComponent from './settings/components/addnotecommand/AddNoteCommandComponent.svelte';
import SettingsComponent from './settings/SettingsComponent.svelte';
import { init } from './settings/settingsstore';
import {
	ClipperType,
	DEFAULT_CLIPPER_SETTING,
	DEFAULT_SETTINGS,
	DEFAULT_SETTINGS_EMPTY,
	type ObsidianClipperPluginSettings,
	type ObsidianClipperSettings,
	type OldClipperSettings,
} from './settings/types';
import { TopicNoteEntry } from './topicnoteentry';
import type { Parameters } from './types';
import { ShortcutLinkGenerator } from './shortcutslink/ShortcutLinkGenerator';
import { Utility } from './utils/utility';
import { BookmarkletLinksView, VIEW_TYPE } from './views/BookmarkletLinksView';
import { MigrateTopicNoteModal } from './settings/components/migratetopicnote/migratetopicnotemodal';
import { MigrateDailyNoteModal } from './settings/components/migratedailynote/migratedailynotemodal';

export const UNKNOWN_CLIPPER_NOTICE =
	"Obsidian Clipper: this bookmarklet's clipper no longer exists. Copy a new bookmarklet from Clipper settings.";

export const missingCanvasNotice = (path: string) =>
	`Obsidian Clipper couldn't find the canvas "${path}". Choose it again in the clipper's settings.`;

export const ambiguousCanvasNotice = (name: string) =>
	`Obsidian Clipper found several canvases named "${name}". Choose the right one in the clipper's settings.`;

export const missingTypeNotice = (clipperName: string) =>
	`Obsidian Clipper: the clipper "${clipperName}" has no type. Choose one in Clipper settings.`;

const CLIPPER_TYPES: readonly string[] = Object.values(ClipperType);

// A clipper saved without a type matches no writer. Say so instead of
// dropping the clip silently.
function hasKnownType(clipper: ObsidianClipperSettings): boolean {
	if (CLIPPER_TYPES.includes(clipper.type)) {
		return true;
	}
	new Notice(missingTypeNotice(clipper.name));
	return false;
}

export const writeFailedNotice = (clipperName: string, error: unknown) =>
	`Obsidian Clipper couldn't save the clip for "${clipperName}": ${
		error instanceof Error ? error.message : String(error)
	}`;

export default class ObsidianClipperPlugin extends Plugin {
	settings: ObsidianClipperPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		// Are we looking at a markdown note?
		this.addCommand({
			id: 'create-topic-bookmarklet',
			name: 'Create Topic Bookmarklet',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return (
						this.app.workspace.getActiveViewOfType(View)?.file.extension ===
						'md'
					);
				} else {
					const ctx = this.app.workspace.getActiveViewOfType(View);
					if (ctx) {
						const filePath = ctx.file?.path;
						Utility.assertNotNull(filePath);
						mount(AddNoteCommandComponent, {
							target: createEl('div'),
							props: {
								app: this.app,
								filePath: filePath,
								type: ClipperType.TOPIC,
							},
						});
					}
				}
			},
		});

		// Are we looking at a canvas note?
		this.addCommand({
			id: 'copy-note-bookmarklet-address-canvas',
			name: 'Canvas Bookmarklet',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return (
						this.app.workspace.getActiveViewOfType(View)?.file.extension ===
						'canvas'
					);
				} else {
					const ctx = this.app.workspace.getActiveViewOfType(View);
					if (ctx) {
						const filePath = ctx.file?.path;
						Utility.assertNotNull(filePath);
						mount(AddNoteCommandComponent, {
							target: createEl('div'),
							props: {
								app: this.app,
								filePath: filePath,
								type: ClipperType.CANVAS,
							},
						});
					}
				}
			},
		});

		this.addCommand({
			id: 'copy-topic-bookmarklet-clipboard',
			name: 'Copy Topic Note Bookmarklet (Clipboard)',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return (
						this.app.workspace.getActiveViewOfType(View)?.file.extension ===
						'md'
					);
				} else {
					const ctx = this.app.workspace.getActiveViewOfType(View);
					if (ctx) {
						const filePath = ctx.file?.path;
						Utility.assertNotNull(filePath);
						const foundClipper = this.settings.clippers.find((clipper) => {
							return clipper.notePath === filePath;
						});
						if (foundClipper) {
							this.handleCopyBookmarkletToClipboard(foundClipper);
						} else {
							new Notice("Couldn't find setting for this note");
						}
					}
				}
			},
		});

		this.addCommand({
			id: 'copy-topic-apple-shortcut-clipboard',
			name: 'Copy Topic Note Apple Shortcut (Clipboard)',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return (
						this.app.workspace.getActiveViewOfType(View)?.file.extension ===
						'md'
					);
				} else {
					const ctx = this.app.workspace.getActiveViewOfType(View);
					if (ctx) {
						const filePath = ctx.file?.path;
						Utility.assertNotNull(filePath);
						const foundClipper = this.settings.clippers.find((clipper) => {
							return clipper.notePath === filePath;
						});
						if (foundClipper) {
							this.handleCopyShortcutToClipboard(foundClipper);
						} else {
							new Notice("Couldn't find setting for this note");
						}
					}
				}
			},
		});

		// Is the Clipper View Open?
		this.addCommand({
			id: 'show-clipper-view',
			name: 'Open view',
			checkCallback: (checking: boolean) => {
				if (checking) {
					return this.app.workspace.getLeavesOfType(VIEW_TYPE).length === 0;
				}
				this.activateView();
			},
		});

		this.registerObsidianProtocolHandler('obsidian-clipper', async (e) => {
			const parameters = e as unknown as Parameters;

			const url = parameters.url;
			const title = parameters.title;
			const highlightData = parameters.highlightdata;
			const comments = parameters.comments;
			const clipperId = parameters.clipperId;

			if (!clipperId) {
				if (parameters.notePath) {
					const modal = new MigrateTopicNoteModal(
						this.app,
						parameters.notePath
					);

					modal.open();
				} else {
					new MigrateDailyNoteModal(this.app).open();
				}
			} else {
				const clipperSettings = this.settings.clippers.find(
					(c) => c.clipperId === clipperId
				);
				// A bookmarklet can outlive its clipper (deleted in settings).
				if (!clipperSettings) {
					new Notice(UNKNOWN_CLIPPER_NOTICE);
					return;
				}
				// Check before advanced storage, which would otherwise write a
				// per-domain note for a clip that never reaches a target note.
				if (!hasKnownType(clipperSettings)) {
					return;
				}

				try {
					let entryReference = highlightData;

					if (clipperSettings.advancedStorage && highlightData) {
						const domain = Utility.parseDomainFromUrl(url);
						entryReference = await new AdvancedNoteEntry(
							this.app,
							clipperSettings.advancedStorageFolder
						).writeToAdvancedNoteStorage(domain, highlightData, url);
					}

					const noteEntry = new ClippedData(
						title,
						url,
						clipperSettings,
						this.app,
						entryReference,
						comments
					);

					await this.writeNoteEntry(clipperSettings, noteEntry);
				} catch (error) {
					console.error('Obsidian Clipper failed to save a clip', error);
					new Notice(writeFailedNotice(clipperSettings.name, error));
				}
			}
		});

		this.registerView(VIEW_TYPE, (leaf) => new BookmarkletLinksView(leaf));
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);

			await leaf?.setViewState({ type: VIEW_TYPE, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		const settingsData = await this.loadData();
		let changed = false;

		// Existing data
		if (settingsData !== null) {
			if (!settingsData.hasOwnProperty('version')) {
				console.log(
					"Settings exist and haven't been migrated to version 2 or higher"
				);
				this.settings = this.mergeExistingSetting(settingsData);
				changed = true;
			} else {
				this.settings = settingsData;
			}
		} else {
			// Fresh install: save right away so the default clipper's ID
			// survives a restart and its bookmarklet keeps working.
			this.settings = structuredClone(DEFAULT_SETTINGS);
			this.settings.clippers.forEach((clipper) => {
				clipper.clipperId = crypto.randomUUID();
			});
			changed = true;
		}

		// Bookmarklets target the stored vault name, so an empty one never
		// reaches Obsidian. Earlier fresh installs saved clippers without it.
		const vaultName = this.app.vault.getName();
		this.settings.clippers.forEach((clipper) => {
			if (!clipper.vaultName) {
				clipper.vaultName = vaultName;
				changed = true;
			}
		});

		if (changed) {
			await this.saveSettings();
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	mergeExistingSetting(
		settingsData: OldClipperSettings
	): ObsidianClipperPluginSettings {
		const mergedSettings = structuredClone(
			DEFAULT_SETTINGS_EMPTY
		) as ObsidianClipperPluginSettings;
		if (settingsData.useDailyNote === true) {
			const dailyTransfered = structuredClone(
				DEFAULT_CLIPPER_SETTING
			) as ObsidianClipperSettings;
			dailyTransfered.clipperId = crypto.randomUUID();
			dailyTransfered.type = 'daily';
			dailyTransfered.name = settingsData.dailyNoteHeading;
			dailyTransfered.vaultName = this.app.vault.getName();
			dailyTransfered.heading = settingsData.dailyNoteHeading;
			dailyTransfered.tags = settingsData.tags;
			dailyTransfered.timestampFormat = settingsData.timestampFormat;
			dailyTransfered.dateFormat = settingsData.dateFormat;
			dailyTransfered.openOnWrite = settingsData.dailyOpenOnWrite;
			dailyTransfered.position = settingsData.dailyPosition;
			dailyTransfered.entryTemplateLocation =
				settingsData.dailyEntryTemplateLocation;
			dailyTransfered.markdownSettings = settingsData.markdownSettings;
			dailyTransfered.captureComments = settingsData.captureComments === true;
			dailyTransfered.advancedStorage = settingsData.advanced;
			dailyTransfered.advancedStorageFolder =
				settingsData.advancedStorageFolder;
			mergedSettings.clippers.push(dailyTransfered);
		}

		if (settingsData.useWeeklyNote === true) {
			const weeklyTransfered = structuredClone(
				DEFAULT_CLIPPER_SETTING
			) as ObsidianClipperSettings;
			weeklyTransfered.clipperId = crypto.randomUUID();
			weeklyTransfered.type = 'weekly';
			weeklyTransfered.name = settingsData.weeklyNoteHeading;
			weeklyTransfered.vaultName = this.app.vault.getName();
			weeklyTransfered.heading = settingsData.weeklyNoteHeading;
			weeklyTransfered.tags = settingsData.tags;
			weeklyTransfered.timestampFormat = settingsData.timestampFormat;
			weeklyTransfered.dateFormat = settingsData.dateFormat;
			weeklyTransfered.openOnWrite = settingsData.weeklyOpenOnWrite;
			weeklyTransfered.position = settingsData.weeklyPosition;
			weeklyTransfered.entryTemplateLocation =
				settingsData.weeklyEntryTemplateLocation;
			weeklyTransfered.markdownSettings = settingsData.markdownSettings;
			weeklyTransfered.captureComments = settingsData.captureComments === true;
			weeklyTransfered.advancedStorage = settingsData.advanced;
			weeklyTransfered.advancedStorageFolder =
				settingsData.advancedStorageFolder;
			mergedSettings.clippers.push(weeklyTransfered);
		}

		return mergedSettings;
	}

	handleCopyBookmarkletToClipboard(clipper: ObsidianClipperSettings) {
		navigator.clipboard.writeText(
			new BookmarketlGenerator(
				clipper.clipperId,
				this.app.vault.getName(),
				clipper.notePath,
				clipper.headingLevel,
				clipper.captureComments.toString()
			).generateBookmarklet()
		);
		new Notice('Obsidian Clipper Bookmarklet copied to clipboard.');
	}

	handleCopyShortcutToClipboard(clipper: ObsidianClipperSettings) {
		navigator.clipboard.writeText(
			new ShortcutLinkGenerator(clipper).generateShortcutLink()
		);
	}

	/**
	 * Finds a canvas clipper's canvas, or shows a notice and returns null.
	 * The old Canvas Bookmarklet command saved only the file name, so a bare
	 * name that is not at the vault root is looked up by name; a unique match
	 * is used and its full path saved on the clipper.
	 */
	resolveCanvas(clipperSettings: ObsidianClipperSettings): TFile | null {
		const { notePath } = clipperSettings;
		const file = this.app.vault.getAbstractFileByPath(notePath);
		if (file instanceof TFile) return file;

		if (!notePath.includes('/')) {
			const matches = this.app.vault
				.getFiles()
				.filter((f) => f.extension === 'canvas' && f.name === notePath);
			if (matches.length === 1) {
				clipperSettings.notePath = matches[0].path;
				void this.saveSettings();
				return matches[0];
			}
			if (matches.length > 1) {
				new Notice(ambiguousCanvasNotice(notePath));
				return null;
			}
		}
		new Notice(missingCanvasNotice(notePath));
		return null;
	}

	async writeNoteEntry(
		clipperSettings: ObsidianClipperSettings,
		noteEntry: ClippedData
	): Promise<void> {
		const type = clipperSettings.type;
		if (!hasKnownType(clipperSettings)) {
			return;
		}
		if (type === ClipperType.TOPIC || type === ClipperType.CANVAS) {
			const file = this.app.vault.getAbstractFileByPath(
				clipperSettings.notePath
			);
			if (type === ClipperType.CANVAS) {
				const canvas = this.resolveCanvas(clipperSettings);
				if (canvas) {
					await new CanvasEntry(this.app).writeToCanvas(canvas, noteEntry);
				}
			} else {
				await new TopicNoteEntry(
					this.app,
					clipperSettings.openOnWrite,
					clipperSettings.position,
					clipperSettings.entryTemplateLocation
				).writeToNote(
					file,
					noteEntry,
					clipperSettings.heading,
					clipperSettings.headingLevel
				);
			}
		} else {
			if (type === ClipperType.DAILY) {
				await new DailyPeriodicNoteEntry(
					this.app,
					clipperSettings.openOnWrite,
					clipperSettings.position,
					clipperSettings.entryTemplateLocation
				).writeToPeriodicNote(
					noteEntry,
					clipperSettings.heading,
					clipperSettings.headingLevel
				);
			}

			if (type === ClipperType.WEEKLY) {
				await new WeeklyPeriodicNoteEntry(
					this.app,
					clipperSettings.openOnWrite,
					clipperSettings.position,
					clipperSettings.entryTemplateLocation
				).writeToPeriodicNote(
					noteEntry,
					clipperSettings.heading,
					clipperSettings.headingLevel
				);
			}
		}
	}
}

class SettingTab extends PluginSettingTab {
	plugin: ObsidianClipperPlugin;
	private view: ReturnType<typeof mount>;

	constructor(app: App, plugin: ObsidianClipperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		init(this.plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		this.view = mount(SettingsComponent, {
			target: containerEl,
			props: {
				app: this.app,
			},
		});
	}

	async hide() {
		super.hide();
		unmount(this.view);
	}
}
