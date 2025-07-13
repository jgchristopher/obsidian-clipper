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
	headingLevel: number,
	cachedHeadings: HeadingCache[]
) {
	// We need to see if the configured heading exists in the document
	const foundHeadingIndex = cachedHeadings.findIndex(
		(cachedHeading: HeadingCache): boolean => {
			return (
				cachedHeading.heading === heading &&
				cachedHeading.level === headingLevel
			);
		}
	);

	if (foundHeadingIndex !== -1) {
		const foundHeading = cachedHeadings[foundHeadingIndex];
		let nextHeading: HeadingCache | null = null;
		// Need to find the next level 1 heading, if any
		for (let i = foundHeadingIndex + 1; i < cachedHeadings?.length; i++) {
			const cachedHeading = cachedHeadings[i];
			if (cachedHeading.level === foundHeading.level) {
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

// Return the heading level or -1 if heading is not found
// export function findHeadingLevel(file: TFile, heading: string): number {
// 	let foundHeadingLevel = -1;
// 	const cache = this.app.metadataCache.getFileCache(file);
// 	Utility.assertNotNull(cache);
// 	heading = Utility.cleanHeading(heading);
// 	try {
// 		const cachedHeadings = cache.headings;
// 		Utility.assertNotNull(cachedHeadings);
//
// 		// We need to see if the configured heading exists in the document
// 		const foundHeadingIndex = cachedHeadings.findIndex(
// 			(cachedHeading: HeadingCache): boolean => {
// 				return cachedHeading.heading === heading; // && cachedHeading.level === 1;
// 			}
// 		);
//
// 		if (foundHeadingIndex !== -1) {
// 			const foundHeading = cachedHeadings[foundHeadingIndex];
// 			foundHeadingLevel = foundHeading.level;
// 		}
// 	} catch (e) {
// 		foundHeadingLevel = -1;
// 	}
// 	return foundHeadingLevel;
// }
