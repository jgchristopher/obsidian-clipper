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
    targetSection.push(clippedData);
    return targetSection;
  }
}
