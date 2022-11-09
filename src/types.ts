declare module "obsidian" {
	interface View {
		file: TFile;
	}
}
export interface Parameters {
	vault: string;
	url: string;
	title: string;
	highlightdata?: string;
}

export interface ObsidianClipperSettings {
	heading: string;
	tags: string;
	openFileOnWrite: boolean;
}
