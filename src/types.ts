declare module 'obsidian' {
	interface View {
		file: TFile;
	}
}
export interface Parameters {
	vault: string;
	url: string;
	title: string;
	format: string;
	notePath: string;
	comment: string;
	highlightdata?: string;
}
