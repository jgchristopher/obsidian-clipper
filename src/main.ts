import { App, Notice, PluginSettingTab, Plugin } from "obsidian";

import type { Parameters } from "./types";
import { type ObsidianClipperSettings, DEFAULT_SETTINGS } from "./settings";
import { ClippedNoteEntry } from "./clippednoteentry";
import { BookmarketlGenerator } from "./bookmarkletgenerator";
import { DailyPeriodicNoteEntry } from "./periodicnotes/dailyperiodicnoteentry";
import { WeeklyPeriodicNoteEntry } from "./periodicnotes/weeklyperiodicnoteentry";
import SettingsComponent from "./settings/SettingsComponent.svelte";
import { writable } from "svelte/store";
import type { SvelteComponent } from "svelte";

export default class ObsidianClipperPlugin extends Plugin {
	settings: ObsidianClipperSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: "copy-bookmarklet-address",
			name: "copy the Obsidian Clipper bookmarklet for this vault",
			callback: () => this.handleCopyBookmarkletCommand(),
		});

		this.registerObsidianProtocolHandler("obsidian-clipper", async (e) => {
			const parameters = e as unknown as Parameters;

			let url = parameters.url;
			let title = parameters.title;
			let highlightData = parameters.highlightdata;

			let noteEntry = new ClippedNoteEntry(
				title,
				url,
				this.settings,
				this.app,
				highlightData
			);

			if (this.settings.useDailyNote) {
				new DailyPeriodicNoteEntry(
					this.app,
					this.settings.openFileOnWrite,
					this.settings.dailyPosition
				).writeToPeriodicNote(
					noteEntry,
					this.settings.dailyNoteHeading
				);
			}

			if (this.settings.useWeeklyNote) {
				new WeeklyPeriodicNoteEntry(
					this.app,
					this.settings.openFileOnWrite,
					this.settings.weeklyPosition
				).writeToPeriodicNote(
					noteEntry,
					this.settings.weeklyNoteHeading
				);
			}
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	handleCopyBookmarkletCommand() {
		navigator.clipboard.writeText(
			new BookmarketlGenerator(
				this.app.vault.getName()
			).generateBookmarklet()
		);
		new Notice("Obsidian Clipper Bookmarklet copied to clipboard.");
	}
}

class SettingTab extends PluginSettingTab {
	plugin: ObsidianClipperPlugin;
	private view: SvelteComponent;

	constructor(app: App, plugin: ObsidianClipperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		this.view = new SettingsComponent({
			target: containerEl,
			props: {
				settings: writable(this.plugin.settings),
				app: this.app,
			},
		});
	}

	hide() {
		super.hide();
		this.view.$destroy();
	}
}
