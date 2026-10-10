import { App, Notice, normalizePath } from 'obsidian';

export const missingTemplateNotice = (templatePath: string) =>
	`Obsidian Clipper couldn't find the entry template "${templatePath}". Using the default entry format.`;

// Resolves null when no file matches the template path, after showing a
// notice, so the caller can fall back to the default entry format.
export async function getTemplateContents(
	app: App,
	templatePath: string | undefined
): Promise<string | null> {
	const { metadataCache, vault } = app;
	const normalizedTemplatePath = normalizePath(templatePath ?? '');
	if (templatePath === '/') {
		return Promise.resolve('');
	}

	try {
		const templateFile = metadataCache.getFirstLinkpathDest(
			normalizedTemplatePath,
			''
		);
		if (!templateFile) {
			new Notice(missingTemplateNotice(normalizedTemplatePath));
			return null;
		}
		return await vault.cachedRead(templateFile);
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
	// Function replacers insert values literally. A string replacement would
	// read $$, $&, $1, $` and $' in clipped text as patterns.
	const templateContents = rawTemplateContents
		.replace(/{{\s*title\s*}}/gi, () => title)
		.replace(/{{\s*url\s*}}/gi, () => url)
		.replace(/{{\s*tags\s*}}/gi, () => tags)
		.replace(/{{\s*content\s*}}/gi, () => content)
		.replace(/{{\s*comment\s*}}/gi, () => comment)
		.replace(/{{\s*time\s*}}/gi, () => time)
		.replace(/{{\s*date\s*}}/gi, () => date);

	return templateContents;
}
