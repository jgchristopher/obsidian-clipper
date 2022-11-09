import {
	App,
	Notice,
	PluginSettingTab,
	Setting,
	Plugin,
	TAbstractFile,
	TFile,
	TFolder,
	base64ToArrayBuffer,
} from "obsidian";
import {
	getAllDailyNotes,
	appHasDailyNotesPluginLoaded,
	getDailyNote,
	createDailyNote,
} from "obsidian-daily-notes-interface";
import type { Moment } from "moment";
import { Parameters, ObsidianClipperSettings } from "./types";
import { DailyNoteEntry } from "./daily_note_entry";

const DEFAULT_SETTINGS: ObsidianClipperSettings = {
	heading: "",
	tags: "",
	openFileOnWrite: true,
};

export default class ObsidianClipperPlugin extends Plugin {
	settings: ObsidianClipperSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerObsidianProtocolHandler("obsidian-clipper", async (e) => {
			const parameters = e as unknown as Parameters;

			let url = parameters.url;
			let title = parameters.title;
			let highlightData = parameters.highlightdata;

			console.log("Url: ", url);
			console.log("Title: ", title);
			console.log("Highlight Data: ", highlightData);
			console.log("Settings", this.settings);
			let dailyNoteFilePath: string;
			if (!appHasDailyNotesPluginLoaded()) {
				new Notice("Daily notes plugin is not loaded");
				return;
			}
			const moment = window.moment(Date.now());
			const allDailyNotes = getAllDailyNotes();
			let dailyNote = getDailyNote(moment, allDailyNotes);
			if (!dailyNote) {
				dailyNote = await createDailyNote(moment);
			}

			dailyNoteFilePath = dailyNote.path;
			let dailyNoteEntry = new DailyNoteEntry(
				title,
				url,
				this.settings,
				highlightData
			);

			this.handleWrite(
				dailyNoteFilePath,
				dailyNoteEntry.formattedEntry()
			);
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

	async handleWrite(dailyNoteFilePath: string, highlightData?: string) {
		let file: TAbstractFile | null;
		file = this.app.vault.getAbstractFileByPath(dailyNoteFilePath);

		if (dailyNoteFilePath) {
			let outFile: TFile;

			if (file instanceof TFile && highlightData) {
				outFile = await this.prepend(file, highlightData);
			}
		}
	}

	async prepend(file: TFile, highlightData: string): Promise<TFile> {
		let dataToWrite: string;
		let path = file.path;
		const line = this.getEndAndBeginningOfHeading(
			file,
			this.settings.heading
		)?.firstLine;
		if (line === undefined) throw Error("Missing Expected Heading");

		const data = await this.app.vault.read(file);
		const lines = data.split("\n");

		lines.splice(line, 0, ...highlightData.split("\n"));
		dataToWrite = lines.join("\n");

		return this.writeAndOpenFile(path, dataToWrite);
	}

	async writeAndOpenFile(
		outputFileName: string,
		text: string
	): Promise<TFile> {
		const file = this.app.vault.getAbstractFileByPath(outputFileName);

		if (file instanceof TFile) {
			await this.app.vault.modify(file, text);
		} else {
			const parts = outputFileName.split("/");
			const dir = parts.slice(0, parts.length - 1).join("/");
			if (
				parts.length > 1 &&
				!(this.app.vault.getAbstractFileByPath(dir) instanceof TFolder)
			) {
				await this.app.vault.createFolder(dir);
			}
			const base64regex =
				/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
			if (base64regex.test(text)) {
				await this.app.vault.createBinary(
					outputFileName,
					base64ToArrayBuffer(text)
				);
			} else {
				await this.app.vault.create(outputFileName, text);
			}
		}

		if (this.settings.openFileOnWrite) {
			let fileIsAlreadyOpened = false;
			this.app.workspace.iterateAllLeaves((leaf) => {
				if (leaf.view.file?.path === outputFileName) {
					fileIsAlreadyOpened = true;
					this.app.workspace.setActiveLeaf(leaf, { focus: true });
				}
			});

			if (!fileIsAlreadyOpened)
				await this.app.workspace.openLinkText(
					outputFileName,
					"",
					false
				);
		}

		return this.app.vault.getAbstractFileByPath(outputFileName) as TFile;
	}

	getEndAndBeginningOfHeading(
		file: TFile,
		heading: string
	): { lastLine: number; firstLine: number } {
		const cache = this.app.metadataCache.getFileCache(file);
		if (cache) {
			const sections = cache.sections;
			const foundHeading = cache.headings?.find(
				(e) => e.heading === heading
			);
			if (foundHeading && sections) {
				const foundSectionIndex = sections.findIndex(
					(section) =>
						section.type === "heading" &&
						section.position.start.line ===
							foundHeading.position.start.line
				);
				const restSections = sections.slice(foundSectionIndex + 1);

				const nextHeadingIndex = restSections?.findIndex(
					(e) => e.type === "heading"
				);

				const lastSection =
					restSections[
						(nextHeadingIndex !== -1
							? nextHeadingIndex
							: restSections.length) - 1
					] ?? sections[foundSectionIndex];
				const lastLine = lastSection.position.end.line + 1;

				return {
					lastLine: lastLine,
					firstLine:
						sections[foundSectionIndex].position.end.line + 1,
				};
			} else {
				new Notice("Can't find heading");
				throw Error("Heading not found");
			}
		} else {
			throw Error("No Cache");
		}
	}
}

class SettingTab extends PluginSettingTab {
	plugin: ObsidianClipperPlugin;

	constructor(app: App, plugin: ObsidianClipperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Header")
			.setDesc(
				"What header should highlight data be prepended under in your daily note?"
			)
			.addText((text) =>
				text
					.setPlaceholder("Daily Log")
					.setValue(this.plugin.settings.heading)
					.onChange(async (value) => {
						this.plugin.settings.heading = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Tags")
			.setDesc(
				"What tags would you like added to the captured highlights?"
			)
			.addText((text) =>
				text
					.setPlaceholder("tags,seperated,by,commas")
					.setValue(this.plugin.settings.tags)
					.onChange(async (value) => {
						this.plugin.settings.tags = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
