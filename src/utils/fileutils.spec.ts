import { describe, expect, it } from 'vitest';
import { getFileName } from './fileutils';

describe('File Utils', () => {
	it('Properly gets the filename from a path', async () => {
		let filePath = 'this/is/a/path.md';
		let result = getFileName(filePath);
		expect(result).toBe('path.md');

		filePath = 'mynote.md';
		result = getFileName(filePath);
		expect(result).toBe('mynote.md');
	});
});
