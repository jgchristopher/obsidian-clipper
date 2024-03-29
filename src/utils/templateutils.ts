import { App, Notice, normalizePath } from 'obsidian';

export async function getTemplateContents(
	app: App,
	templatePath: string | undefined
): Promise<string> {
	const { metadataCache, vault } = app;
	const normalizedTemplatePath = normalizePath(templatePath ?? '');
	if (templatePath === '/') {
		return Promise.resolve('');
	}

	let templateContents = '';
	try {
		const templateFile = metadataCache.getFirstLinkpathDest(
			normalizedTemplatePath,
			''
		);
		if (templateFile) {
			templateContents = await vault.cachedRead(templateFile);
		}
		return `${templateContents}\n`;
	} catch (err) {
		console.error(
			`Failed to read the clipper entry template '${normalizedTemplatePath}'`,
			err
		);
		new Notice(
			'Failed to read the Obsidian Clipper daily note entry template configured in Settings'
		);
		throw Error('Template File Missing');
	}
}

export function applyTemplateTransformations(
	title: string,
	url: string,
	tags: string,
	time: string,
	date: string,
	content = '',
	comment = '',
	rawTemplateContents: string
): string {
	const templateContents = rawTemplateContents
		.replace(/{{\s*title\s*}}/gi, title)
		.replace(/{{\s*url\s*}}/gi, url)
		.replace(/{{\s*tags\s*}}/gi, tags)
		.replace(/{{\s*content\s*}}/gi, content)
		.replace(/{{\s*comment\s*}}/gi, comment)
		.replace(/{{\s*time\s*}}/gi, time)
		.replace(/{{\s*date\s*}}/gi, date);

	return templateContents;
}
