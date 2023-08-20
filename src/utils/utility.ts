import { fromUrl, parseDomain } from 'parse-domain';

export class Utility {
	public static assertNotNull<T>(
		value: T | null | undefined
	): asserts value is T {
		if (!value) {
			throw new Error('Value is null');
		}
	}

	public static parseDomainFromUrl(Url: string) {
		return parseDomain(fromUrl(Url)).hostname.toString();
	}
}
