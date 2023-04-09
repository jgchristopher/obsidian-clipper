//@ts-ignore
import TurndownService from 'turndown';
import { MarkdownTables } from './markdown/tables';

interface HeadingSettings {
	h1: string;
	h2: string;
	h3: string;
	h4: string;
	h5: string;
	h6: string;
}

((vault: string, note: string, headingSettings: HeadingSettings) => {
	const vaultName = encodeURIComponent(vault);
	const notePath = encodeURIComponent(note);

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
			return `${headingSettings.h1} ${content}`;
		},
	});
	markdownService.addRule('heading_2_update', {
		filter: ['h2'],
		replacement: function (content: string) {
			return `${headingSettings.h2} ${content}`;
		},
	});
	markdownService.addRule('heading_3_update', {
		filter: ['h3'],
		replacement: function (content: string) {
			return `${headingSettings.h3} ${content}`;
		},
	});
	markdownService.addRule('heading_4_update', {
		filter: ['h4'],
		replacement: function (content: string) {
			return `${headingSettings.h4} ${content}`;
		},
	});
	markdownService.addRule('heading_5_update', {
		filter: ['h5'],
		replacement: function (content: string) {
			return `${headingSettings.h5} ${content}`;
		},
	});
	markdownService.addRule('heading_6_update', {
		filter: ['h6'],
		replacement: function (content: string) {
			return `${headingSettings.h6} ${content}`;
		},
	});

	function getSelectionHtml(): string {
		let html = '';
		if (typeof window.getSelection != 'undefined') {
			const sel = window.getSelection();
			if (sel && sel.rangeCount) {
				const container = document.createElement('div');
				for (let i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				html = container.innerHTML;
			}
		}
		return html;
	}

	function sendToObsidian(url: string, title: string): void {
		// Turn the content into Markdown
		const content = markdownService.turndown(getSelectionHtml());

		const obsidianUrl = `obsidian://obsidian-clipper?vault=${vaultName}&notePath=${notePath}&url=${encodeURIComponent(
			url
		)}&title=${encodeURIComponent(title)}&highlightdata=${encodeURIComponent(
			content
		)}`;

		console.log(obsidianUrl.length);

		document.location.href = obsidianUrl;
	}
	sendToObsidian(document.URL, document.title);
})('~VaultNameFiller~', '~NotePath~', {
	h1: '~H1Setting~',
	h2: '##',
	h3: '###',
	h4: '####',
	h5: '#####',
	h6: '######',
});
