import { App } from "obsidian";
import { ObsidianClipperSettings } from "./settings";
import { getTemplateContents, applyTemplateTransformations } from "./utils";

export class DailyNoteEntry {
	title: string;
	url: string;
	data?: string | undefined;
	tags: string;
	settings: ObsidianClipperSettings;
	app: App;
	constructor(
		title: string,
		url: string,
		settings: ObsidianClipperSettings,
		app: App,
		data: string = ""
	) {
		this.title = title;
		this.url = url;
		if (data !== "") {
			this.data = data;
		}
		let tag_joins: string[] = [];
		settings.tags.split(",").forEach((t) => {
			tag_joins.push(`#${t}`);
		});
		this.tags = tag_joins.join(" ");
		this.settings = settings;
		this.app = app;
	}

	public async formattedEntry(): Promise<string> {
		let formattedData = "";

		if (this.settings.dailyEntryTemplateLocation) {
			let rawTemplateContents = await getTemplateContents(
				this.app,
				this.settings.dailyEntryTemplateLocation
			);
			formattedData = applyTemplateTransformations(
				this.title,
				this.url,
				this.tags,
				this.data,
				rawTemplateContents
			);
		} else {
			if (!this.data) {
				formattedData = `- [ ] [${this.title}](${this.url}) ${this.tags}\n\n---`;
			} else {
				formattedData =
					`- [ ] [${this.title}](${this.url}) ${this.tags}\n` +
					this.data +
					"\n\n---";
			}
		}
		return formattedData;
	}
}
