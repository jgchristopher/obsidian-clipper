<script lang="ts">
  import { settings } from "./settingsstore";
</script>

<div class="clp_section_margin">
  <h1>Common Settings</h1>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Tags</div>
      <div class="setting-item-description">
        What tags would you like added to the captured highlights?
      </div>
    </div>
    <div class="setting-item-control">
      <input
        type="text"
        bind:value={$settings.tags}
        spellcheck="false"
        placeholder="tags,seperated,by,commas"
      />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Date Time Format</div>
      <div class="setting-item-description">
      <div>
          Format you would like to use for the &#123&#123 time
          &#125&#125 template in clippings. See
        </div>
        <a href="https://momentjs.com/docs/#/displaying/format/"
          >format reference</a
        >
      </div>
    </div>
    <div class="setting-item-control">
      <input
        type="text"
        bind:value={$settings.timestampFormat}
        spellcheck="false"
        placeholder="HH:mm"
      />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Clipped Entry Template</div>
      <div class="setting-item-description">
        Choose the file to use as a template for the clipped entry
      </div>
    </div>
    <div class="setting-item-control">
      <input
        type="text"
        bind:value={$settings.dailyEntryTemplateLocation}
        spellcheck="false"
      />
    </div>
  </div>
</div>
