chrome.runtime.onInstalled.addListener(() => {
  console.log("MosaicElem installed");
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "toggle-pick") return;
  void (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id == null) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "PICK_TOGGLE" });
    } catch {
      /* 无 content 或未注入 */
    }
  })();
});

async function relayMosaicMode(mode) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id == null || tab.discarded) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "SYNC_MOSAIC_MODE", mode });
    } catch {
      /* 无 content 或未注入 */
    }
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.mosaicMode) return;
  const mode = changes.mosaicMode.newValue ?? "blur";
  void relayMosaicMode(mode);
});
