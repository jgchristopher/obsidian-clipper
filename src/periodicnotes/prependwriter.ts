import { FileWriter } from "./filewriter";

export class PrependWriter extends FileWriter {
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
