<script lang="ts">
  import { slide } from "svelte/transition";
  import type { ObsidianClipperSettingsStore } from './store'
  import SettingsGroup from "./SettingsGroup.svelte"
  
  export let settings: ObsidianClipperSettingsStore;

  
</script>

<SettingsGroup 
  groupTrigger={settings.useDailyNote}
  sectionTitle={"Daily Note Entry"}
  sectionNoteHeading={settings.dailyNoteHeading}
  sectionPosition={settings.dailyPosition}
/>

