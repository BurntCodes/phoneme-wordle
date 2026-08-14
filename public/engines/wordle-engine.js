/**
 * Standalone Phoneme Wordle engine. No imports, no build step, no
 * framework — this file is loaded identically by the live Next.js app
 * (via a <script> tag) and by the exported standalone HTML (inlined
 * verbatim into a <script> tag), so there is exactly one implementation
 * of the game, not two that can drift apart.
 *
 * Usage: window.PhonemeWordleEngine.mount(containerEl, {
 *   target: { word, phonemes },
 *   labels: { [phoneme]: { letters, example } },
 *   consonantRows: string[][],
 *   vowelRows: string[][],
 *   maxGuesses: number,
 * }) -> { destroy() }
 */
(function () {
  var STYLE_ID = "pwe-wordle-styles";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ":root {",
      "  --pwe-cell-empty: #f8fafc;",
      "  --pwe-cell-filled: #f1f5f9;",
      "  --pwe-cell-filled-border: #94a3b8;",
      "  --pwe-cell-text: #1e293b;",
      "  --pwe-key-bg: #e2e8f0;",
      "  --pwe-key-text: #1e293b;",
      "  --pwe-correct: #16a34a;",
      "  --pwe-present: #d97706;",
      "  --pwe-absent: #94a3b8;",
      "  --pwe-tooltip-bg: #1e293b;",
      "  --pwe-tooltip-text: #ffffff;",
      "}",
      ".dark {",
      "  --pwe-cell-empty: #27272a;",
      "  --pwe-cell-filled: #3f3f46;",
      "  --pwe-cell-filled-border: #71717a;",
      "  --pwe-cell-text: #f4f4f5;",
      "  --pwe-key-bg: #3f3f46;",
      "  --pwe-key-text: #f4f4f5;",
      "  --pwe-tooltip-bg: #f4f4f5;",
      "  --pwe-tooltip-text: #18181b;",
      "}",
      ".pwe-root { display: flex; flex-direction: column; align-items: center; gap: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }",
      ".pwe-grid { display: flex; flex-direction: column; gap: 6px; }",
      ".pwe-row { display: flex; gap: 6px; justify-content: center; }",
      ".pwe-cell { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: 700; font-size: 1.1rem; border: 2px solid var(--pwe-cell-empty); background: var(--pwe-cell-empty); color: var(--pwe-cell-text); }",
      ".pwe-cell.pwe-filled { background: var(--pwe-cell-filled); border-color: var(--pwe-cell-filled-border); }",
      ".pwe-cell.pwe-correct { background: var(--pwe-correct); border-color: var(--pwe-correct); color: white; }",
      ".pwe-cell.pwe-present { background: var(--pwe-present); border-color: var(--pwe-present); color: white; }",
      ".pwe-cell.pwe-absent { background: var(--pwe-absent); border-color: var(--pwe-absent); color: white; }",
      ".pwe-message { min-height: 24px; font-weight: 600; text-align: center; }",
      ".pwe-keyboard { display: flex; flex-direction: column; align-items: center; gap: 6px; }",
      ".pwe-key-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }",
      ".pwe-tip-wrap { position: relative; display: inline-block; }",
      ".pwe-key { min-width: 36px; padding: 8px 10px; font-size: 0.9rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; background: var(--pwe-key-bg); color: var(--pwe-key-text); }",
      ".pwe-key.pwe-correct { background: var(--pwe-correct); color: white; }",
      ".pwe-key.pwe-present { background: var(--pwe-present); color: white; }",
      ".pwe-key.pwe-absent { background: var(--pwe-absent); color: white; }",
      ".pwe-tooltip { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; background: var(--pwe-tooltip-bg); color: var(--pwe-tooltip-text); font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; white-space: nowrap; z-index: 10; pointer-events: none; }",
      ".pwe-tip-wrap:hover .pwe-tooltip { display: block; }",
      ".pwe-controls { display: flex; gap: 8px; }",
      ".pwe-btn { padding: 8px 14px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; border: 1px solid var(--pwe-cell-filled-border); background: transparent; color: var(--pwe-cell-text); cursor: pointer; }",
      ".pwe-btn.pwe-primary { background: #18181b; color: white; border-color: #18181b; }",
      ".pwe-btn:disabled { opacity: 0.5; cursor: not-allowed; }",
    ].join("\n");
    document.head.appendChild(style);
  }

  function scoreGuess(guess, target) {
    var result = new Array(target.length).fill("absent");
    var remaining = {};

    target.forEach(function (p, i) {
      if (guess[i] === p) {
        result[i] = "correct";
      } else {
        remaining[p] = (remaining[p] || 0) + 1;
      }
    });

    guess.forEach(function (p, i) {
      if (result[i] === "correct") return;
      if ((remaining[p] || 0) > 0) {
        result[i] = "present";
        remaining[p] -= 1;
      }
    });

    return result;
  }

  function computeKeyStatuses(guesses) {
    var rank = { absent: 0, present: 1, correct: 2 };
    var result = {};
    guesses.forEach(function (g) {
      g.phonemes.forEach(function (p, i) {
        var status = g.statuses[i];
        if (!result[p] || rank[status] > rank[result[p]]) {
          result[p] = status;
        }
      });
    });
    return result;
  }

  function mount(container, options) {
    injectStyles();

    var target = options.target;
    var labels = options.labels || {};
    var rows = (options.consonantRows || []).concat(options.vowelRows || []);
    var maxGuesses = options.maxGuesses || 6;

    var guesses = [];
    var currentGuess = [];
    var gameState = "playing";

    container.innerHTML = "";
    var root = document.createElement("div");
    root.className = "pwe-root";

    var gridEl = document.createElement("div");
    gridEl.className = "pwe-grid";

    var messageEl = document.createElement("p");
    messageEl.className = "pwe-message";

    var keyboardEl = document.createElement("div");
    keyboardEl.className = "pwe-keyboard";

    var controlsEl = document.createElement("div");
    controlsEl.className = "pwe-controls";

    var backspaceBtn = document.createElement("button");
    backspaceBtn.type = "button";
    backspaceBtn.className = "pwe-btn";
    backspaceBtn.textContent = "Delete";

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "pwe-btn pwe-primary";
    submitBtn.textContent = "Submit";

    controlsEl.appendChild(backspaceBtn);
    controlsEl.appendChild(submitBtn);

    root.appendChild(gridEl);
    root.appendChild(messageEl);
    root.appendChild(keyboardEl);
    root.appendChild(controlsEl);
    container.appendChild(root);

    function renderGrid() {
      gridEl.innerHTML = "";
      for (var row = 0; row < maxGuesses; row++) {
        var rowEl = document.createElement("div");
        rowEl.className = "pwe-row";

        var phonemes = [];
        var statuses = [];
        if (row < guesses.length) {
          phonemes = guesses[row].phonemes;
          statuses = guesses[row].statuses;
        } else if (row === guesses.length) {
          phonemes = currentGuess;
        }

        for (var col = 0; col < target.phonemes.length; col++) {
          var cell = document.createElement("div");
          var phoneme = phonemes[col];
          var status = statuses[col];
          cell.className = "pwe-cell" + (status ? " pwe-" + status : phoneme ? " pwe-filled" : "");
          cell.textContent = phoneme || "";
          rowEl.appendChild(cell);
        }
        gridEl.appendChild(rowEl);
      }
    }

    function renderKeyboard() {
      keyboardEl.innerHTML = "";
      var statuses = computeKeyStatuses(guesses);

      rows.forEach(function (row) {
        var rowEl = document.createElement("div");
        rowEl.className = "pwe-key-row";

        row.forEach(function (symbol) {
          var wrap = document.createElement("div");
          wrap.className = "pwe-tip-wrap";

          var key = document.createElement("button");
          key.type = "button";
          key.textContent = symbol;
          var status = statuses[symbol];
          key.className = "pwe-key" + (status ? " pwe-" + status : "");
          key.addEventListener("click", function () {
            pressKey(symbol);
          });
          wrap.appendChild(key);

          var label = labels[symbol];
          if (label) {
            var tooltip = document.createElement("div");
            tooltip.className = "pwe-tooltip";
            tooltip.textContent = label.letters + " (as in " + label.example + ")";
            wrap.appendChild(tooltip);
          }

          rowEl.appendChild(wrap);
        });
        keyboardEl.appendChild(rowEl);
      });
    }

    function setControlsDisabled(disabled) {
      backspaceBtn.disabled = disabled;
      submitBtn.disabled = disabled;
    }

    function pressKey(symbol) {
      if (gameState !== "playing") return;
      if (currentGuess.length >= target.phonemes.length) return;
      currentGuess.push(symbol);
      renderGrid();
    }

    function backspace() {
      if (gameState !== "playing") return;
      currentGuess.pop();
      renderGrid();
    }

    function submitGuess() {
      if (gameState !== "playing") return;
      if (currentGuess.length !== target.phonemes.length) {
        messageEl.textContent = "Not enough phonemes yet.";
        return;
      }

      var statuses = scoreGuess(currentGuess, target.phonemes);
      guesses.push({ phonemes: currentGuess, statuses: statuses });
      currentGuess = [];
      messageEl.textContent = "";

      var won = statuses.every(function (s) {
        return s === "correct";
      });
      if (won) {
        gameState = "won";
        messageEl.textContent = "Correct! The word was " + target.word + ".";
      } else if (guesses.length >= maxGuesses) {
        gameState = "lost";
        messageEl.textContent =
          "Out of guesses. The word was " + target.word + " (" + target.phonemes.join(" ") + ").";
      }

      renderGrid();
      renderKeyboard();
      setControlsDisabled(gameState !== "playing");
    }

    function handleKeyDown(e) {
      if (e.key === "Enter") submitGuess();
      if (e.key === "Backspace") backspace();
    }

    backspaceBtn.addEventListener("click", backspace);
    submitBtn.addEventListener("click", submitGuess);
    window.addEventListener("keydown", handleKeyDown);

    renderGrid();
    renderKeyboard();

    return {
      destroy: function () {
        window.removeEventListener("keydown", handleKeyDown);
        container.innerHTML = "";
      },
    };
  }

  window.PhonemeWordleEngine = { mount: mount };
})();
