export class Utility {
	public static assertNotNull<T>(
		value: T | null | undefined
	): asserts value is T {
		if (!value) {
			throw new Error('Value is null');
		}
	}
}
