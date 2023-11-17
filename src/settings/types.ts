import { randomUUID } from 'crypto';

export const SectionPosition = {
	PREPEND: 'prepend',
	APPEND: 'append',
} as const;

export interface ObsidianClipperPluginSettings {
	clippers: ObsidianClipperSettings[];
	version: number;
}

export type SectionPosition =
	(typeof SectionPosition)[keyof typeof SectionPosition];

export interface ObsidianClipperSettings {
	name: string;
	clipperId: string;
	createdAt: Date;
	notePath: string;
	tags: string;
	timestampFormat: string;
	dateFormat: string;
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
	advancedStorageFolder: string;
	captureComments: boolean;
	experimentalCanvas: boolean;
	experimentalBookmarkletComment: boolean;
}

export interface ObsidianClipperMarkdownSettings {
	h1: string;
	h2: string;
	h3: string;
	h4: string;
	h5: string;
	h6: string;
}

export const DEFAULT_DAILY_NOTE_SETTING: ObsidianClipperSettings = {
	name: 'Default',
	clipperId: randomUUID(),
	createdAt: new Date(Date.now()),
	notePath: '',
	dailyNoteHeading: '',
	weeklyNoteHeading: '',
	tags: '',
	timestampFormat: 'HH:mm',
	dateFormat: 'MM/DD/YY',
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
		h1: '##',
		h2: '##',
		h3: '###',
		h4: '####',
		h5: '#####',
		h6: '######',
	},
	advanced: false,
	advancedStorageFolder: 'clippings',
	captureComments: false,
	experimentalCanvas: false,
	experimentalBookmarkletComment: false,
};

export const DEFAULT_SETTINGS: ObsidianClipperPluginSettings = {
	clippers: [DEFAULT_DAILY_NOTE_SETTING],
	version: 2.0,
};
