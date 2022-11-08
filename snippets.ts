else if (parameters.daily === "true") {
  if (!appHasDailyNotesPluginLoaded()) {
    new Notice("Daily notes plugin is not loaded");
    return;
  }
  const moment = window.moment(Date.now());
  const allDailyNotes = getAllDailyNotes();
  let dailyNote = getDailyNote(moment, allDailyNotes);
  if (!dailyNote) {
    /// Prevent daily note from being created on existing check
    if (parameters.exists === "true") {
      parameters.filepath = await getDailyNotePath(moment);
    } else {
      dailyNote = await createDailyNote(moment);

      // delay to let Obsidian index and generate CachedMetadata
      await new Promise(r => setTimeout(r, 500));

      createdDailyNote = true;
    }
  }
  if (dailyNote !== undefined) {
    parameters.filepath = dailyNote.path;
  }
}


async handleOpen(parameters: Parameters) {
  let fileIsAlreadyOpened = false;
  this.app.workspace.iterateAllLeaves(leaf => {
    if (leaf.view.file?.path === parameters.filepath && leaf.width > 0) {
      fileIsAlreadyOpened = true;
      this.app.workspace.setActiveLeaf(leaf, true, true);
    }
  });
  if (fileIsAlreadyOpened) {
    const leaf = this.app.workspace.activeLeaf;
    if (parameters.viewmode != undefined) {
      let viewState = leaf.getViewState();
      viewState.state.mode = parameters.viewmode;
      if (viewState.state.source != undefined)
        viewState.state.source = parameters.viewmode == "source";
      await leaf.setViewState(viewState);
    }
  }

  const openInNewPane = parameters.newpane !== undefined ? parameters.newpane == "true" : this.settings.openFileWithoutWriteInNewPane;
  if (parameters.heading != undefined) {
    await this.app.workspace.openLinkText(parameters.filepath + "#" + parameters.heading, "", openInNewPane, this.getViewStateFromMode(parameters));
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    const cache = this.app.metadataCache.getFileCache(view.file);
    const heading = cache.headings.find((e) => e.heading === parameters.heading);
    view.editor.focus();
    view.editor.setCursor({ line: heading.position.start.line + 1, ch: 0 });
  }
  else if (parameters.block != undefined) {
    await this.app.workspace.openLinkText(parameters.filepath + "#^" + parameters.block, "", openInNewPane, this.getViewStateFromMode(parameters));
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    const cache = this.app.metadataCache.getFileCache(view.file);
    const block = cache.blocks[parameters.block];
    view.editor.focus();
    view.editor.setCursor({ line: block.position.start.line, ch: 0 });
  }
  else {
    if (!fileIsAlreadyOpened)
      await this.app.workspace.openLinkText(parameters.filepath, "", openInNewPane, this.getViewStateFromMode(parameters));
    if (parameters.line != undefined) {
      this.setCursorInLine(parameters.line);
    }
  }
  if (parameters.mode != undefined) {
    await this.setCursor(parameters.mode);
  }
  if (parameters.uid) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);

    this.writeUIDToFile(view.file, parameters.uid);
  }
  this.success(parameters);
}

async writeAndOpenFile(outputFileName: string, text: string, parameters: Parameters): Promise < TFile > {
  const file = this.app.vault.getAbstractFileByPath(outputFileName);

  if(file instanceof TFile) {
  await this.app.vault.modify(file, text);
} else {
  const parts = outputFileName.split("/");
  const dir = parts.slice(0, parts.length - 1).join("/");
  if (parts.length > 1 && !(this.app.vault.getAbstractFileByPath(dir) instanceof TFolder)) {
    await this.app.vault.createFolder(dir);
  }
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  if (base64regex.test(text)) {
    await this.app.vault.createBinary(outputFileName, base64ToArrayBuffer(text));
  } else {
    await this.app.vault.create(outputFileName, text);
  }
}

if (this.settings.openFileOnWrite) {
  let fileIsAlreadyOpened = false;
  this.app.workspace.iterateAllLeaves(leaf => {
    if (leaf.view.file?.path === outputFileName) {
      fileIsAlreadyOpened = true;
      this.app.workspace.setActiveLeaf(leaf, true, true);
    }
  });

  if (!fileIsAlreadyOpened)
    await this.app.workspace.openLinkText(outputFileName, "", parameters.newpane !== undefined ? parameters.newpane == "true" : this.settings.openFileOnWriteInNewPane, this.getViewStateFromMode(parameters));
  if (parameters.line != undefined) {
    this.setCursorInLine(parameters.line);
  }
}

return this.app.vault.getAbstractFileByPath(outputFileName) as TFile;
    }
