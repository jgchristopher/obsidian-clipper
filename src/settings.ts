import { Position } from "./periodicnotes/periodicnoteentry";

export interface ObsidianClipperSettings {
	tags: string;
	timestampFormat: string;
	dailyNoteHeading: string;
	weeklyNoteHeading: string;
	openFileOnWrite: boolean;
	useDailyNote: boolean;
	dailyPosition: Position;
	useWeeklyNote: boolean;
	weeklyPosition: Position;
	dailyEntryTemplateLocation: string;
}

export const DEFAULT_SETTINGS: ObsidianClipperSettings = {
	dailyNoteHeading: "",
	weeklyNoteHeading: "",
	tags: "",
	timestampFormat: "HH:mm",
	openFileOnWrite: true,
	useDailyNote: true,
	dailyPosition: Position.APPEND,
	useWeeklyNote: false,
	weeklyPosition: Position.APPEND,
	dailyEntryTemplateLocation: "",
};
