import {
	App,
	TAbstractFile,
	TFile,
	TFolder,
	Notice,
	HeadingCache,
	base64ToArrayBuffer,
} from "obsidian";
import { ClippedNoteEntry } from "../clippednoteentry";
import type { Moment } from "moment";

export const Position = {
	PREPEND: "prepend",
	APPEND: "append",
};
export type Position = typeof Position[keyof typeof Position];

export abstract class PeriodicNoteEntry {
	protected app: App;
	protected notice: string;
	protected openFileOnWrite: boolean;
	protected position: Position;

	constructor(app: App, openFileOnWrite: boolean, position: Position) {
		this.app = app;
		this.openFileOnWrite = openFileOnWrite;
		this.position = position;
	}
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
			this.position,
			heading
		);
	}

	async handleWrite(
		noteFilePath: string,
		data: string,
		position: Position,
		heading?: string
	) {
		let file: TAbstractFile | null;
		file = this.app.vault.getAbstractFileByPath(noteFilePath);

		if (file instanceof TFile) {
			if (heading) {
				if (position === Position.PREPEND) {
					await this.prepend(file, data, heading);
				} else {
					await this.append(file, data, heading);
				}
			} else {
				// Append to end of file
				await this.append(file, data, heading);
			}
		} else {
			new Notice(
				`Obsidian Clipper couldn't find the note to ${position} to`
			);
		}
	}

	private async prepend(
		file: TFile,
		clippedData: string,
		heading: string
	): Promise<TFile> {
		let insertSection: { firstLine: number; lastLine?: number } = {
			firstLine: 0,
			lastLine: 0,
		};
		try {
			insertSection = this.getEndAndBeginningOfHeading(file, heading);
		} catch (e) {
			throw Error("Missing Expected Heading");
		}

		const fileData = await this.app.vault.read(file);
		const fileLines = fileData.split("\n");

		const preSectionContent = fileLines.slice(0, insertSection.firstLine);
		const targetSection = fileLines.slice(
			insertSection.firstLine,
			insertSection.lastLine
		);
		targetSection.splice(1, 0, clippedData); // prepend the clipped data onto the target section array of lines

		let lines: string[] = [];

		if (insertSection.lastLine !== -1) {
			const postSectionContent = fileLines.slice(insertSection.lastLine);
			// now merge all of the section back together
			lines = [
				...preSectionContent,
				...targetSection,
				...postSectionContent,
			];
		} else {
			// We should append to the end of the file
			lines = [...preSectionContent, ...targetSection];
		}
		return this.writeAndOpenFile(file.path, lines.join("\n"));
	}

	private async append(
		file: TFile,
		clippedData: string,
		heading?: string
	): Promise<TFile> {
		if (!heading) {
			let dataToWrite: string;
			let fileData = await this.app.vault.read(file);
			dataToWrite = fileData + "\n" + clippedData;
			return this.writeAndOpenFile(file.path, dataToWrite);
		} else {
			let insertSection: { firstLine: number; lastLine?: number } = {
				firstLine: 0,
				lastLine: 0,
			};
			try {
				insertSection = this.getEndAndBeginningOfHeading(file, heading);
			} catch (e) {
				throw Error("Missing Expected Heading");
			}

			const fileData = await this.app.vault.read(file);
			const fileLines = fileData.split("\n");

			const preSectionContent = fileLines.slice(
				0,
				insertSection.firstLine
			);
			const targetSection = fileLines.slice(
				insertSection.firstLine,
				insertSection.lastLine
			);
			targetSection.push(clippedData); // append the clipped data onto the target section array of lines

			let lines: string[] = [];

			if (insertSection.lastLine !== -1) {
				const postSectionContent = fileLines.slice(
					insertSection.lastLine
				);
				// now merge all of the section back together
				lines = [
					...preSectionContent,
					...targetSection,
					...postSectionContent,
				];
			} else {
				// We should append to the end of the file
				lines = [...preSectionContent, ...targetSection];
			}
			return this.writeAndOpenFile(file.path, lines.join("\n"));
		}
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
		// Get the CachedMetadata for this file
		const cache = this.app.metadataCache.getFileCache(file);
		if (cache) {
			try {
				let cachedHeadings = cache.headings;
				if (cachedHeadings) {
					// We need to see if the configured heading exists in the document
					const foundHeadingIndex = cachedHeadings.findIndex(
						(cachedHeading) => {
							if (
								cachedHeading.heading === heading &&
								cachedHeading.level === 1
							) {
								return true;
							} else {
								return false;
							}
						}
					);

					if (foundHeadingIndex) {
						const foundHeading = cachedHeadings[foundHeadingIndex];
						let nextHeading: HeadingCache | null = null;
						// Need to find the next level 1 heading, if any
						for (
							let i = foundHeadingIndex + 1;
							i < cachedHeadings?.length;
							i++
						) {
							let cachedHeading = cachedHeadings[i];
							if (cachedHeading.level === 1) {
								nextHeading = cachedHeading;
								break;
							}
						}

						let prependLine = foundHeading.position.start.line;
						let appendLine = -1;
						if (nextHeading) {
							// Figure out Append location based on the nextHeading
							appendLine = nextHeading.position.start.line;
						}
						return { lastLine: appendLine, firstLine: prependLine };
					} else {
						throw Error("Heading not found");
					}
				} else {
					throw Error("Heading not found");
				}
			} catch (e) {
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
