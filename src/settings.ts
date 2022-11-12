export interface ObsidianClipperSettings {
	heading: string;
	tags: string;
	openFileOnWrite: boolean;
	useDailyNote: boolean;
	dailyEntryTemplateLocation: string;
}

export const DEFAULT_SETTINGS: ObsidianClipperSettings = {
	heading: "",
	tags: "",
	openFileOnWrite: true,
	useDailyNote: true,
	dailyEntryTemplateLocation: "",
};
