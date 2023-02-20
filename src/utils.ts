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
    return templateContents;
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
  content = '',
  rawTemplateContents: string
): string {
  const templateContents = rawTemplateContents
    .replace(/{{\s*title\s*}}/gi, title)
    .replace(/{{\s*url\s*}}/gi, url)
    .replace(/{{\s*tags\s*}}/gi, tags)
    .replace(/{{\s*content\s*}}/gi, content)
    .replace(/{{\s*time\s*}}/gi, time);

  return templateContents;
}
