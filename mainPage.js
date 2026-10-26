"use strict";

// Tile lifecycle is independent of form content. Each click creates a new instance.
(() => {
  const tiles = document.querySelector(".tile-container");
  const normalButton = document.getElementById("normal-form-button");
  const wideButton = document.getElementById("wide-form-button");
  const count = document.getElementById("tile-count");
  const visibleTilesLabel = document.getElementById("visible-tile-count");
  const outsideTilesLabel = document.getElementById("outside-tile-count");
  const emptyState = document.getElementById("empty-state");
  const status = document.getElementById("tile-status");
  let nextId = 0;

  // Track interaction without moving focus or changing any tile/dialog behavior.
  // Only anchor interactions change selection. Application dialogs and other
  // controls outside this workspace leave the selected anchor untouched.
  let activeTile = null;
  function highlightActiveTile(event) {
    const tile = event.target.closest?.('.form-tile') ?? null;
    if (!tile || tile.parentElement !== tiles || tile === activeTile) return;
    activeTile?.removeAttribute('data-active-tile');
    activeTile = tile;
    activeTile?.setAttribute('data-active-tile', '');
  }
  document.addEventListener('pointerdown', highlightActiveTile);
  document.addEventListener('focusin', highlightActiveTile);

  const tileVisibility = new Map();
  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Ignore notifications queued before a tile was deleted.
      if (!tileVisibility.has(entry.target)) return;
      tileVisibility.set(entry.target, entry.isIntersecting && entry.intersectionRatio > 0);
    });
    updateVisibilityIndicator();
  }, {
    root: document.querySelector(".tile-workspace"),
    // Distinguish a visible portion from merely touching the viewport edge.
    threshold: [0, Number.EPSILON]
  });

  function updateVisibilityIndicator() {
    const visible = [];
    const outside = [];
    tileVisibility.forEach((isVisible, tile) => {
      const label = `Tile ${tile.id.slice("tile-".length)}`;
      (isVisible ? visible : outside).push(label);
    });
    const visibleText = visible.join(", ") || "None";
    const outsideText = outside.join(", ") || "None";
    // Avoid DOM mutations when an observer notification leaves the lists unchanged.
    if (visibleTilesLabel.textContent !== visibleText) visibleTilesLabel.textContent = visibleText;
    if (outsideTilesLabel.textContent !== outsideText) outsideTilesLabel.textContent = outsideText;
  }

  // Read rendered sizes only to display them. CSS still owns all layout.
  const dimensionObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const size = entry.borderBoxSize?.[0] ?? entry.borderBoxSize;
      const bounds = size ? null : entry.target.getBoundingClientRect();
      const width = Math.round(size?.inlineSize ?? bounds.width);
      const height = Math.round(size?.blockSize ?? bounds.height);
      const label = entry.target.querySelector('.tile-dimensions');
      const dimensions = `${width} × ${height} px`;
      if (label.textContent !== dimensions) {
        label.textContent = dimensions;
        label.setAttribute('aria-label', `Tile dimensions: ${width} pixels wide by ${height} pixels high`);
      }
    });
  });

  function getTiles() {
    return [...tiles.querySelectorAll(".form-tile")];
  }

  // CSS owns tile sizing and wrapping; tiles remain direct children.
  function updateStatus(message) {
    const total = getTiles().length;
    count.textContent = `${total} tile${total === 1 ? "" : "s"}`;
    emptyState.hidden = total !== 0;
    status.textContent = `${message} ${count.textContent} open.`;
    updateVisibilityIndicator();
  }

  function createTile(kind) {
    const id = ++nextId; // Never reuse IDs when a tile is deleted.
    const title = `${kind === "wide" ? "Load Management" : "Address Details"} ${id}`;
    const tile = document.createElement("article");
    tile.id = `tile-${id}`;
    tile.className = `form-tile form-${kind}`;
    tile.setAttribute("aria-labelledby", `tile-title-${id}`);

    const header = document.createElement("header");
    header.className = "tile-header";
    const heading = document.createElement("h2");
    heading.id = `tile-title-${id}`;
    const titleText = document.createElement("span");
    titleText.className = "tile-title-text";
    titleText.textContent = title;
    const dimensions = document.createElement("span");
    dimensions.className = "tile-dimensions";
    heading.append(titleText, dimensions);
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "tile-delete";
    removeButton.dataset.deleteTile = "";
    const deleteLabel = document.createElement("span");
    deleteLabel.className = "tile-delete-label";
    deleteLabel.textContent = "Delete";
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "tile-delete-icon";
    deleteIcon.textContent = "\u00d7";
    deleteIcon.setAttribute("aria-hidden", "true");
    removeButton.append(deleteLabel, deleteIcon);
    removeButton.setAttribute("aria-label", `Delete ${title}`);
    header.append(heading, removeButton);

    const body = document.createElement("div");
    body.className = "tile-body";
    // Replace this sample with a renderer that receives this specific body and ID.
    // Do not mount content into a fixed global #dynamic-form or #address-management.
    body.append(createSampleContent(kind, id));
    tile.append(header, body);
    tiles.prepend(tile); // Newest tile occupies the first position in DOM and layout.
    dimensionObserver.observe(tile, {box: "border-box"});
    tileVisibility.set(tile, false);
    visibilityObserver.observe(tile);
    updateStatus(`${title} created.`);
    return tile;
  }

  function createSampleContent(kind, id) {
    return window.LogisticsPreview.create(kind, id);
  }

  normalButton.addEventListener("click", () => createTile("normal"));
  wideButton.addEventListener("click", () => createTile("wide"));

  // One delegated listener handles every existing and future delete button.
  tiles.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-delete-tile]");
    if (!removeButton || !tiles.contains(removeButton)) return;
    const tile = removeButton.closest(".form-tile");
    const title = tile.querySelector(".tile-title-text").textContent;
    const items = getTiles();
    const index = items.indexOf(tile);
    const nextFocus = items[index + 1]?.querySelector(".tile-delete")
      ?? items[index - 1]?.querySelector(".tile-delete")
      ?? normalButton;
    dimensionObserver.unobserve(tile);
    visibilityObserver.unobserve(tile);
    tileVisibility.delete(tile);
    if (activeTile === tile) activeTile = null;
    tile.remove();
    nextFocus.focus();
    updateStatus(`${title} deleted.`);
  });

  const toggle = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.querySelector(".sidebar-backdrop");
  function setSidebar(open) {
    sidebar.hidden = !open;
    backdrop.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.addEventListener("click", () => setSidebar(sidebar.hidden));
  backdrop.addEventListener("click", () => { setSidebar(false); toggle.focus(); });
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || document.querySelector('dialog:modal')) return;
    if (event.key === "Escape" && !sidebar.hidden) {
      setSidebar(false);
      toggle.focus();
    }
  });
  createTile("normal");
  createTile("wide");
})();

