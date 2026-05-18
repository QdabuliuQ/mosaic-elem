(function () {
  const I18N = {
    zh: {
      navDemo: "在线体验",
      navFeatures: "功能",
      navInstall: "安装",
      heroTag: "PRIVACY · REDACTION · MV3",
      heroTitle: "点选即打码\n科幻级隐私遮挡",
      heroDesc: "在任意网页上选中元素，施加模糊或马赛克。截图、录屏、分享前快速脱敏。",
      heroCta: "立即体验",
      heroGithub: "查看源码",
      demoTitle: "在线体验",
      demoHint: "与扩展相同的打码引擎 · 在下方模拟页面中点选元素",
      modeBlur: "模糊",
      modePixel: "像素",
      modeSolid: "纯色",
      modeDots: "点阵",
      modeStripes: "条纹",
      btnPickStart: "开启选择元素",
      btnPickStop: "关闭选择元素",
      btnClear: "清除全部",
      statusIdle: "选择一种样式后开启点选，Esc 退出",
      statusPickOn: "点选已开启，单击元素打码，Esc 退出",
      statusPickOff: "点选已关闭",
      mockNote: "点击下方留言或输入框试试打码效果。",
      mockLabel: "留言",
      mockPlaceholder: "敏感内容示例…",
      mockFooter: "© 2026 Demo Page — 仅用于演示",
      featuresTitle: "功能亮点",
      f1t: "点选切换",
      f1d: "悬停高亮，单击施加或取消打码。",
      f2t: "五种样式",
      f2d: "模糊、像素格、纯色、点阵、斜纹。",
      f3t: "快捷键",
      f3d: "Ctrl/⌘ + Shift + 1 快速开关点选。",
      f4t: "表单友好",
      f4d: "支持 textarea 等控件的稳定遮挡。",
      installTitle: "安装扩展",
      install1: "克隆仓库或下载 ZIP",
      install2: "打开 chrome://extensions 或 edge://extensions",
      install3: "开启开发者模式 → 加载已解压的扩展程序",
      footer: "开源浏览器扩展 · MIT",
    },
    en: {
      navDemo: "Live demo",
      navFeatures: "Features",
      navInstall: "Install",
      heroTag: "PRIVACY · REDACTION · MV3",
      heroTitle: "Pick. Redact.\nSci-fi privacy overlay",
      heroDesc:
        "Select any element on a page and apply blur or mosaic before screenshots and screen sharing.",
      heroCta: "Try it now",
      heroGithub: "Source code",
      demoTitle: "Live demo",
      demoHint: "Same masking engine as the extension — pick elements in the sandbox below",
      modeBlur: "Blur",
      modePixel: "Pixel",
      modeSolid: "Solid",
      modeDots: "Dots",
      modeStripes: "Stripes",
      btnPickStart: "Start picking",
      btnPickStop: "Stop picking",
      btnClear: "Clear all",
      statusIdle: "Choose a style, then start picking. Press Esc to exit.",
      statusPickOn: "Pick mode on. Click elements to mask. Esc to exit.",
      statusPickOff: "Pick mode off.",
      mockNote: "Try masking the message or textarea below.",
      mockLabel: "Message",
      mockPlaceholder: "Sample sensitive text…",
      mockFooter: "© 2026 Demo Page — for demonstration only",
      featuresTitle: "Features",
      f1t: "Click to toggle",
      f1d: "Hover highlight; click to apply or remove masking.",
      f2t: "Five styles",
      f2d: "Blur, pixel grid, solid, dots, stripes.",
      f3t: "Shortcut",
      f3d: "Ctrl/⌘ + Shift + 1 to toggle pick mode.",
      f4t: "Form controls",
      f4d: "Reliable masking for textarea and similar controls.",
      installTitle: "Install the extension",
      install1: "Clone the repo or download the ZIP",
      install2: "Open chrome://extensions or edge://extensions",
      install3: "Enable Developer mode → Load unpacked",
      footer: "Open-source browser extension · MIT",
    },
  };

  let lang = "zh";
  const stage = document.getElementById("demo-stage");
  const btnPick = document.getElementById("btn-pick");
  const btnClear = document.getElementById("btn-clear");
  const statusEl = document.getElementById("demo-status");
  const heroTitle = document.querySelector(".hero h1");

  function t(key) {
    return I18N[lang][key] || key;
  }

  function applyLang() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    if (heroTitle) {
      heroTitle.innerHTML =
        lang === "zh"
          ? '点选即打码<br /><span class="accent">科幻级隐私遮挡</span>'
          : 'Pick. Redact.<br /><span class="accent">Sci-fi privacy overlay</span>';
    }
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      if (el === heroTitle) return;
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll(".lang-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });
    updatePickUi();
  }

  function getMode() {
    const r = document.querySelector('input[name="mode"]:checked');
    return r ? r.value : "blur";
  }

  const engine = window.MosaicElemEngine.create({
    root: stage,
    ignore: (el) => Boolean(el.closest("[data-em-ignore]")),
    getMode,
    onPickChange(on) {
      stage.classList.toggle("is-picking", on);
      updatePickUi();
    },
  });

  function updatePickUi() {
    const on = engine.isPicking();
    btnPick.textContent = on ? t("btnPickStop") : t("btnPickStart");
    btnPick.classList.toggle("is-active", on);
    statusEl.textContent = on ? t("statusPickOn") : t("statusIdle");
  }

  btnPick.addEventListener("click", () => {
    engine.togglePick();
    updatePickUi();
  });

  btnClear.addEventListener("click", () => {
    engine.clearAll();
  });

  document.querySelectorAll('input[name="mode"]').forEach((input) => {
    input.addEventListener("change", () => engine.syncMode(getMode()));
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      applyLang();
    });
  });

  applyLang();
})();
