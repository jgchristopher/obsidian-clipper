export interface ObsidianClipperSettings {
	tags: string;
	timestampFormat: string;
	dailyNoteHeading: string;
	weeklyNoteHeading: string;
	openFileOnWrite: boolean;
	useDailyNote: boolean;
	useWeeklyNote: boolean;
	dailyEntryTemplateLocation: string;
}

export const DEFAULT_SETTINGS: ObsidianClipperSettings = {
	dailyNoteHeading: "",
	weeklyNoteHeading: "",
	tags: "",
	timestampFormat: "HH:mm",
	openFileOnWrite: true,
	useDailyNote: true,
	useWeeklyNote: false,
	dailyEntryTemplateLocation: "",
};
