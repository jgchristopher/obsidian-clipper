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
	const values: Record<string, string> = {
		title,
		url,
		tags,
		content,
		comment,
		time,
		date,
	};
	// One pass, so a variable inside clipped text is never expanded, and a
	// function replacer, so $$, $&, $1, $` and $' are inserted literally.
	return rawTemplateContents.replace(
		/{{\s*(title|url|tags|content|comment|time|date)\s*}}/gi,
		(_match, name: string) => values[name.toLowerCase()]
	);
}
