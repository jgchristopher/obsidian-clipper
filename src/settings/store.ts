import { writable, type Writable } from "svelte/store";
import type { ObsidianClipperSettings } from "../settings";

export class ObsidianClipperSettingsStore {
  private settings: ObsidianClipperSettings;
  public settingsStore: Writable<object>;
  private static instance: ObsidianClipperSettingsStore;

  private constructor(settings: ObsidianClipperSettings) {
    this.settings = settings;
    this.settingsStore = writable(this.settings);
  }

  public static getInstance(settings: ObsidianClipperSettings) {
    if (!ObsidianClipperSettingsStore.instance) {
      ObsidianClipperSettingsStore.instance =
        new ObsidianClipperSettingsStore(settings);
    } else {
      return ObsidianClipperSettingsStore.instance;
    }
  }
}
