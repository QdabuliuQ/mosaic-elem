const MOSAIC = "elementmark-mosaic";
const OVERLAY = "em-mosaic-layer";
const WRAP = "em-mosaic-wrap";
const GUIDE_ID = "elementmark-guides";
const HOVER_MASK_ID = "elementmark-hover-mask";

/** 不能 append 子节点时用 ::after；与 Tailwind `after:` 等冲突时用子遮罩 */
const VOID_HTML = new Set([
  "AREA",
  "BASE",
  "BR",
  "COL",
  "EMBED",
  "HR",
  "IMG",
  "INPUT",
  "LINK",
  "META",
  "PARAM",
  "SOURCE",
  "TRACK",
  "WBR",
]);

/** 子遮罩不能插在内部（仅允许包一层 WRAP 再打码） */
const NO_INNER_OVERLAY = new Set(["TEXTAREA", "SELECT"]);

const INPUT_WRAP_SKIP = new Set([
  "hidden",
  "checkbox",
  "radio",
  "file",
  "button",
  "image",
  "reset",
  "submit",
  "color",
  "range",
]);

console.log("[MosaicElem] content.js 已加载", location.href);

function injectStyle() {
  const css = `
.${MOSAIC}{
  position:relative!important;
  overflow:hidden!important;
  user-select:none!important;
  filter:none!important;
  isolation:isolate!important;
  transform:translateZ(0)!important;
}
.${MOSAIC}:is(span,a,em,strong,i,b,u,small,sub,sup,label,cite,code,kbd,mark,q,s,dfn,var,abbr,time,data){
  vertical-align:baseline!important;
  overflow:visible!important;
}
.${MOSAIC}::after{
  display:none!important;
  content:""!important;
  position:absolute!important;
  left:0!important;
  top:0!important;
  width:var(--em-ow,100%)!important;
  height:var(--em-oh,100%)!important;
  z-index:2147483000!important;
  pointer-events:none!important;
  box-sizing:border-box!important;
  border-radius:inherit!important;
}
.${MOSAIC} > .${OVERLAY}{
  display:none!important;
  position:absolute!important;
  left:0!important;
  top:0!important;
  width:var(--em-ow,100%)!important;
  height:var(--em-oh,100%)!important;
  z-index:2147483000!important;
  pointer-events:none!important;
  box-sizing:border-box!important;
  border-radius:inherit!important;
}
.${MOSAIC}[data-em-mode="blur"]::after,.${MOSAIC}[data-em-mode="blur"] > .${OVERLAY}{
  display:block!important;
  backdrop-filter:blur(22px) saturate(0.35)!important;
  -webkit-backdrop-filter:blur(22px) saturate(0.35)!important;
  background:rgba(245,245,245,.1)!important;
}
.${MOSAIC}[data-em-mode="solid"]{
  border-radius:2px!important;
}
.${MOSAIC}[data-em-mode="solid"]::after,.${MOSAIC}[data-em-mode="solid"] > .${OVERLAY}{
  display:block!important;
  background:#000!important;
  border-radius:2px!important;
}
.${MOSAIC}[data-em-mode="pixel"]::after,.${MOSAIC}[data-em-mode="pixel"] > .${OVERLAY}{
  display:block!important;
  mix-blend-mode:normal!important;
  backdrop-filter:blur(16px) saturate(0)!important;
  -webkit-backdrop-filter:blur(16px) saturate(0)!important;
  background-color:rgba(55,55,55,.9)!important;
  background-image:
    repeating-linear-gradient(0deg,rgba(140,140,140,.35) 0,rgba(140,140,140,.35) 6px,rgba(200,200,200,.3) 6px,rgba(200,200,200,.3) 12px),
    repeating-linear-gradient(90deg,rgba(130,130,130,.3) 0,rgba(130,130,130,.3) 6px,rgba(210,210,210,.28) 6px,rgba(210,210,210,.28) 12px)!important;
}
.${MOSAIC}[data-em-mode="dots"]::after,.${MOSAIC}[data-em-mode="dots"] > .${OVERLAY}{
  display:block!important;
  mix-blend-mode:normal!important;
  backdrop-filter:blur(14px) saturate(0)!important;
  -webkit-backdrop-filter:blur(14px) saturate(0)!important;
  background-color:rgba(235,235,235,.92)!important;
  background-image:radial-gradient(circle at 38% 38%,rgba(0,0,0,.42) 1px,transparent 1.75px)!important;
  background-size:4px 4px!important;
}
.${MOSAIC}[data-em-mode="stripes"]::after,.${MOSAIC}[data-em-mode="stripes"] > .${OVERLAY}{
  display:block!important;
  mix-blend-mode:normal!important;
  backdrop-filter:blur(10px) saturate(0)!important;
  -webkit-backdrop-filter:blur(10px) saturate(0)!important;
  background-color:rgba(40,40,40,.88)!important;
  background-image:repeating-linear-gradient(-36deg,rgba(255,255,255,.18) 0,rgba(255,255,255,.18) 4px,transparent 4px,transparent 9px)!important;
}
.${MOSAIC}:has(> .${OVERLAY})::after{
  display:none!important;
  content:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  background:none!important;
  background-image:none!important;
}
.${WRAP}{
  display:inline-block!important;
  position:relative!important;
  vertical-align:top!important;
  max-width:100%!important;
}
#${GUIDE_ID}{
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:2147483646;
  display:none;
}
#${GUIDE_ID}.emg-on{display:block;}
#${GUIDE_ID} .emg{
  position:absolute;
  background:rgba(255,145,77,.9);
  box-shadow:0 0 0 1px rgba(255,255,255,.35);
}
#${GUIDE_ID} .emg-h{left:0;right:0;height:1px;}
#${GUIDE_ID} .emg-v{top:0;bottom:0;width:1px;}
#${HOVER_MASK_ID}{
  position:fixed!important;
  pointer-events:none!important;
  z-index:2147483640!important;
  box-sizing:border-box!important;
  border-radius:3px!important;
  background:rgba(255,145,77,.35)!important;
  box-shadow:inset 0 0 0 2px rgba(255,120,40,.85)!important;
  opacity:0!important;
  visibility:hidden!important;
}
#${HOVER_MASK_ID}.em-mask-on{
  opacity:1!important;
  visibility:visible!important;
}
`.trim();
  let s = document.getElementById("elementmark-style");
  if (!s) {
    s = document.createElement("style");
    s.id = "elementmark-style";
    (document.head || document.documentElement).appendChild(s);
    console.log("[MosaicElem] 已注入样式");
  } else {
    console.log("[MosaicElem] 样式已更新");
  }
  s.textContent = css;
}

function injectPageBridge(cb) {
  if (document.getElementById("elementmark-page-js")) {
    cb?.();
    return;
  }
  const el = document.createElement("script");
  el.id = "elementmark-page-js";
  el.src = chrome.runtime.getURL("page-pick.js");
  el.onload = () => cb?.();
  el.onerror = () => console.error("[MosaicElem] page-pick.js 加载失败");
  (document.head || document.documentElement).appendChild(el);
}

function postPick(on) {
  window.postMessage({ __em: 1, cmd: "pick", on }, "*");
}

function ensureHoverMask() {
  let m = document.getElementById(HOVER_MASK_ID);
  if (m) return m;
  m = document.createElement("div");
  m.id = HOVER_MASK_ID;
  document.documentElement.appendChild(m);
  return m;
}

function hideHoverMask() {
  const m = document.getElementById(HOVER_MASK_ID);
  if (!m) return;
  m.classList.remove("em-mask-on");
  m.style.removeProperty("left");
  m.style.removeProperty("top");
  m.style.removeProperty("width");
  m.style.removeProperty("height");
}

function showHoverMask(el) {
  if (!el || !document.contains(el)) {
    hideHoverMask();
    return;
  }
  const m = ensureHoverMask();
  const r = el.getBoundingClientRect();
  m.style.left = `${Math.round(r.left)}px`;
  m.style.top = `${Math.round(r.top)}px`;
  m.style.width = `${Math.max(0, Math.round(r.width))}px`;
  m.style.height = `${Math.max(0, Math.round(r.height))}px`;
  m.classList.add("em-mask-on");
}

function ensureGuides() {
  let root = document.getElementById(GUIDE_ID);
  if (root) return root;
  root = document.createElement("div");
  root.id = GUIDE_ID;
  root.innerHTML =
    '<div class="emg emg-h emg-t"></div>' +
    '<div class="emg emg-h emg-b"></div>' +
    '<div class="emg emg-v emg-l"></div>' +
    '<div class="emg emg-v emg-r"></div>';
  document.documentElement.appendChild(root);
  return root;
}

function syncGuides(el) {
  const g = document.getElementById(GUIDE_ID);
  if (!pick || !el || !document.contains(el)) {
    if (g) g.classList.remove("emg-on");
    hideHoverMask();
    return;
  }
  const root = ensureGuides();
  const r = el.getBoundingClientRect();
  root.querySelector(".emg-t").style.top = `${Math.round(r.top)}px`;
  root.querySelector(".emg-b").style.top = `${Math.round(r.bottom - 1)}px`;
  root.querySelector(".emg-l").style.left = `${Math.round(r.left)}px`;
  root.querySelector(".emg-r").style.left = `${Math.round(r.right - 1)}px`;
  root.classList.add("emg-on");
  showHoverMask(el);
}

let pick = false;
let pickCancelled = false;
let last = null;

function emSkipPick(el) {
  return !el || el === document.documentElement || el === document.body;
}

function clearHl() {
  last = null;
  syncGuides(null);
}

function onMove(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  console.log("[MosaicElem] move", e.clientX, e.clientY, el?.tagName, el);
  if (emSkipPick(el)) {
    clearHl();
    return;
  }
  if (el === last) {
    syncGuides(last);
    return;
  }
  clearHl();
  last = el;
  syncGuides(last);
  console.log("[MosaicElem] highlight", el.tagName, el.className);
}

const EM_MODES = new Set(["blur", "pixel", "solid", "dots", "stripes"]);

let mosaicResizeObserver = null;
let mosaicWindowResizeBound = false;

function getMosaicResizeObserver() {
  if (mosaicResizeObserver) return mosaicResizeObserver;
  if (typeof ResizeObserver === "undefined") return null;
  mosaicResizeObserver = new ResizeObserver((entries) => {
    for (const e of entries) {
      if (e.target.classList.contains(MOSAIC)) measureAndSetPseudoSize(e.target);
    }
  });
  return mosaicResizeObserver;
}

function ensureMosaicWindowResize() {
  if (mosaicWindowResizeBound) return;
  mosaicWindowResizeBound = true;
  window.addEventListener(
    "resize",
    () => {
      document.querySelectorAll(`.${MOSAIC}`).forEach(measureAndSetPseudoSize);
    },
    { passive: true }
  );
}

function measureAndSetPseudoSize(el) {
  if (!el?.classList?.contains(MOSAIC)) return;
  void el.offsetHeight;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  el.style.setProperty("--em-ow", `${Math.max(0, w)}px`);
  el.style.setProperty("--em-oh", `${Math.max(0, h)}px`);
}

function canUseOverlayChild(el) {
  return (
    el?.nodeType === 1 &&
    el.namespaceURI === "http://www.w3.org/1999/xhtml" &&
    !VOID_HTML.has(el.tagName) &&
    !NO_INNER_OVERLAY.has(el.tagName)
  );
}

function needsFormControlWrap(el) {
  if (!el || el.nodeType !== 1) return false;
  const t = el.tagName;
  if (t === "TEXTAREA" || t === "SELECT") return true;
  if (t === "INPUT") {
    const ty = (el.getAttribute("type") || "text").toLowerCase();
    return !INPUT_WRAP_SKIP.has(ty);
  }
  return false;
}

function ensureFormWrap(control) {
  const p = control.parentElement;
  if (p?.classList.contains(WRAP)) return p;
  const wrap = document.createElement("span");
  wrap.className = WRAP;
  p.insertBefore(wrap, control);
  wrap.appendChild(control);
  return wrap;
}

function unwrapFormWrap(wrap) {
  if (!wrap?.classList.contains(WRAP)) return;
  const parent = wrap.parentNode;
  if (!parent) return;
  let ctrl = null;
  for (const c of wrap.children) {
    if (!c.classList.contains(OVERLAY)) {
      ctrl = c;
      break;
    }
  }
  if (ctrl) parent.insertBefore(ctrl, wrap);
  wrap.remove();
}

function removeMosaicOverlay(el) {
  el?.querySelector(`:scope > .${OVERLAY}`)?.remove();
}

function ensureMosaicOverlay(el) {
  if (!el?.classList?.contains(MOSAIC) || !canUseOverlayChild(el)) return;
  if (el.querySelector(`:scope > .${OVERLAY}`)) return;
  const layer = document.createElement("span");
  layer.className = OVERLAY;
  layer.setAttribute("aria-hidden", "true");
  el.appendChild(layer);
}

function bindMosaicLayout(el) {
  if (!el) return;
  ensureMosaicWindowResize();
  measureAndSetPseudoSize(el);
  getMosaicResizeObserver()?.observe(el);
  requestAnimationFrame(() => measureAndSetPseudoSize(el));
}

function unbindMosaicLayout(el) {
  if (!el) return;
  getMosaicResizeObserver()?.unobserve(el);
  el.style.removeProperty("--em-ow");
  el.style.removeProperty("--em-oh");
}

function normalizeMode(raw) {
  return EM_MODES.has(raw) ? raw : "blur";
}

function applyModeToEl(el, mode) {
  const m = normalizeMode(mode);
  el.setAttribute("data-em-mode", m);
  el.removeAttribute("data-em-label");
}

function mosaicTargetForApply(hit) {
  return needsFormControlWrap(hit) ? ensureFormWrap(hit) : hit;
}

function migrateMosaicHostIfNeeded(el) {
  if (!el?.classList?.contains(MOSAIC)) return el;
  if (needsFormControlWrap(el) && !el.parentElement?.classList.contains(WRAP)) {
    const mode = el.getAttribute("data-em-mode");
    el.classList.remove(MOSAIC);
    el.removeAttribute("data-em-mode");
    el.removeAttribute("data-em-label");
    const wrap = ensureFormWrap(el);
    wrap.classList.add(MOSAIC);
    if (mode) wrap.setAttribute("data-em-mode", mode);
    return wrap;
  }
  return el;
}

function syncAllMosaicElements(mode) {
  injectStyle();
  const nodes = document.querySelectorAll(`.${MOSAIC}`);
  if (!nodes.length) return;
  const m = normalizeMode(mode);
  nodes.forEach((el) => {
    const host = migrateMosaicHostIfNeeded(el);
    applyModeToEl(host, m);
    bindMosaicLayout(host);
    ensureMosaicOverlay(host);
  });
}

async function applyMosaic(x, y) {
  if (!pick) return;
  const hit = document.elementFromPoint(x, y);
  console.log("[MosaicElem] click(主世界)", x, y, hit);
  if (emSkipPick(hit)) return;

  const m = hit.closest(`.${MOSAIC}`);
  if (m) {
    if (last && (last === m || m.contains(last))) clearHl();
    unbindMosaicLayout(m);
    removeMosaicOverlay(m);
    m.removeAttribute("data-em-mode");
    m.removeAttribute("data-em-label");
    m.classList.remove(MOSAIC);
    if (m.classList.contains(WRAP)) unwrapFormWrap(m);
    syncGuides(last);
    console.log("[MosaicElem] mosaic 已移除", m.tagName, m.className);
    return;
  }

  const { mosaicMode = "blur" } = await chrome.storage.local.get("mosaicMode");
  const mode = normalizeMode(mosaicMode);

  clearHl();
  const target = mosaicTargetForApply(hit);
  target.classList.add(MOSAIC);
  applyModeToEl(target, mode);
  measureAndSetPseudoSize(target);
  ensureMosaicOverlay(target);
  ensureMosaicWindowResize();
  getMosaicResizeObserver()?.observe(target);
  requestAnimationFrame(() => measureAndSetPseudoSize(target));
  console.log("[MosaicElem] mosaic 已加", mode, target.tagName, target.className);
}

function onWindowMessage(ev) {
  if (ev.source !== window || ev.data?.__em !== 1 || ev.data.cmd !== "click") return;
  void applyMosaic(ev.data.x, ev.data.y);
}

window.addEventListener("message", onWindowMessage);

function onKey(e) {
  if (e.key === "Escape") stopPick();
}

function onPickScroll() {
  if (!pick || !last || !document.contains(last)) return;
  syncGuides(last);
}

function startPick(done) {
  console.log("[MosaicElem] startPick", { pick, href: location.href });
  injectStyle();
  if (pick) {
    done?.();
    return;
  }
  pickCancelled = false;
  injectPageBridge(() => {
    if (pickCancelled) {
      done?.();
      return;
    }
    postPick(true);
    pick = true;
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onPickScroll, { capture: true, passive: true });
    window.addEventListener("resize", onPickScroll, { passive: true });
    console.log("[MosaicElem] 选中模式已开启");
    done?.();
  });
}

function stopPick() {
  console.log("[MosaicElem] stopPick", { pick });
  pickCancelled = true;
  postPick(false);
  if (!pick) return;
  pick = false;
  document.removeEventListener("mousemove", onMove, true);
  document.removeEventListener("keydown", onKey, true);
  window.removeEventListener("scroll", onPickScroll, true);
  window.removeEventListener("resize", onPickScroll);
  clearHl();
  console.log("[MosaicElem] 选中模式已关闭");
}

function clearAllMosaic() {
  const nodes = document.querySelectorAll(`.${MOSAIC}`);
  const n = nodes.length;
  nodes.forEach((el) => {
    unbindMosaicLayout(el);
    removeMosaicOverlay(el);
    el.removeAttribute("data-em-mode");
    el.removeAttribute("data-em-label");
    el.classList.remove(MOSAIC);
    if (el.classList.contains(WRAP)) unwrapFormWrap(el);
  });
  console.log("[MosaicElem] clearAllMosaic", n);
  return n;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log("[MosaicElem] onMessage", msg);
  if (msg?.type === "PICK_START") {
    startPick(() => sendResponse({ ok: true, on: pick }));
    return true;
  }
  if (msg?.type === "PICK_STOP") {
    stopPick();
    sendResponse({ ok: true, on: false });
    return true;
  }
  if (msg?.type === "PICK_STATUS") {
    sendResponse({ ok: true, on: pick });
    return;
  }
  if (msg?.type === "PICK_TOGGLE") {
    if (pick) {
      stopPick();
      sendResponse({ ok: true, on: false });
      return;
    }
    startPick(() => sendResponse({ ok: true, on: pick }));
    return true;
  }
  if (msg?.type === "CLEAR_MOSAIC") {
    const count = clearAllMosaic();
    sendResponse({ ok: true, count });
    return true;
  }
  if (msg?.type === "SYNC_MOSAIC_MODE") {
    syncAllMosaicElements(msg.mode);
    sendResponse({ ok: true });
    return true;
  }
});
