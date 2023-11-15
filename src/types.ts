declare module 'obsidian' {
	interface View {
		file: TFile;
	}
}
export interface Parameters {
	vault: string;
	url: string;
	title: string;
	notePath: string;
	format: string;
	clipperId: number;
	comments?: string;
	highlightdata?: string;
}
