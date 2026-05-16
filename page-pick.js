(function () {
  if (globalThis.__mosaicElemPickBridge) return;
  globalThis.__mosaicElemPickBridge = 1;

  var pick = false;

  window.addEventListener(
    "message",
    function (e) {
      if (e.source !== window || !e.data || e.data.__em !== 1) return;
      if (e.data.cmd === "pick") pick = !!e.data.on;
    },
    false
  );

  function onCap(ev) {
    if (!pick) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    window.postMessage({ __em: 1, cmd: "click", x: ev.clientX, y: ev.clientY }, "*");
  }

  window.addEventListener("click", onCap, true);
})();
