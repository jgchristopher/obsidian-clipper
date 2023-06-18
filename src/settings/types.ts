export const SectionPosition = {
	PREPEND: 'prepend',
	APPEND: 'append',
} as const;

export type SectionPosition =
	(typeof SectionPosition)[keyof typeof SectionPosition];

export interface ObsidianClipperSettings {
	tags: string;
	timestampFormat: string;
	dailyNoteHeading: string;
	weeklyNoteHeading: string;
	dailyOpenOnWrite: boolean;
	useDailyNote: boolean;
	dailyPosition: SectionPosition;
	useWeeklyNote: boolean;
	weeklyPosition: SectionPosition;
	weeklyEntryTemplateLocation: string;
	weeklyOpenOnWrite: boolean;
	dailyEntryTemplateLocation: string;
	markdownSettings: ObsidianClipperMarkdownSettings;
	topicPosition: SectionPosition;
	topicEntryTemplateLocation: string;
	topicOpenOnWrite: boolean;
	advanced: boolean;
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
	dailyOpenOnWrite: false,
	useDailyNote: true,
	dailyPosition: SectionPosition.APPEND,
	useWeeklyNote: false,
	weeklyPosition: SectionPosition.APPEND,
	weeklyOpenOnWrite: false,
	dailyEntryTemplateLocation: '',
	weeklyEntryTemplateLocation: '',
	topicEntryTemplateLocation: '',
	topicPosition: SectionPosition.APPEND,
	topicOpenOnWrite: false,
	markdownSettings: {
		h1: '#',
		h2: '##',
		h3: '###',
		h4: '####',
		h5: '#####',
		h6: '######',
	},
	advanced: false,
};
