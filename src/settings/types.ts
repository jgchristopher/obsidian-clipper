import { deepmerge } from 'deepmerge-ts';

export const SectionPosition = {
	PREPEND: 'prepend',
	APPEND: 'append',
} as const;

export type SectionPosition =
	(typeof SectionPosition)[keyof typeof SectionPosition];

export const ClipperType = {
	DAILY: 'daily',
	WEEKLY: 'weekly',
	TOPIC: 'topic',
	CANVAS: 'canvas',
} as const;

export type ClipperType = (typeof ClipperType)[keyof typeof ClipperType];

export interface ObsidianClipperPluginSettings {
	clippers: ObsidianClipperSettings[];
	version: number;
	experimentalBookmarkletComment: boolean;
}

export interface OldClipperSettings {
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

export interface BaseClipperSettings {
	type: ClipperType;
	name: string;
	clipperId: string;
	createdAt: Date;
	vaultName: string;
	notePath: string; // This will be empty if for a daily or weekly note
	tags: string;
	timestampFormat: string;
	dateFormat: string;
	heading: string;
	openOnWrite: boolean;
	position: SectionPosition;
	entryTemplateLocation: string;
	markdownSettings: ObsidianClipperMarkdownSettings;
	advancedStorage: boolean;
	advancedStorageFolder: string;
	captureComments: boolean;
}

export type ObsidianClipperSettings = BaseClipperSettings;

export interface ObsidianClipperMarkdownSettings {
	h1: string;
	h2: string;
	h3: string;
	h4: string;
	h5: string;
	h6: string;
}

export const DEFAULT_CLIPPER_SETTING: ObsidianClipperSettings = {
	type: ClipperType.DAILY,
	name: 'Default Clipper',
	clipperId: crypto.randomUUID(),
	createdAt: new Date(Date.now()),
	vaultName: '',
	notePath: '',
	heading: '',
	tags: '',
	timestampFormat: 'HH:mm',
	dateFormat: 'MM/DD/YY',
	openOnWrite: false,
	position: SectionPosition.APPEND,
	entryTemplateLocation: '',
	markdownSettings: {
		h1: '##',
		h2: '##',
		h3: '###',
		h4: '####',
		h5: '#####',
		h6: '######',
	},
	advancedStorage: false,
	advancedStorageFolder: 'clippings',
	captureComments: false,
};

const default_daily = deepmerge({}, DEFAULT_CLIPPER_SETTING);
default_daily.type = ClipperType.DAILY;

export const DEFAULT_SETTINGS: ObsidianClipperPluginSettings = {
	clippers: [default_daily],
	version: 2.0,
	experimentalBookmarkletComment: false,
};

export const DEFAULT_SETTINGS_EMPTY: ObsidianClipperPluginSettings = {
	clippers: [],
	version: 2.0,
	experimentalBookmarkletComment: false,
};
