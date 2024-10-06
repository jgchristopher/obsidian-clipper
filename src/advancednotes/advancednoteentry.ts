import { Notice, TFile, TFolder, type App } from 'obsidian';
import { NoteEntry } from 'src/abstracts/noteentry';
import { AppendWriter } from 'src/periodicnotes/appendwriter';
import { SectionPosition } from 'src/settings/types';
import type ObsidianClipperPlugin from 'src/main';
import moment from 'moment';

export class AdvancedNoteEntry extends NoteEntry {
	private storageFolder: string;
	private plugin: ObsidianClipperPlugin;
	public separator: string;

	constructor (app: App, plugin: ObsidianClipperPlugin, storageFolder: string) {
		super(app, false, SectionPosition.APPEND, '');
		this.storageFolder = storageFolder;
		this.plugin = plugin;
		this.separator = `\n\n---\n\n`;
	}

	async writeToAdvancedNoteStorage (
		hostName: string,
		url: string,
		title: string,
		description: string,
		highlightedContent?: string,
		comments?: string
	) {
		// Formatting/processing
		const uriHasPrefix = hostName.match(/^[\w:/]+?\.(?=\S+?\.)/);
		const baseURI = uriHasPrefix
			? hostName.slice(uriHasPrefix[0].length)
			: hostName;
		const noteFilePath = `${this.storageFolder}/${baseURI}.md`;
		const commentData =
			comments && comments.length > 0 ? `#### Notes\n${comments}` : '';
		const descriptionData =
			description && description.length > 0
				? `#### Description\n${description}`
				: ``;
		const titleData = `- [ ] [${title}](${url})`;
		const formattedHighlightData = highlightedContent
			? this.getHighlightFormat(highlightedContent)
			: '';

		// Putting it all together
		const file = await this.getFile(noteFilePath, baseURI);
		const supplementalData = `${descriptionData}\n${commentData}\n${formattedHighlightData}`;
		const { entry, nextFootnoteIndex } = await this.getEntryWithIndex(
			titleData,
			url,
			supplementalData,
			file
		);

		await new AppendWriter(this.app, this.openFileOnWrite).write(file, entry);

		return `![[${noteFilePath}#${
			this.getCurrentDateTime().currentDate
		}|${baseURI}-${nextFootnoteIndex}]]`;
	}

	async getEntryWithIndex (
		title: string,
		url: string,
		data: string,
		file: TFile
	): Promise<{ entry: string; nextFootnoteIndex: number }> {
		const { nextFootnoteIndex, sectionHeader } = await this.getReferenceData(
			file
		);
		const entry = `${sectionHeader}\n${title} [^${nextFootnoteIndex}]\n${data}\n\n[^${nextFootnoteIndex}]: ${url}`;
		return {
			entry,
			nextFootnoteIndex,
		};
	}

	async getReferenceData (
		file: TFile
	): Promise<{ nextFootnoteIndex: number; sectionHeader: string }> {
		const fileContent = await this.app.vault.read(file);
		const { currentDate, currentTime } = this.getCurrentDateTime();

		//  Custom regex to detect main date headers of the file
		const detectDateRegex = new RegExp(`(?<=^## )${currentDate}`, 'gm');
		const hasDateHeader = fileContent.match(detectDateRegex);
		let hasOldHeader = false;
		// Only check if the date header is old if todays date is already in the file
		if (hasDateHeader) {
			hasOldHeader = moment(
				hasDateHeader[0],
				this.plugin.settings.dateFormat
			).isBefore(moment(currentDate, this.plugin.settings.dateFormat));
		}

		// Count the amount of footnotes previously mentioned (referenced by the
		// specific format of each web-clip header) to obtain the next footnote index
		const nextFootnoteIndex = (fileContent.match(/^###\s/gm)?.length ?? 0) + 1;
		// Either include the date header with the timestamped header (if needed), or just the timestamped header
		const sectionHeader =
			!hasDateHeader || hasOldHeader
				? `## ${currentDate}${this.separator}### **${currentTime}**` // create a new section for the new date
				: `${this.separator}### **${currentTime}**`; // append to the existing date section
		return {
			sectionHeader,
			nextFootnoteIndex,
		};
	}

	async getFile (noteFilePath: string, baseURI: string): Promise<TFile> {
		const folder = this.app.vault.getAbstractFileByPath(this.storageFolder);
		let file = this.app.vault.getAbstractFileByPath(noteFilePath);

		if (!(file instanceof TFile)) {
			// create the file and write data
			if (!(folder instanceof TFolder)) {
				await this.app.vault.createFolder(this.storageFolder);
				await new Promise(r => setTimeout(r, 50));
			}
			const formattedHeaderURI =
				baseURI.charAt(0).toUpperCase() + baseURI.slice(1);
			file = await this.app.vault.create(
				noteFilePath,
				`# ${formattedHeaderURI}`
			);
			if (!file || !(file instanceof TFile)) {
				const errorMessage = `Unable to create clipper storage file. Most likely ${this.storageFolder} doesn't exist and we were unable to create it.`;
				console.error(errorMessage);
				new Notice(errorMessage);
				throw Error(errorMessage);
			}
		}
		await new Promise(r => setTimeout(r, 50));
		return file;
	}

	/**
	 * @description
	 * This was created to assist with folding everything together (if you're willing to install the
	 * `Admonitions` plugin)...
	 * I felt this was needed because, when you highlight content with various headers, they may over-rule
	 * the target file's headers and prevent proper folding.
	 * With or without Admonitions, placing the highlighted content within a quote block allows for complete
	 * folding regardless of the header levels within the content that was highlighted from the page.
	 */
	getHighlightFormat (highlightedContent: string): string {
		if (!(highlightedContent.length > 0)) {
			return '';
		}
		let newHighlightData = highlightedContent;
		//newHighlightData = `#### Highlights\n\`\`\`ad-note\ntitle: Highlighted Content\ncollapse: true\n\n${highlightedContent.replaceAll(/```/g, '~~~')}\n\`\`\``;
		if (this.plugin.hasAdmonitionsPlugin) {
			// add the highlighted content within an admonition code block
			newHighlightData = `#### Highlights\n\`\`\`ad-note\ntitle: Highlighted Content\ncollapse: true\n\n${highlightedContent.replaceAll(
				/```/g,
				'~~~'
			)}\n\`\`\``;
		} else {
			// add the highlighted content within a regular quote block
			newHighlightData = `#### Highlights\n> [!info] Highlighted Content\n${highlightedContent
				.split('\n')
				.map(line => `> ${line}`)
				.join('\n')}`;
		}
		return newHighlightData;
	}

	getCurrentDateTime (): { currentDate: string; currentTime: string } {
		const currentDate = moment().format(this.plugin.settings.dateFormat);
		const currentTime = moment().format(this.plugin.settings.timestampFormat);
		return {
			currentDate,
			currentTime,
		};
	}
}
