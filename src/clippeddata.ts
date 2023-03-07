import type { App } from 'obsidian';
import type { ObsidianClipperSettings } from './settings/types';
import { getTemplateContents, applyTemplateTransformations } from './utils';

export class ClippedData {
	private tags: string;
	private timeStamp: string;

	constructor(
		private title: string,
		private url: string,
		private comment: string,
		private settings: ObsidianClipperSettings,
		private app: App,
		private data = ''
	) {
		this.title = title;
		this.url = url;
		this.comment = comment;
		if (data !== '') {
			this.data = data;
		}
		const tagJoins: string[] = [];
		settings.tags.split(',').forEach((t) => {
			tagJoins.push(`#${t}`);
		});
		this.tags = tagJoins.join(' ');
		this.settings = settings;

		this.app = app;
		this.timeStamp = window.moment().format(this.settings.timestampFormat);
	}

	public async formattedEntry(template?: string): Promise<string> {
		let formattedData = '';

		if (template && template != '') {
			const rawTemplateContents = await getTemplateContents(this.app, template);
			formattedData = applyTemplateTransformations(
				this.title,
				this.url,
				this.tags,
				this.timeStamp,
				this.comment,
				this.data,
				rawTemplateContents
			);
		} else {
			if (!this.data) {
				formattedData = `- [ ] [${this.title}](${this.url}) ${this.tags}\n\n---`;
			} else {
				formattedData = `- [ ] [${this.title}](${this.url}) ${this.tags}\n${this.data}\n\n---`;
			}
		}
		return formattedData;
	}
}
