export function getFileName(filePath: string): string {
	const lastSlashIndex = filePath.lastIndexOf('/');
	let fileName = filePath;
	if (lastSlashIndex !== -1) {
		fileName = filePath.substring(lastSlashIndex + 1);
	}
	return fileName;
}
