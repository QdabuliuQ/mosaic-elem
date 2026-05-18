const toggleBtn = document.getElementById("toggle");
const clearBtn = document.getElementById("clear");
const statusEl = document.getElementById("status");
const shortcutEl = document.getElementById("pickShortcut");

const STATUS_KEY = {
  CLEAR_MOSAIC: "statusCleared",
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function humanizeKeyToken(token) {
  const raw = String(token || "").trim();
  if (!raw) return "";
  const low = raw.toLowerCase();
  const wordToKey = {
    command: "keyCommand",
    meta: "keyCommand",
    shift: "keyShift",
    ctrl: "keyCtrl",
    control: "keyCtrl",
    macctrl: "keyCtrl",
    strg: "keyCtrl",
    alt: "keyAlt",
    option: "keyOption",
    comma: "keyComma",
  };
  const wk = wordToKey[low];
  if (wk) {
    const m = chrome.i18n.getMessage(wk);
    return m || raw;
  }
  const symToKey = { "⌘": "keyCommand", "⇧": "keyShift", "⌥": "keyOption", "⌃": "keyCtrl" };
  const sk = symToKey[raw];
  if (sk) {
    const m = chrome.i18n.getMessage(sk);
    return m || raw;
  }
  if (/^digit\d$/i.test(raw)) {
    const d = raw.replace(/^digit/i, "");
    return /[0-9]/.test(d) ? d : raw;
  }
  return raw;
}

function orderModifierTokens(parts, isMac) {
  const rank = (raw) => {
    const t = String(raw).trim();
    const low = t.toLowerCase();
    const sh = t === "⇧" || low === "shift";
    const cmd = t === "⌘" || low === "command" || low === "meta";
    const ctl = t === "⌃" || ["ctrl", "control", "strg", "macctrl"].includes(low);
    const opt = t === "⌥" || ["alt", "option"].includes(low);
    if (isMac) {
      if (sh) return 10;
      if (cmd) return 20;
      if (opt) return 30;
      if (ctl) return 40;
      return 100;
    }
    if (ctl) return 10;
    if (sh) return 20;
    if (opt) return 30;
    if (cmd) return 40;
    return 100;
  };
  return [...parts].sort((a, b) => rank(a) - rank(b));
}

function splitShortcutKeys(shortcut) {
  const s = String(shortcut || "").trim();
  if (!s) return [];
  if (/\s*\+\s*/.test(s)) {
    return s.split(/\s*\+\s*/).map((p) => p.trim()).filter(Boolean);
  }
  const modCh = "⌘⇧⌥⌃";
  if ([...s].some((c) => modCh.includes(c))) {
    const out = [];
    let tail = "";
    for (const ch of s) {
      if (modCh.includes(ch)) {
        if (tail) {
          out.push(tail);
          tail = "";
        }
        out.push(ch);
      } else {
        tail += ch;
      }
    }
    if (tail) out.push(tail);
    return out;
  }
  return [s];
}

function shortcutChipsHtml(shortcut, isMac) {
  const ordered = orderModifierTokens(splitShortcutKeys(shortcut), isMac);
  const parts = ordered.map(humanizeKeyToken).filter(Boolean);
  if (!parts.length) return "";
  return parts
    .map((p) => `<kbd>${escapeHtml(p.trim())}</kbd>`)
    .join('<span class="kbd-join"> + </span>');
}

async function getPickShortcutAndPlatform() {
  const [cmds, info] = await Promise.all([chrome.commands.getAll(), chrome.runtime.getPlatformInfo()]);
  const c = cmds.find((x) => x.name === "toggle-pick");
  const os = String(info?.os || "").toLowerCase();
  const isMac = os === "mac" || os === "darwin";
  const shortcut = c?.shortcut || (isMac ? "Shift+Command+1" : "Ctrl+Shift+1");
  return { shortcut, isMac };
}

function renderShortcutLine() {
  void (async () => {
    const { shortcut, isMac } = await getPickShortcutAndPlatform();
    const label = chrome.i18n.getMessage("pickShortcutLabel");
    shortcutEl.innerHTML =
      `<span class="shortcut-label">${escapeHtml(label)}</span> ` + shortcutChipsHtml(shortcut, isMac);
  })();
}

function applyI18n() {
  const lang = chrome.i18n.getUILanguage();
  document.documentElement.lang = lang.replace(/_/g, "-");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.dataset.i18n;
    const msg = chrome.i18n.getMessage(k);
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const k = el.dataset.i18nTitle;
    const msg = chrome.i18n.getMessage(k);
    if (msg) el.title = msg;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const k = el.dataset.i18nAria;
    const msg = chrome.i18n.getMessage(k);
    if (msg) el.setAttribute("aria-label", msg);
  });
}

function setToggleVisual(on) {
  toggleBtn.textContent = chrome.i18n.getMessage(on ? "btnPickStop" : "btnPickStart");
  toggleBtn.setAttribute("aria-pressed", on ? "true" : "false");
  toggleBtn.classList.toggle("is-active", on);
  toggleBtn.title = chrome.i18n.getMessage(on ? "btnPickStopTitle" : "btnPickStartTitle");
}

applyI18n();
renderShortcutLine();
setToggleVisual(false);

async function tab() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t;
}

async function syncPickUiFromTab() {
  const t = await tab();
  if (!t?.id) {
    setToggleVisual(false);
    return;
  }
  try {
    const res = await chrome.tabs.sendMessage(t.id, { type: "PICK_STATUS" });
    setToggleVisual(Boolean(res?.on));
  } catch {
    setToggleVisual(false);
  }
}

async function send(type) {
  const t = await tab();
  console.log("[MosaicElem popup] send", type, "tab", t?.id, t?.url);
  if (!t?.id) {
    statusEl.textContent = chrome.i18n.getMessage("statusNoTab");
    return;
  }
  try {
    const res = await chrome.tabs.sendMessage(t.id, { type });
    console.log("[MosaicElem popup] sendMessage ok", res);
    if (type === "PICK_TOGGLE" && res && "on" in res) {
      setToggleVisual(Boolean(res.on));
      statusEl.textContent = chrome.i18n.getMessage(res.on ? "statusPickOn" : "statusPickOff");
      return;
    }
    const key = STATUS_KEY[type];
    statusEl.textContent = key ? chrome.i18n.getMessage(key) : chrome.i18n.getMessage("statusDone");
  } catch (e) {
    console.error("[MosaicElem popup] sendMessage 失败", e);
    statusEl.textContent = chrome.i18n.getMessage("statusInjectFail");
  }
}

toggleBtn.addEventListener("click", () => send("PICK_TOGGLE"));
clearBtn.addEventListener("click", () => send("CLEAR_MOSAIC"));

document.querySelectorAll('input[name="mosaicMode"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) void chrome.storage.local.set({ mosaicMode: input.value });
  });
});

void (async () => {
  const { mosaicMode = "blur" } = await chrome.storage.local.get("mosaicMode");
  const el = document.querySelector(`input[name="mosaicMode"][value="${mosaicMode}"]`);
  if (el) el.checked = true;
  await syncPickUiFromTab();
})();
