"use strict";

(() => {
  const workspace = document.querySelector('.tile-container');
  const tileStacks = new Map();
  const appStack = [];
  let sequence = 0;

  function header(card, title, close, next) {
    const bar = document.createElement('header');
    bar.className = 'popup-header';
    const heading = document.createElement('h2');
    heading.id = `popup-title-${++sequence}`;
    heading.textContent = title;
    card.setAttribute('aria-labelledby', heading.id);
    bar.append(heading);
    if (next) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'next-dialog';
      button.textContent = 'Open confirmation';
      button.addEventListener('click', () => next(button));
      bar.append(button);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'popup-close';
    button.textContent = 'Close';
    button.setAttribute('aria-label', `Close ${title}`);
    button.addEventListener('click', close);
    bar.append(button);
    card.append(bar);
    return button;
  }

  function content(card, scope, confirmation, close) {
    const hint = document.createElement('p');
    hint.className = 'scope-hint';
    hint.textContent = scope === 'application'
      ? 'Application scope · the rest of the workspace is blocked until this dialog closes.'
      : 'Tile scope · other tiles remain available. Only this tile’s underlying layer is blocked.';
    card.append(hint);
    const body = document.createElement('div');
    body.className = 'popup-body tile-body';
    if (confirmation) {
      const text = document.createElement('p');
      text.className = 'confirmation-copy';
      text.textContent = 'This is the third layer: anchor screen → address form → confirmation. Closing it returns to the form with entered values intact.';
      const actions = document.createElement('div');
      actions.className = 'popup-actions';
      ['Continue', 'Cancel'].forEach(label => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', close);
        actions.append(button);
      });
      body.append(text, actions);
    } else {
      body.append(window.LogisticsPreview.create('normal', `popup-${++sequence}`));
    }
    card.append(body);
  }

  function openApplication(confirmation = false, opener = document.activeElement) {
    const dialog = document.createElement('dialog');
    dialog.className = `app-dialog${confirmation ? ' confirmation' : ''}`;
    dialog.dataset.popupScope = 'application';
    function close() { dialog.close(); }
    const closeButton = header(dialog, confirmation ? 'Application confirmation' : 'Application address form', close,
      confirmation ? null : button => openApplication(true, button));
    content(dialog, 'application', confirmation, close);
    document.body.append(dialog);
    const entry = {dialog, opener};
    appStack.push(entry);
    dialog.addEventListener('close', () => {
      const index = appStack.indexOf(entry);
      appStack.splice(index, 1);
      dialog.remove();
      if (opener?.isConnected && !opener.closest('[inert]')) opener.focus({preventScroll:true});
    }, {once:true});
    dialog.showModal();
    closeButton.focus();
  }

  function updateTileInert(tile) {
    const stack = tileStacks.get(tile) || [];
    [...tile.children].forEach(child => {
      const topLayer = stack.at(-1)?.layer;
      child.inert = stack.length > 0 && child !== topLayer;
    });
  }

  function openTile(tile, confirmation = false, opener = document.activeElement) {
    const layer = document.createElement('div');
    layer.className = `tile-dialog-layer${confirmation ? ' confirmation' : ''}`;
    layer.dataset.popupScope = 'tile';
    const card = document.createElement('section');
    card.className = `tile-dialog-card${confirmation ? ' confirmation' : ''}`;
    card.setAttribute('role', 'dialog');
    // This is scoped interaction blocking, not a document-wide modal.
    card.setAttribute('aria-modal', 'false');
    const stack = tileStacks.get(tile) || [];
    const entry = {layer, opener, close};
    function close() {
      if (stack.at(-1) !== entry) return;
      stack.pop();
      layer.remove();
      if (!stack.length) tileStacks.delete(tile);
      updateTileInert(tile);
      if (opener?.isConnected && !opener.closest('[inert]')) opener.focus({preventScroll:true});
    }
    const closeButton = header(card, confirmation ? 'Tile confirmation' : 'Tile address form', close,
      confirmation ? null : button => openTile(tile, true, button));
    content(card, 'tile', confirmation, close);
    layer.append(card);
    tile.append(layer);
    stack.push(entry);
    tileStacks.set(tile, stack);
    updateTileInert(tile);
    closeButton.focus({preventScroll:true});
  }

  function addTriggers() {
    workspace.querySelectorAll('.form-tile').forEach(tile => {
      const bar = tile.querySelector(':scope > .tile-header');
      if (bar.querySelector('.tile-dialog-button')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile-dialog-button';
      button.textContent = 'Open tile form';
      button.addEventListener('click', () => openTile(tile, false, button));
      bar.insertBefore(button, bar.querySelector('.tile-delete'));
    });
    for (const tile of tileStacks.keys()) {
      if (!tile.isConnected) tileStacks.delete(tile);
    }
  }
  addTriggers();
  // Tiles are direct children. Dimension-label updates and dialog content
  // mutations do not need to rescan every tile during window resizing.
  new MutationObserver(addTriggers).observe(workspace, {childList:true});
  document.getElementById('app-dialog-button').addEventListener('click', () => openApplication());
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || appStack.length) return;
    // Escape closes the top layer in the tile that currently contains focus.
    const tile = document.activeElement.closest('.form-tile');
    const entry = tileStacks.get(tile)?.at(-1);
    if (entry) { event.preventDefault(); event.stopImmediatePropagation(); entry.close(); }
  }, true);
})();
