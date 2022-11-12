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
import { Parameters } from "./types";
import { ObsidianClipperSettings, DEFAULT_SETTINGS } from "./settings";
import { DailyNoteEntry } from "./daily_note_entry";
import { BookmarketlGenerator } from "./bookmarkletgenerator";

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

			let dailyNoteFilePath: string;
			if (!appHasDailyNotesPluginLoaded()) {
				new Notice("Daily notes plugin is not loaded");
				return;
			}
			const moment = window.moment(Date.now());
			const allDailyNotes = getAllDailyNotes();
			let dailyNote = getDailyNote(moment, allDailyNotes);
			if (!dailyNote) {
				dailyNote = await this.waitForDailyNoteCreation(moment);
				await new Promise((r) => setTimeout(r, 50));
			}

			dailyNoteFilePath = dailyNote.path;
			let dailyNoteEntry = new DailyNoteEntry(
				title,
				url,
				this.settings,
				this.app,
				highlightData
			);

			this.handleWrite(
				dailyNoteFilePath,
				await dailyNoteEntry.formattedEntry(),
				this.settings.heading
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

	async handleWrite(
		dailyNoteFilePath: string,
		data: string,
		heading?: string
	) {
		let file: TAbstractFile | null;
		file = this.app.vault.getAbstractFileByPath(dailyNoteFilePath);

		if (dailyNoteFilePath) {
			if (file instanceof TFile) {
				if (heading) {
					await this.prepend(file, heading, data);
				} else {
					await this.append(file, data);
				}
			}
		}
	}

	async prepend(
		file: TFile,
		heading: string,
		highlightData: string
	): Promise<TFile> {
		let dataToWrite: string;
		let path = file.path;
		const line = this.getEndAndBeginningOfHeading(file, heading)?.firstLine;
		if (line === undefined) throw Error("Missing Expected Heading");

		const data = await this.app.vault.read(file);
		const lines = data.split("\n");

		lines.splice(line, 0, ...highlightData.split("\n"));
		dataToWrite = lines.join("\n");

		return this.writeAndOpenFile(path, dataToWrite);
	}

	async append(file: TFile, data: string): Promise<TFile> {
		let dataToWrite: string;
		let fileData = await this.app.vault.read(file);
		dataToWrite = fileData + "\n" + data;
		return this.writeAndOpenFile(file.path, dataToWrite);
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

	handleCopyBookmarkletCommand() {
		navigator.clipboard.writeText(
			new BookmarketlGenerator(
				this.app.vault.getName()
			).generateBookmarklet()
		);
		new Notice("Obsidian Clipper Bookmarklet copied to clipboard.");
	}

	async waitForDailyNoteCreation(moment: Moment): Promise<TFile> {
		let dailyNote = await createDailyNote(moment);
		await new Promise((r) => setTimeout(r, 50));
		return dailyNote;
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

		containerEl.createEl("h2", { text: "Obsidian Clipper Settings" });

		// new Setting(containerEl)
		// 	.setName("Add Daily Note Entry?")
		// 	.addToggle((cb) =>
		// 		cb
		// 			.onChange((value) => {
		// 				this.plugin.settings.useDailyNote = value;
		// 				this.plugin.saveSettings();
		// 			})
		// 			.setValue(this.plugin.settings.useDailyNote)
		// 	);

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

		new Setting(containerEl)
			.setName("Clipped Entry Template")
			.setDesc(
				"Choose the file to use as a template for the clipped entry"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.dailyEntryTemplateLocation)
					.onChange(async (value) => {
						this.plugin.settings.dailyEntryTemplateLocation = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.appendChild(
			createEl("div", {
				text: "You can drag or copy the link below to your browser bookmark bar. This bookmarklet will allow you to highlight information on the web and send it to obsidian",
			})
		);

		containerEl.appendChild(
			createEl("a", {
				text: `Obsidian Clipper (${this.app.vault.getName()})`,
				href: new BookmarketlGenerator(
					this.app.vault.getName()
				).generateBookmarklet(),
			})
		);
	}
}
