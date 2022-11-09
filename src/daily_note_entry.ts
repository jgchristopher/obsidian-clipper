import { ObsidianClipperSettings } from "./types";
export class DailyNoteEntry {
	title?: string;
	url: string;
	data?: string | undefined;
	tags: string;
	constructor(
		title: string,
		url: string,
		settings: ObsidianClipperSettings,
		data?: string
	) {
		this.title = title;
		this.url = url;
		if (data) {
			this.data = data;
		} else {
			this.data = "";
		}

		let tag_joins: string[] = [];
		settings.tags.split(",").forEach((t) => {
			tag_joins.push(`#${t}`);
		});
		this.tags = tag_joins.join(" ");
	}

	public formattedEntry(): string {
		let formattedData = "";
		if (!this.data) {
			formattedData = `- [ ] [${this.title}](${this.url}) ${this.tags}\n\n---`;
		} else {
			formattedData =
				`- [ ] [${this.title}](${this.url}) ${this.tags}\n` +
				this.data +
				"\n\n---";
		}
		return formattedData;
	}
}
