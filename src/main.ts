import { App, Notice, PluginSettingTab, Setting, Plugin } from "obsidian";

import type { Parameters } from "./types";
import { type ObsidianClipperSettings, DEFAULT_SETTINGS } from "./settings";
import { ClippedNoteEntry } from "./clippednoteentry";
import { BookmarketlGenerator } from "./bookmarkletgenerator";
import { DailyPeriodicNoteEntry } from "./periodicnotes/dailyperiodicnoteentry";
import { WeeklyPeriodicNoteEntry } from "./periodicnotes/weeklyperiodicnoteentry";
import { SectionPosition } from "./periodicnotes/sectionposition";
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

		// const dailySection = containerEl.createEl("div", {
		// 	cls: "clp_section_margin",
		// });

		this.view = new SettingsComponent({
			target: containerEl,
			props: {
				settings: writable(this.plugin.settings),
				app: this.app,
			},
		});

		// dailySection.appendChild(
		// 	createEl("h1", {
		// 		text: "Daily Note Settings",
		// 	})
		// );
		// const weeklySection = containerEl.createEl("div", {
		// 	cls: "clp_section_margin",
		// });
		// weeklySection.appendChild(
		// 	createEl("h1", {
		// 		text: "Weekly Note Settings",
		// 	})
		// );
		// const commonSection = containerEl.createEl("div", {
		// 	cls: "clp_section_margin",
		// });
		// commonSection.appendChild(
		// 	createEl("h1", {
		// 		text: "Common Settings",
		// 	})
		// );

		// new Setting(dailySection)
		// 	.setName("Add Daily Note Entry?")
		// 	.addToggle((cb) =>
		// 		cb
		// 			.onChange((value) => {
		// 				this.plugin.settings.useDailyNote = value;
		// 				this.plugin.saveSettings();
		// 			})
		// 			.setValue(this.plugin.settings.useDailyNote)
		// 	);
		//
		// new Setting(dailySection)
		// 	.setName("Daily Note Header")
		// 	.setDesc(
		// 		"What header should highlight data be prepended under in your daily note?"
		// 	)
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder("Daily Log")
		// 			.setValue(this.plugin.settings.dailyNoteHeading)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.dailyNoteHeading = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);
		//
		// new Setting(dailySection)
		// 	.setName("Daily Note Position")
		// 	.setDesc(
		// 		"Would you like to prepend clippings to the top of the section or append them to the bottom of the section?"
		// 	)
		// 	.addDropdown((select) =>
		// 		select
		// 			.addOption(SectionPosition.PREPEND, SectionPosition.PREPEND)
		// 			.addOption(SectionPosition.APPEND, SectionPosition.APPEND)
		// 			.setValue(this.plugin.settings.dailyPosition)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.dailyPosition = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);

		// new Setting(weeklySection)
		// 	.setName("Add Weekly Note Entry?")
		// 	.addToggle((cb) =>
		// 		cb
		// 			.onChange((value) => {
		// 				this.plugin.settings.useWeeklyNote = value;
		// 				this.plugin.saveSettings();
		// 			})
		// 			.setValue(this.plugin.settings.useWeeklyNote)
		// 	);
		//
		// new Setting(weeklySection)
		// 	.setName("Weekly Note Header")
		// 	.setDesc(
		// 		"What header should highlight data be prepended under in your weekly note?"
		// 	)
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder("Weekly Log")
		// 			.setValue(this.plugin.settings.weeklyNoteHeading)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.weeklyNoteHeading = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);
		//
		// new Setting(weeklySection)
		// 	.setName("Weekly Note Position")
		// 	.setDesc(
		// 		"Would you like to prepend clippings to the top of the section or append them to the bottom of the section?"
		// 	)
		// 	.addDropdown((select) =>
		// 		select
		// 			.addOption(SectionPosition.PREPEND, SectionPosition.PREPEND)
		// 			.addOption(SectionPosition.APPEND, SectionPosition.APPEND)
		// 			.setValue(this.plugin.settings.weeklyPosition)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.weeklyPosition = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);

		// new Setting(commonSection)
		// 	.setName("Tags")
		// 	.setDesc(
		// 		"What tags would you like added to the captured highlights?"
		// 	)
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder("tags,seperated,by,commas")
		// 			.setValue(this.plugin.settings.tags)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.tags = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);

		// let dateFormatDescription = new DocumentFragment();
		//
		// dateFormatDescription.appendChild(
		// 	createEl("div", {
		// 		text: "Format you would like to use for the {{time}} template in clippings. See",
		// 	})
		// );
		// dateFormatDescription.appendChild(
		// 	createEl("a", {
		// 		text: "format reference",
		// 		href: "https://momentjs.com/docs/#/displaying/format/",
		// 	})
		// );

		// new Setting(commonSection)
		// 	.setName("Date Time Format")
		// 	.setDesc(dateFormatDescription)
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder("HH:mm")
		// 			.setValue(this.plugin.settings.timestampFormat)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.timestampFormat = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);
		//
		// new Setting(commonSection)
		// 	.setName("Clipped Entry Template")
		// 	.setDesc(
		// 		"Choose the file to use as a template for the clipped entry"
		// 	)
		// 	.addText((text) =>
		// 		text
		// 			.setValue(this.plugin.settings.dailyEntryTemplateLocation)
		// 			.onChange(async (value) => {
		// 				this.plugin.settings.dailyEntryTemplateLocation = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);

		// containerEl.appendChild(
		// 	createEl("div", {
		// 		text: "You can drag or copy the link below to your browser bookmark bar. This bookmarklet will allow you to highlight information on the web and send it to obsidian",
		// 	})
		// );

		// containerEl.appendChild(
		// 	createEl("a", {
		// 		text: `Obsidian Clipper (${this.app.vault.getName()})`,
		// 		href: new BookmarketlGenerator(
		// 			this.app.vault.getName()
		// 		).generateBookmarklet(),
		// 	})
		// );
	}
}
