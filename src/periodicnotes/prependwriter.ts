import { App } from "obsidian";
import { FileWriter } from "./filewriter";

export class PrependWriter extends FileWriter {
	constructor(app: App, openFileOnWrite: boolean) {
		super(app, openFileOnWrite);
	}

	positionDataWithNoHeader(fileData: string, clippedData: string): string {
		return clippedData + "\n" + fileData;
	}

	positionDataWithHeader(
		targetSection: string[],
		clippedData: string
	): string[] {
		targetSection.splice(1, 0, clippedData);
		return targetSection;
	}
}
