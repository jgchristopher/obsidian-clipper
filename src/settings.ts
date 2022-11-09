export interface ObsidianClipperSettings {
	heading: string;
	tags: string;
	openFileOnWrite: boolean;
	staticBookmarkletTemplate: string;
}

export const DEFAULT_SETTINGS: ObsidianClipperSettings = {
	heading: "",
	tags: "",
	openFileOnWrite: true,
};
