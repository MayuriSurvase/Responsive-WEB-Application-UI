"use strict";

// Record preferences only; CSS owns inheritance, layout and appearance.
// Display preferences are independent of tile, form and dialog lifecycle code.
(() => {
  const storageKey = "logistics-display-view";
  const views = new Set(["compact", "normal", "large"]);
  const tileViews = new Set(["default", ...views]);
  const root = document.documentElement;
  let view = "normal";

  try {
    // Preserve the former Dense preference under its new name.
    const stored = localStorage.getItem(storageKey);
    const saved = stored === "dense" ? "large" : stored;
    if (views.has(saved)) view = saved;
  } catch {
    // The selector still works when storage is unavailable or blocked.
  }

  function applyView(value) {
    view = views.has(value) ? value : "normal";
    if (view === "normal") root.removeAttribute("data-display-view");
    else root.dataset.displayView = view;
  }

  // Apply a saved preference before content is rendered.
  applyView(view);
  document.addEventListener("DOMContentLoaded", () => {
    const workspace = document.querySelector(".tile-container");
    function addTileSelectors() {
      workspace?.querySelectorAll(".form-tile").forEach(tile => {
        const header = tile.querySelector(":scope > .tile-header");
        if (!header || header.querySelector(".tile-display-control")) return;
        const control = document.createElement("div");
        control.className = "tile-display-control";
        const label = document.createElement("label");
        const select = document.createElement("select");
        select.id = `${tile.id}-display-view`;
        label.htmlFor = select.id;
        label.textContent = "View";
        const title = header.querySelector(".tile-title-text")?.textContent || tile.id;
        select.setAttribute("aria-label", `Display view for ${title}`);
        [["compact", "Compact"], ["default", "Default"], ["normal", "Normal"], ["large", "Large"]].forEach(([value, text]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = text;
          select.append(option);
        });
        const savedTileView = tile.dataset.displayView === "dense" ? "large" : tile.dataset.displayView;
        select.value = tileViews.has(savedTileView) ? savedTileView : "default";
        tile.dataset.displayView = select.value;
        select.addEventListener("change", () => {
          select.value = tileViews.has(select.value) ? select.value : "default";
          tile.dataset.displayView = select.value;
        });
        control.append(label, select);
        header.insertBefore(control, header.querySelector(".tile-delete"));

        // CSS exposes this disclosure only for the tile's effective Compact view.
        // Keep the original controls and their event handlers intact.
        control.id = `${tile.id}-display-control`;
        const formButton = header.querySelector(".tile-dialog-button");
        if (formButton) formButton.id = `${tile.id}-open-form`;
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "tile-controls-toggle";
        toggle.textContent = "\u22ef";
        toggle.setAttribute("aria-label", `Toggle title bar controls for ${title}`);
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", [formButton?.id, control.id].filter(Boolean).join(" "));
        toggle.addEventListener("click", () => {
          toggle.setAttribute("aria-expanded", String(toggle.getAttribute("aria-expanded") !== "true"));
        });
        header.insertBefore(toggle, header.querySelector("h2").nextSibling);
      });
    }
    addTileSelectors();
    if (workspace) new MutationObserver(addTileSelectors).observe(workspace, { childList: true });

    const selector = document.getElementById("display-view");
    if (!selector) return;
    selector.value = view;
    selector.addEventListener("change", () => {
      applyView(selector.value);
      selector.value = view;
      try {
        localStorage.setItem(storageKey, view);
      } catch {
        // Keep the selected view active for this visit even without storage.
      }
    });
  }, { once: true });
})();
