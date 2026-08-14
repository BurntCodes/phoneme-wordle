/**
 * Standalone Phoneme Word Search engine. No imports, no build step, no
 * framework — loaded identically by the live Next.js app (via a <script>
 * tag) and by the exported standalone HTML (inlined verbatim into a
 * <script> tag), so there is exactly one implementation, not two that can
 * drift apart.
 *
 * Usage: window.PhonemeWordSearchEngine.mount(containerEl, {
 *   grid: string[][],
 *   words: { word, phonemes }[],
 *   labels: { [phoneme]: { letters, example } },
 * }) -> { destroy() }
 */
(function () {
  var STYLE_ID = "pws-word-search-styles";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ":root {",
      "  --pws-cell-bg: #f8fafc;",
      "  --pws-cell-border: #e2e8f0;",
      "  --pws-cell-text: #1e293b;",
      "  --pws-highlight: #fef08a;",
      "  --pws-highlight-text: #78350f;",
      "  --pws-found: #bbf7d0;",
      "  --pws-found-border: #16a34a;",
      "  --pws-found-text: #166534;",
      "  --pws-chip-bg: #f1f5f9;",
      "  --pws-tooltip-bg: #1e293b;",
      "  --pws-tooltip-text: #ffffff;",
      "}",
      ".dark {",
      "  --pws-cell-bg: #27272a;",
      "  --pws-cell-border: #3f3f46;",
      "  --pws-cell-text: #f4f4f5;",
      "  --pws-chip-bg: #3f3f46;",
      "  --pws-tooltip-bg: #f4f4f5;",
      "  --pws-tooltip-text: #18181b;",
      "}",
      ".pws-root { display: flex; flex-direction: column; align-items: center; gap: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }",
      ".pws-message { min-height: 24px; font-weight: 600; text-align: center; color: var(--pws-found-border); }",
      ".pws-grid { display: grid; gap: 3px; touch-action: none; }",
      ".pws-tip-wrap { position: relative; display: inline-block; }",
      ".pws-cell { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: 600; font-size: 0.85rem; user-select: none; cursor: pointer; border: 1px solid var(--pws-cell-border); background: var(--pws-cell-bg); color: var(--pws-cell-text); }",
      ".pws-cell.pws-highlighted { background: var(--pws-highlight); color: var(--pws-highlight-text); }",
      ".pws-cell.pws-found { background: var(--pws-found); border-color: var(--pws-found-border); color: var(--pws-found-text); }",
      ".pws-tooltip { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; background: var(--pws-tooltip-bg); color: var(--pws-tooltip-text); font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; white-space: nowrap; z-index: 10; pointer-events: none; }",
      ".pws-tip-wrap:hover .pws-tooltip { display: block; }",
      ".pws-word-list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }",
      ".pws-chip { padding: 6px 12px; border-radius: 6px; font-weight: 500; font-size: 0.9rem; background: var(--pws-chip-bg); color: var(--pws-cell-text); }",
      ".pws-chip.pws-found { background: var(--pws-found); color: var(--pws-found-text); text-decoration: line-through; }",
    ].join("\n");
    document.head.appendChild(style);
  }

  function cellKey(r, c) {
    return r + "," + c;
  }

  function getPath(start, end) {
    var dr = end.row - start.row;
    var dc = end.col - start.col;
    var straight = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    if (!straight) return null;

    var steps = Math.max(Math.abs(dr), Math.abs(dc));
    var stepR = steps === 0 ? 0 : dr / steps;
    var stepC = steps === 0 ? 0 : dc / steps;
    var path = [];
    for (var i = 0; i <= steps; i++) {
      path.push({ row: start.row + stepR * i, col: start.col + stepC * i });
    }
    return path;
  }

  function matchWord(path, grid, words, foundWords) {
    var forward = path.map(function (p) { return grid[p.row][p.col]; }).join("");
    var backward = path.slice().reverse().map(function (p) { return grid[p.row][p.col]; }).join("");

    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (foundWords.indexOf(w.word) !== -1) continue;
      var key = w.phonemes.join("");
      if (key === forward || key === backward) return w.word;
    }
    return null;
  }

  function mount(container, options) {
    injectStyles();

    var grid = options.grid;
    var words = options.words;
    var labels = options.labels || {};

    var isSelecting = false;
    var startCell = null;
    var highlighted = [];
    var foundWords = [];
    var foundCells = {};

    container.innerHTML = "";
    var root = document.createElement("div");
    root.className = "pws-root";

    var messageEl = document.createElement("p");
    messageEl.className = "pws-message";

    var gridEl = document.createElement("div");
    gridEl.className = "pws-grid";
    gridEl.style.gridTemplateColumns = "repeat(" + grid[0].length + ", 36px)";

    var listEl = document.createElement("div");
    listEl.className = "pws-word-list";

    root.appendChild(gridEl);
    root.appendChild(messageEl);
    root.appendChild(listEl);
    container.appendChild(root);

    function renderGrid() {
      gridEl.innerHTML = "";
      var highlightedKeys = highlighted.map(function (p) { return cellKey(p.row, p.col); });

      for (var r = 0; r < grid.length; r++) {
        for (var c = 0; c < grid[r].length; c++) {
          var wrap = document.createElement("div");
          wrap.className = "pws-tip-wrap";

          var cell = document.createElement("div");
          var phoneme = grid[r][c];
          var k = cellKey(r, c);
          cell.textContent = phoneme;
          cell.dataset.row = String(r);
          cell.dataset.col = String(c);
          cell.className =
            "pws-cell" +
            (foundCells[k] ? " pws-found" : highlightedKeys.indexOf(k) !== -1 ? " pws-highlighted" : "");

          cell.addEventListener("mousedown", makeBeginHandler(r, c));
          cell.addEventListener("mouseenter", makeExtendHandler(r, c));
          cell.addEventListener("touchstart", makeBeginHandler(r, c));

          wrap.appendChild(cell);

          var label = labels[phoneme];
          if (label) {
            var tooltip = document.createElement("div");
            tooltip.className = "pws-tooltip";
            tooltip.textContent = label.letters + " (as in " + label.example + ")";
            wrap.appendChild(tooltip);
          }

          gridEl.appendChild(wrap);
        }
      }
    }

    function makeBeginHandler(r, c) {
      return function () {
        beginSelection(r, c);
      };
    }

    function makeExtendHandler(r, c) {
      return function () {
        extendSelection(r, c);
      };
    }

    function renderWordList() {
      listEl.innerHTML = "";
      words.forEach(function (w) {
        var isFound = foundWords.indexOf(w.word) !== -1;
        var chip = document.createElement("span");
        chip.className = "pws-chip" + (isFound ? " pws-found" : "");
        chip.textContent = w.phonemes.join(" ") + (isFound ? " — " + w.word : "");
        listEl.appendChild(chip);
      });
    }

    function beginSelection(r, c) {
      isSelecting = true;
      startCell = { row: r, col: c };
      highlighted = [{ row: r, col: c }];
      renderGrid();
    }

    function extendSelection(r, c) {
      if (!isSelecting || !startCell) return;
      var path = getPath(startCell, { row: r, col: c });
      if (path) {
        highlighted = path;
        renderGrid();
      }
    }

    function endSelection() {
      if (isSelecting && highlighted.length > 0) {
        var match = matchWord(highlighted, grid, words, foundWords);
        if (match) {
          foundWords.push(match);
          highlighted.forEach(function (p) {
            foundCells[cellKey(p.row, p.col)] = true;
          });
        }
      }
      isSelecting = false;
      startCell = null;
      highlighted = [];
      renderGrid();
      renderWordList();
      if (foundWords.length === words.length) {
        messageEl.textContent = "Found every word!";
      }
    }

    function cellFromPoint(x, y) {
      var el = document.elementFromPoint(x, y);
      if (!el || el.dataset.row === undefined || el.dataset.col === undefined) return null;
      return { row: Number(el.dataset.row), col: Number(el.dataset.col) };
    }

    function handleTouchMove(e) {
      var touch = e.touches[0];
      var cell = cellFromPoint(touch.clientX, touch.clientY);
      if (cell) extendSelection(cell.row, cell.col);
    }

    window.addEventListener("mouseup", endSelection);
    gridEl.addEventListener("touchend", endSelection);
    gridEl.addEventListener("touchmove", handleTouchMove);

    renderGrid();
    renderWordList();

    return {
      destroy: function () {
        window.removeEventListener("mouseup", endSelection);
        container.innerHTML = "";
      },
    };
  }

  window.PhonemeWordSearchEngine = { mount: mount };
})();
