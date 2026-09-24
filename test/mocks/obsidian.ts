/**
 * Runtime stand-in for the `obsidian` package, which ships type definitions
 * only. Aliased in vitest.config.ts. Implements just enough of the API for
 * the plugin's logic to run against the in-memory vault in test/fakes.
 */

export const notices: string[] = [];

export class Notice {
	message: string;
	constructor(message: string) {
		this.message = message;
		notices.push(message);
	}
}

export class TAbstractFile {
	path: string;
	name: string;
	parent: TFolder | null = null;

	constructor(path: string) {
		this.path = path;
		this.name = path.substring(path.lastIndexOf('/') + 1);
	}
}

export class TFile extends TAbstractFile {
	basename: string;
	extension: string;

	constructor(path: string) {
		super(path);
		const dot = this.name.lastIndexOf('.');
		this.basename = dot === -1 ? this.name : this.name.substring(0, dot);
		this.extension = dot === -1 ? '' : this.name.substring(dot + 1);
	}
}

export class TFolder extends TAbstractFile {
	children: TAbstractFile[] = [];
}

export function normalizePath(path: string): string {
	return path
		.replace(/\\/g, '/')
		.replace(/\/+/g, '/')
		.replace(/^\/|\/$/g, '');
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
	return Uint8Array.from(Buffer.from(base64, 'base64')).buffer;
}

export class Component {}

export class Modal {
	app: unknown;
	modalEl: HTMLElement = document.createElement('div');
	contentEl: HTMLElement = document.createElement('div');
	constructor(app: unknown) {
		this.app = app;
	}
	open() {}
	close() {}
}

export class PluginSettingTab {
	app: unknown;
	plugin: unknown;
	containerEl: HTMLElement = document.createElement('div');
	constructor(app: unknown, plugin: unknown) {
		this.app = app;
		this.plugin = plugin;
	}
	hide() {}
}

export class View {}
export class WorkspaceLeaf {}
export class ItemView extends View {
	leaf: WorkspaceLeaf;
	containerEl: HTMLElement = document.createElement('div');
	constructor(leaf: WorkspaceLeaf) {
		super();
		this.leaf = leaf;
	}
}

type Command = { id: string; name: string; checkCallback?: unknown };
type ProtocolHandler = (params: Record<string, string>) => unknown;

export class Plugin {
	app: unknown;
	manifest: unknown;
	commands: Command[] = [];
	protocolHandlers: Record<string, ProtocolHandler> = {};
	settingTabs: unknown[] = [];
	views: Record<string, unknown> = {};
	storedData: unknown = null;

	constructor(app: unknown, manifest: unknown) {
		this.app = app;
		this.manifest = manifest;
	}
	addCommand(command: Command) {
		this.commands.push(command);
		return command;
	}
	addSettingTab(tab: unknown) {
		this.settingTabs.push(tab);
	}
	registerObsidianProtocolHandler(action: string, handler: ProtocolHandler) {
		this.protocolHandlers[action] = handler;
	}
	registerView(type: string, factory: unknown) {
		this.views[type] = factory;
	}
	async loadData() {
		return this.storedData;
	}
	async saveData(data: unknown) {
		this.storedData = data;
	}
}

export const Platform = {
	isDesktop: true,
	isDesktopApp: true,
	isMobile: false,
	isMobileApp: false,
	isIosApp: false,
	isAndroidApp: false,
	isMacOS: true,
};

export async function requestUrl(): Promise<never> {
	throw new Error('requestUrl is not available in tests');
}
