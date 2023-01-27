import {
	App,
	TAbstractFile,
	TFile,
	TFolder,
	Notice,
	base64ToArrayBuffer,
} from "obsidian";
import { ClippedNoteEntry } from "./clippednoteentry";
import type { Moment } from "moment";

export abstract class PeriodicNoteEntry {
	protected app: App;
	protected notice: string;
	protected openFileOnWrite: boolean;

	async writeToPeriodicNote(noteEntry: ClippedNoteEntry, heading: string) {
		let noteFilePath: string;

		if (!this.hasPeriodicNoteEnabled()) {
			new Notice(this.notice);
			return;
		}

		const allNotes = this.getAllNotes();
		let note = this.getNote(allNotes);
		if (!note) {
			note = await this.waitForNoteCreation(window.moment());
			await new Promise((r) => setTimeout(r, 50));
		}

		noteFilePath = note.path;

		this.handleWrite(
			noteFilePath,
			await noteEntry.formattedEntry(),
			heading
		);
	}

	async handleWrite(noteFilePath: string, data: string, heading?: string) {
		let file: TAbstractFile | null;
		file = this.app.vault.getAbstractFileByPath(noteFilePath);

		if (noteFilePath) {
			if (file instanceof TFile) {
				if (heading) {
					await this.prepend(file, heading, data);
				} else {
					await this.append(file, data);
				}
			}
		} else {
			new Notice("Obsidian Clipper currently requires Daily notes");
		}
	}

	private async prepend(
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

	private async append(file: TFile, data: string): Promise<TFile> {
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

		if (this.openFileOnWrite) {
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

	protected abstract getAllNotes(): Record<string, TFile>;

	protected abstract getNote(allNotes: Record<string, TFile>): TFile;

	protected abstract hasPeriodicNoteEnabled(): boolean;

	protected abstract waitForNoteCreation(moment: Moment): Promise<TFile>;
}
