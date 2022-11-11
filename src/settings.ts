export interface ObsidianClipperSettings {
	heading: string;
	tags: string;
	openFileOnWrite: boolean;
	useDailyNote: boolean;
}

export const DEFAULT_SETTINGS: ObsidianClipperSettings = {
	heading: "",
	tags: "",
	openFileOnWrite: true,
	useDailyNote: true,
};
