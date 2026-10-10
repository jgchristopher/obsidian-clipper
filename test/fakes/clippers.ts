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
		createdAt: new Date('2024-01-01T00:00:00Z'),
		vaultName: 'TestVault',
		...overrides,
	};
}
