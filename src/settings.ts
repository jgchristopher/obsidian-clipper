import { SectionPosition } from './periodicnotes/sectionposition';

export interface ObsidianClipperSettings {
	tags: string;
	timestampFormat: string;
	dailyNoteHeading: string;
	weeklyNoteHeading: string;
	openFileOnWrite: boolean;
	useDailyNote: boolean;
	dailyPosition: SectionPosition;
	useWeeklyNote: boolean;
	weeklyPosition: SectionPosition;
	weeklyEntryTemplateLocation: string;
	dailyEntryTemplateLocation: string;
	markdownSettings: ObsidianClipperMarkdownSettings;
}

export interface ObsidianClipperMarkdownSettings {
	h1: string;
	h2: string;
	h3: string;
	h4: string;
	h5: string;
	h6: string;
}

export const DEFAULT_SETTINGS: ObsidianClipperSettings = {
	dailyNoteHeading: '',
	weeklyNoteHeading: '',
	tags: '',
	timestampFormat: 'HH:mm',
	openFileOnWrite: true,
	useDailyNote: true,
	dailyPosition: SectionPosition.APPEND,
	useWeeklyNote: false,
	weeklyPosition: SectionPosition.APPEND,
	dailyEntryTemplateLocation: '',
	weeklyEntryTemplateLocation: '',
	markdownSettings: {
		h1: '#',
		h2: '##',
		h3: '###',
		h4: '####',
		h5: '#####',
		h6: '######',
	},
};
