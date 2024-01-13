import type { HeadingCache } from 'obsidian';

export function getFileName(filePath: string): string {
	const lastSlashIndex = filePath.lastIndexOf('/');
	let fileName = filePath;
	if (lastSlashIndex !== -1) {
		fileName = filePath.substring(lastSlashIndex + 1);
	}
	return fileName;
}

export function findStartAndAppendFromHeadingInCache(
	heading: string,
	cachedHeadings: HeadingCache[]
) {
	// We need to see if the configured heading exists in the document
	const foundHeadingIndex = cachedHeadings.findIndex((cachedHeading) => {
		return cachedHeading.heading === heading && cachedHeading.level === 1;
	});

	if (foundHeadingIndex !== -1) {
		const foundHeading = cachedHeadings[foundHeadingIndex];
		let nextHeading: HeadingCache | null = null;
		// Need to find the next level 1 heading, if any
		for (let i = foundHeadingIndex + 1; i < cachedHeadings?.length; i++) {
			const cachedHeading = cachedHeadings[i];
			if (cachedHeading.level === 1) {
				nextHeading = cachedHeading;
				break;
			}
		}

		const prependLine = foundHeading.position.start.line + 1; // line after the Heading
		let appendLine = -1;
		if (nextHeading) {
			// Figure out Append location based on the nextHeading
			appendLine = nextHeading.position.start.line; // The line before the next heading
		}
		return { lastLine: appendLine, firstLine: prependLine };
	} else {
		throw Error('Heading not found');
	}
}
