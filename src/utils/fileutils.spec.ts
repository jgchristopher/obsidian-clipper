import { describe, expect, it } from 'vitest';
import { getFileName } from './fileutils';

describe('File Utils', () => {
	it('Properly gets the filename from a path', async () => {
		const filePath = 'this/is/a/path.md';
		const result = getFileName(filePath);
		expect(result).toBe('path.md');
	});
});
