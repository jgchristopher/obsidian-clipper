import { App, Notice, normalizePath } from "obsidian";

export async function getTemplateContents(
	app: App,
	templatePath: string | undefined
): Promise<string> {
	const { metadataCache, vault } = app;
	const normalizedTemplatePath = normalizePath(templatePath ?? "");
	if (templatePath === "/") {
		return Promise.resolve("");
	}

	let templateContents = "";
	try {
		const templateFile = metadataCache.getFirstLinkpathDest(
			normalizedTemplatePath,
			""
		);
		if (templateFile) {
			templateContents = await vault.cachedRead(templateFile);
		}
	} catch (err) {
		console.error(
			`Failed to read the clipper entry template '${normalizedTemplatePath}'`,
			err
		);
		new Notice(
			"Failed to read the Obsidian Clipper daily note entry template configured in Settings"
		);
	} finally {
		return templateContents;
	}
}

export function applyTemplateTransformations(
	title: string,
	url: string,
	tags: string,
	content: string = "",
	rawTemplateContents: string
): string {
	let templateContents = rawTemplateContents
		.replace(/{{\s*title\s*}}/gi, title)
		.replace(/{{\s*url\s*}}/gi, url)
		.replace(/{{\s*tags\s*}}/gi, tags)
		.replace(/{{\s*content\s*}}/gi, content);

	return templateContents;
}
