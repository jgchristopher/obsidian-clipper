import { FileWriter } from './filewriter';

export class AppendWriter extends FileWriter {
	protected positionDataWithNoHeader(
		fileData: string,
		clippedData: string
	): string {
		return fileData + '\n' + clippedData;
	}

	protected positionDataWithHeader(
		targetSection: string[],
		clippedData: string
	): string[] {
		// Insert after the section's last non-blank line, so blank lines that
		// separate it from the next heading stay where they are.
		let insertAt = targetSection.length;
		while (insertAt > 0 && targetSection[insertAt - 1].trim() === '') {
			insertAt--;
		}
		targetSection.splice(insertAt, 0, clippedData);
		return targetSection;
	}
}
