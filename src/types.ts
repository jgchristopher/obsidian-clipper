declare module 'obsidian' {
	interface View {
		file: TFile;
	}
}
export interface Parameters {
	vault: string;
	url: string;
	baseURI: string;
	title: string;
	notePath: string;
	format: string;
	description: string;
	comments?: string;
	highlightdata?: string;
}
