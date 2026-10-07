import type { App } from 'obsidian';
import type { ObsidianClipperSettings } from './settings/types';
import {
	getTemplateContents,
	applyTemplateTransformations,
} from './utils/templateutils';

export class ClippedData {
	private tags: string;
	private data?: string | undefined;
	private settings: ObsidianClipperSettings;
	private app: App;
	private timeStamp: string;
	private date: string;
	private comment: string;

	constructor(
		private title: string,
		private url: string,
		settings: ObsidianClipperSettings,
		app: App,
		data = '',
		comment = ''
	) {
		this.title = title;
		this.url = url;
		if (data !== '') {
			this.data = data;
		}
		this.comment = comment;
		this.tags = '';

		if (settings.tags !== '') {
			const tagJoins: string[] = [];
			settings.tags.split(',').forEach((t) => {
				tagJoins.push(`#${t.replaceAll(' ', '')}`);
			});
			this.tags = tagJoins.join(' ');
		}

		this.settings = settings;
		this.app = app;
		this.timeStamp = window.moment().format(this.settings.timestampFormat);
		this.date = window.moment().format(this.settings.dateFormat);
	}

	public async formattedEntry(template?: string): Promise<string> {
		if (template && template != '') {
			const rawTemplateContents = await getTemplateContents(this.app, template);
			// A missing template falls back to the default format below.
			if (rawTemplateContents !== null) {
				return applyTemplateTransformations(
					this.title,
					this.url,
					this.tags,
					this.timeStamp,
					this.date,
					this.data,
					this.comment,
					rawTemplateContents
				);
			}
		}

		if (!this.data) {
			return `- [ ] [${this.title}](${this.url}) ${this.tags}\n\n---`;
		}
		if (this.settings.advancedStorage) {
			// The Advanced format has the url as a footnote of the clipped data
			return `- [ ] ${this.title} ${this.tags}\n${this.data}\n >${this.comment} \n\n---`;
		}
		// Else make the title a link
		return `- [ ] [${this.title}](${this.url}) ${this.tags}\n${this.data}\n >${this.comment} \n\n---`;
	}

	public getUrl() {
		return this.url;
	}

	public getEntryContent() {
		return this.data;
	}
}
