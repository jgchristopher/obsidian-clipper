import type { ObsidianClipperMarkdownSettings } from '../../../settings/types';
import TurndownService from 'turndown';
import { MarkdownTables } from './tables';

export class MarkdownProcessor {
	data?: string;
	constructor(data?: string) {
		this.data = data;
	}

	public process(
		markdownSettings: ObsidianClipperMarkdownSettings
	): string | undefined {
		let markdownData = this.data;
		if (this.data) {
			const markdownService = new TurndownService({
				headingStyle: 'atx',
				hr: '---',
				bulletListMarker: '-',
				codeBlockStyle: 'fenced',
				emDelimiter: '*',
			});
			const tables = new MarkdownTables();
			markdownService.use(tables.tables);
			markdownService.addRule('heading_1_update', {
				filter: ['h1'],
				replacement: function (content: string) {
					return `${markdownSettings.h1} ${content}`;
				},
			});
			markdownService.addRule('heading_2_update', {
				filter: ['h2'],
				replacement: function (content: string) {
					return `${markdownSettings.h2} ${content}`;
				},
			});
			markdownService.addRule('heading_3_update', {
				filter: ['h3'],
				replacement: function (content: string) {
					return `${markdownSettings.h3} ${content}`;
				},
			});
			markdownService.addRule('heading_4_update', {
				filter: ['h4'],
				replacement: function (content: string) {
					return `${markdownSettings.h4} ${content}`;
				},
			});
			markdownService.addRule('heading_5_update', {
				filter: ['h5'],
				replacement: function (content: string) {
					return `${markdownSettings.h5} ${content}`;
				},
			});
			markdownService.addRule('heading_6_update', {
				filter: ['h6'],
				replacement: function (content: string) {
					return `${markdownSettings.h6} ${content}`;
				},
			});
			markdownData = markdownService.turndown(this.data);
		}

		return markdownData;
	}
}
