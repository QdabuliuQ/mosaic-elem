/**
 * MosaicElem masking engine (browser-only, no extension APIs).
 * Used by the official site demo; logic aligned with content.js.
 */
(function (global) {
  const MOSAIC = "elementmark-mosaic";
  const OVERLAY = "em-mosaic-layer";
  const FLOAT = "em-mosaic-float";
  const GUIDE_ID = "elementmark-guides";
  const HOVER_MASK_ID = "elementmark-hover-mask";
  const STYLE_ID = "elementmark-style";

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
  const EXTERNAL_OVERLAY = new Set(["TEXTAREA", "SELECT"]);
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
  const EM_MODES = new Set(["blur", "pixel", "solid", "dots", "stripes"]);

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
.${MOSAIC}[data-em-mode="solid"]{ border-radius:2px!important; }
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
.${MOSAIC}[data-em-external="1"]{
  overflow:visible!important;
}
.${FLOAT}{
  position:fixed!important;
  pointer-events:none!important;
  z-index:2147483000!important;
  box-sizing:border-box!important;
  border-radius:inherit!important;
}
.${FLOAT}[data-em-mode="blur"]{
  backdrop-filter:blur(22px) saturate(0.35)!important;
  -webkit-backdrop-filter:blur(22px) saturate(0.35)!important;
  background:rgba(245,245,245,.1)!important;
}
.${FLOAT}[data-em-mode="solid"]{
  background:#000!important;
  border-radius:2px!important;
}
.${FLOAT}[data-em-mode="pixel"]{
  mix-blend-mode:normal!important;
  backdrop-filter:blur(16px) saturate(0)!important;
  -webkit-backdrop-filter:blur(16px) saturate(0)!important;
  background-color:rgba(55,55,55,.9)!important;
  background-image:
    repeating-linear-gradient(0deg,rgba(140,140,140,.35) 0,rgba(140,140,140,.35) 6px,rgba(200,200,200,.3) 6px,rgba(200,200,200,.3) 12px),
    repeating-linear-gradient(90deg,rgba(130,130,130,.3) 0,rgba(130,130,130,.3) 6px,rgba(210,210,210,.28) 6px,rgba(210,210,210,.28) 12px)!important;
}
.${FLOAT}[data-em-mode="dots"]{
  mix-blend-mode:normal!important;
  backdrop-filter:blur(14px) saturate(0)!important;
  -webkit-backdrop-filter:blur(14px) saturate(0)!important;
  background-color:rgba(235,235,235,.92)!important;
  background-image:radial-gradient(circle at 38% 38%,rgba(0,0,0,.42) 1px,transparent 1.75px)!important;
  background-size:4px 4px!important;
}
.${FLOAT}[data-em-mode="stripes"]{
  mix-blend-mode:normal!important;
  backdrop-filter:blur(10px) saturate(0)!important;
  -webkit-backdrop-filter:blur(10px) saturate(0)!important;
  background-color:rgba(40,40,40,.88)!important;
  background-image:repeating-linear-gradient(-36deg,rgba(255,255,255,.18) 0,rgba(255,255,255,.18) 4px,transparent 4px,transparent 9px)!important;
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
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement("style");
      s.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(s);
    }
    s.textContent = css;
  }

  function create(options = {}) {
    const root = options.root || null;
    const ignore =
      options.ignore ||
      (() => false);
    let getMode = options.getMode || (() => "blur");
    const onPickChange = options.onPickChange || (() => {});

    let pick = false;
    let last = null;
    let mosaicResizeObserver = null;
    let mosaicWindowResizeBound = false;

    function inScope(el) {
      if (!el || el.nodeType !== 1) return false;
      if (ignore(el)) return false;
      if (!root) return el !== document.documentElement && el !== document.body;
      return root === el || root.contains(el);
    }

    function hitAt(x, y) {
      const stack =
        typeof document.elementsFromPoint === "function"
          ? document.elementsFromPoint(x, y)
          : [document.elementFromPoint(x, y)];
      for (const el of stack) {
        if (!el || el.nodeType !== 1) continue;
        if (el.id === HOVER_MASK_ID || el.id === GUIDE_ID) continue;
        if (el.classList?.contains(OVERLAY) || el.classList?.contains(FLOAT)) continue;
        if (inScope(el)) return el;
      }
      return null;
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
      let g = document.getElementById(GUIDE_ID);
      if (g) return g;
      g = document.createElement("div");
      g.id = GUIDE_ID;
      g.innerHTML =
        '<div class="emg emg-h emg-t"></div>' +
        '<div class="emg emg-h emg-b"></div>' +
        '<div class="emg emg-v emg-l"></div>' +
        '<div class="emg emg-v emg-r"></div>';
      document.documentElement.appendChild(g);
      return g;
    }

    function syncGuides(el) {
      const g = document.getElementById(GUIDE_ID);
      if (!pick || !el || !document.contains(el)) {
        if (g) g.classList.remove("emg-on");
        hideHoverMask();
        return;
      }
      const rootG = ensureGuides();
      const r = el.getBoundingClientRect();
      rootG.querySelector(".emg-t").style.top = `${Math.round(r.top)}px`;
      rootG.querySelector(".emg-b").style.top = `${Math.round(r.bottom - 1)}px`;
      rootG.querySelector(".emg-l").style.left = `${Math.round(r.left)}px`;
      rootG.querySelector(".emg-r").style.left = `${Math.round(r.right - 1)}px`;
      rootG.classList.add("emg-on");
      showHoverMask(el);
    }

    function clearHl() {
      last = null;
      syncGuides(null);
    }

    function normalizeMode(raw) {
      return EM_MODES.has(raw) ? raw : "blur";
    }

    function needsExternalOverlay(el) {
      if (!el || el.nodeType !== 1) return false;
      const t = el.tagName;
      if (EXTERNAL_OVERLAY.has(t)) return true;
      if (t === "INPUT") {
        const ty = (el.getAttribute("type") || "text").toLowerCase();
        return !INPUT_WRAP_SKIP.has(ty);
      }
      return false;
    }

    function getFloatOverlay(el) {
      const fid = el?.getAttribute("data-em-float-id");
      return fid ? document.getElementById(fid) : null;
    }

    function syncFloatOverlay(el) {
      const float = getFloatOverlay(el);
      if (!float) return;
      const r = el.getBoundingClientRect();
      float.style.left = `${Math.round(r.left)}px`;
      float.style.top = `${Math.round(r.top)}px`;
      float.style.width = `${Math.max(0, Math.round(r.width))}px`;
      float.style.height = `${Math.max(0, Math.round(r.height))}px`;
      const mode = el.getAttribute("data-em-mode");
      if (mode) float.setAttribute("data-em-mode", mode);
    }

    function syncAllFloatOverlays() {
      document.querySelectorAll(`[data-em-float-id]`).forEach((el) => {
        if (el.classList.contains(MOSAIC)) syncFloatOverlay(el);
        else removeMosaicOverlay(el);
      });
    }

    function measureAndSetPseudoSize(el) {
      if (!el?.classList?.contains(MOSAIC)) return;
      if (needsExternalOverlay(el)) {
        syncFloatOverlay(el);
        return;
      }
      void el.offsetHeight;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      el.style.setProperty("--em-ow", `${Math.max(0, w)}px`);
      el.style.setProperty("--em-oh", `${Math.max(0, h)}px`);
    }

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
          queryMosaicNodes().forEach(measureAndSetPseudoSize);
          syncAllFloatOverlays();
        },
        { passive: true }
      );
    }

    function canUseOverlayChild(el) {
      return (
        el?.nodeType === 1 &&
        el.namespaceURI === "http://www.w3.org/1999/xhtml" &&
        !VOID_HTML.has(el.tagName) &&
        !NO_INNER_OVERLAY.has(el.tagName)
      );
    }

    function unwrapLegacyWrap(el) {
      const wrap = el?.closest?.(".em-mosaic-wrap");
      if (!wrap?.parentNode) return el;
      const parent = wrap.parentNode;
      for (const c of [...wrap.children]) {
        if (!c.classList.contains(OVERLAY) && !c.classList.contains(FLOAT)) {
          parent.insertBefore(c, wrap);
          if (wrap.classList.contains(MOSAIC)) {
            c.classList.add(MOSAIC);
            const mode = wrap.getAttribute("data-em-mode");
            if (mode) c.setAttribute("data-em-mode", mode);
          }
          wrap.remove();
          return c;
        }
      }
      wrap.remove();
      return el;
    }

    function removeMosaicOverlay(el) {
      if (!el) return;
      el.querySelector(`:scope > .${OVERLAY}`)?.remove();
      const float = getFloatOverlay(el);
      if (float) float.remove();
      el.removeAttribute("data-em-float-id");
      el.removeAttribute("data-em-external");
    }

    function ensureMosaicOverlay(el) {
      if (!el?.classList?.contains(MOSAIC)) return;
      if (needsExternalOverlay(el)) {
        el.setAttribute("data-em-external", "1");
        let float = getFloatOverlay(el);
        if (!float) {
          const fid = `elementmark-float-${Math.random().toString(36).slice(2, 9)}`;
          el.setAttribute("data-em-float-id", fid);
          float = document.createElement("div");
          float.id = fid;
          float.className = FLOAT;
          float.setAttribute("aria-hidden", "true");
          document.documentElement.appendChild(float);
        }
        const mode = el.getAttribute("data-em-mode") || "blur";
        float.setAttribute("data-em-mode", mode);
        syncFloatOverlay(el);
        return;
      }
      if (!canUseOverlayChild(el)) return;
      if (el.querySelector(`:scope > .${OVERLAY}`)) return;
      const layer = document.createElement("span");
      layer.className = OVERLAY;
      layer.setAttribute("aria-hidden", "true");
      el.appendChild(layer);
    }

    function applyModeToEl(el, mode) {
      el.setAttribute("data-em-mode", normalizeMode(mode));
      el.removeAttribute("data-em-label");
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

    function queryMosaicNodes() {
      const list = root ? root.querySelectorAll(`.${MOSAIC}`) : document.querySelectorAll(`.${MOSAIC}`);
      return [...list];
    }

    function mosaicTargetForApply(hit) {
      return unwrapLegacyWrap(hit);
    }

    function applyMosaic(x, y) {
      if (!pick) return;
      const hit = hitAt(x, y);
      if (!hit) return;

      const m = hit.closest(`.${MOSAIC}`);
      if (m && inScope(m)) {
        const target = m.classList.contains("em-mosaic-wrap") ? unwrapLegacyWrap(m) || m : m;
        if (last && (last === target || target.contains(last))) clearHl();
        unbindMosaicLayout(target);
        removeMosaicOverlay(target);
        target.removeAttribute("data-em-mode");
        target.classList.remove(MOSAIC);
        syncGuides(last);
        return;
      }

      const mode = normalizeMode(getMode());
      clearHl();
      const target = mosaicTargetForApply(hit);
      target.classList.add(MOSAIC);
      applyModeToEl(target, mode);
      measureAndSetPseudoSize(target);
      ensureMosaicOverlay(target);
      ensureMosaicWindowResize();
      getMosaicResizeObserver()?.observe(target);
      requestAnimationFrame(() => measureAndSetPseudoSize(target));
    }

    function onMove(e) {
      const el = hitAt(e.clientX, e.clientY);
      if (!el) {
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
    }

    function onClick(e) {
      if (!pick) return;
      if (!hitAt(e.clientX, e.clientY)) return;
      e.preventDefault();
      e.stopPropagation();
      applyMosaic(e.clientX, e.clientY);
    }

    function onKey(e) {
      if (e.key === "Escape") stopPick();
    }

    function onPickScroll() {
      syncAllFloatOverlays();
      if (!pick || !last || !document.contains(last)) return;
      syncGuides(last);
    }

    function startPick() {
      injectStyle();
      if (pick) return;
      pick = true;
      document.addEventListener("mousemove", onMove, true);
      document.addEventListener("click", onClick, true);
      document.addEventListener("keydown", onKey, true);
      window.addEventListener("scroll", onPickScroll, { capture: true, passive: true });
      window.addEventListener("resize", onPickScroll, { passive: true });
      onPickChange(true);
    }

    function stopPick() {
      if (!pick) return;
      pick = false;
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onPickScroll, true);
      window.removeEventListener("resize", onPickScroll);
      clearHl();
      onPickChange(false);
    }

    function togglePick() {
      if (pick) stopPick();
      else startPick();
      return pick;
    }

    function clearAll() {
      document.querySelectorAll(".em-mosaic-wrap").forEach((wrap) => unwrapLegacyWrap(wrap));
      queryMosaicNodes().forEach((el) => {
        unbindMosaicLayout(el);
        removeMosaicOverlay(el);
        el.removeAttribute("data-em-mode");
        el.classList.remove(MOSAIC);
      });
      document.querySelectorAll(`.${FLOAT}`).forEach((f) => f.remove());
    }

    function syncMode(mode) {
      const m = normalizeMode(mode);
      queryMosaicNodes().forEach((el) => {
        applyModeToEl(el, m);
        bindMosaicLayout(el);
        ensureMosaicOverlay(el);
      });
    }

    injectStyle();

    return {
      startPick,
      stopPick,
      togglePick,
      isPicking: () => pick,
      clearAll,
      syncMode,
      setGetMode(fn) {
        getMode = fn;
      },
    };
  }

  global.MosaicElemEngine = { create, injectStyle };
})(typeof window !== "undefined" ? window : globalThis);
