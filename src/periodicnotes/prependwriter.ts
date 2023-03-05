import { FileWriter } from './filewriter';

export class PrependWriter extends FileWriter {
	positionDataWithNoHeader(
		fileData: string,
		clippedData: string,
		startLine = 0
	): string {
		// make sure we write below frontmatter
		const fileLines = fileData.split('\n');

		const preSectionContent = fileLines.slice(0, startLine);
		const restOfContent = fileLines.slice(startLine);
		return [...preSectionContent, clippedData, ...restOfContent].join('\n');
	}

	positionDataWithHeader(
		targetSection: string[],
		clippedData: string
	): string[] {
		targetSection.splice(1, 0, clippedData);
		return targetSection;
	}
}
