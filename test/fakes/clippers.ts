import {
	DEFAULT_CLIPPER_SETTING,
	type ObsidianClipperSettings,
} from 'src/settings/types';

export function clipper(
	overrides: Partial<ObsidianClipperSettings> = {}
): ObsidianClipperSettings {
	return {
		...structuredClone(DEFAULT_CLIPPER_SETTING),
		clipperId: 'clipper-1',
		vaultName: 'TestVault',
		...overrides,
	};
}
