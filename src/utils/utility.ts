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

	//  Check to see if the user passed in a literal markdown heading and not just the text
	public static cleanHeading(heading: string) {
		let cleanHeading = heading;
		if (heading.startsWith('#') && heading[1] == ' ') {
			cleanHeading = heading.substring(2);
		}
		return cleanHeading;
	}
}
