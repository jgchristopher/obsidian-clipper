import {
	App,
	Notice,
	TFile,
	TFolder,
	base64ToArrayBuffer,
	type HeadingCache,
	type SectionCache,
	WorkspaceLeaf,
} from 'obsidian';
import { Utility } from 'src/utils/utility';

export abstract class FileWriter {
	protected app: App;
	private openFileOnWrite: boolean;

	protected abstract positionDataWithNoHeader(
		fileData: string,
		clippedData: string,
		startLine: number
	): string;

	protected abstract positionDataWithHeader(
		targetSection: string[],
		clippedData: string
	): string[];

	constructor(app: App, openFileOnWrite: boolean) {
		this.app = app;
		this.openFileOnWrite = openFileOnWrite;
	}

	public async write(
		file: TFile,
		clippedData: string,
		heading?: string
	): Promise<TFile> {
		const fileData = await this.app.vault.read(file);
		const fileLines = fileData.split('\n');

		if (!heading) {
			const startLine = this.getEndOfFrontmatter(file);

			return this.writeAndOpenFile(
				file.path,
				this.positionDataWithNoHeader(fileData, clippedData, startLine)
			);
		} else {
			let insertSection: { firstLine: number; lastLine?: number } = {
				firstLine: 0,
				lastLine: 0,
			};
			try {
				insertSection = this.getEndAndBeginningOfHeading(file, heading);
			} catch (e) {
				throw Error('Missing Expected Heading');
			}

			const preSectionContent = fileLines.slice(0, insertSection.firstLine); // This should include the header
			let targetSection: string[];

			// This is the last Section in the document
			if (insertSection.lastLine === -1) {
				targetSection = fileLines.slice(insertSection.firstLine); // This should not include the header
			} else {
				// There is another section in the document
				targetSection = fileLines.slice(
					insertSection.firstLine,
					insertSection.lastLine
				);
			}

			// Going to remove blank lines TODO: This may not be a great idea
			targetSection = targetSection.filter((line) => {
				return line !== '';
			});

			targetSection = this.positionDataWithHeader(targetSection, clippedData);
			let lines: string[] = [];

			if (insertSection.lastLine !== -1) {
				const postSectionContent = fileLines.slice(insertSection.lastLine);
				// now merge all of the section back together
				lines = [...preSectionContent, ...targetSection, ...postSectionContent];
			} else {
				// We should append to the end of the file
				lines = [...preSectionContent, ...targetSection];
			}

			return this.writeAndOpenFile(file.path, lines.join('\n'));
		}
	}

	private async writeAndOpenFile(
		outputFileName: string,
		text: string
	): Promise<TFile> {
		const file = this.app.vault.getAbstractFileByPath(outputFileName);

		if (file instanceof TFile) {
			await this.app.vault.modify(file, text);
		} else {
			const parts = outputFileName.split('/');
			const dir = parts.slice(0, parts.length - 1).join('/');
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
			this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
				if (leaf.view.file?.path === outputFileName) {
					fileIsAlreadyOpened = true;
					this.app.workspace.setActiveLeaf(leaf, { focus: true });
				}
			});

			if (!fileIsAlreadyOpened)
				await this.app.workspace.openLinkText(outputFileName, '', false);
		}

		return this.app.vault.getAbstractFileByPath(outputFileName) as TFile;
	}

	private getEndAndBeginningOfHeading(
		file: TFile,
		heading: string
	): { lastLine: number; firstLine: number } {
		// Get the CachedMetadata for this file
		const cache = this.app.metadataCache.getFileCache(file);
		Utility.assertNotNull(cache);
		heading = Utility.cleanHeading(heading);
		try {
			const cachedHeadings = cache.headings;
			Utility.assertNotNull(cachedHeadings);
			return this.findStartAndAppendFromHeadingInCache(heading, cachedHeadings);
		} catch (e) {
			new Notice("Can't find heading");
			throw Error('Heading not found');
		}
	}

	private findStartAndAppendFromHeadingInCache(
		heading: string,
		cachedHeadings: HeadingCache[]
	) {
		// We need to see if the configured heading exists in the document
		const foundHeadingIndex = cachedHeadings.findIndex((cachedHeading) => {
			return cachedHeading.heading === heading && cachedHeading.level === 1;
		});

		if (foundHeadingIndex !== -1) {
			const foundHeading = cachedHeadings[foundHeadingIndex];
			let nextHeading: HeadingCache | null = null;
			// Need to find the next level 1 heading, if any
			for (let i = foundHeadingIndex + 1; i < cachedHeadings?.length; i++) {
				const cachedHeading = cachedHeadings[i];
				if (cachedHeading.level === 1) {
					nextHeading = cachedHeading;
					break;
				}
			}

			const prependLine = foundHeading.position.start.line; // line after the Heading
			let appendLine = -1;
			if (nextHeading) {
				// Figure out Append location based on the nextHeading
				appendLine = nextHeading.position.start.line; // The line before the next heading
			}
			return { lastLine: appendLine, firstLine: prependLine };
		} else {
			throw Error('Heading not found');
		}
	}

	private getEndOfFrontmatter(file: TFile) {
		let endLine = 0;
		if (file) {
			const cache = this.app.metadataCache;
			if (cache) {
				const sections = cache.getFileCache(file)?.sections;
				const frontmatter = sections?.find((item: SectionCache) => {
					return item.type === 'yaml';
				});
				if (frontmatter) {
					endLine = frontmatter.position.end.line;
				}
			}
		}
		return endLine + 1;
	}
}
