"use client";

import { useCallback, useEffect, useState } from "react";
import WordSearchCell from "./WordSearchCell";
import { getPath, type Coord } from "@/lib/wordSearch";

function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

function cellFromPoint(x: number, y: number): Coord | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  const row = el?.dataset.row;
  const col = el?.dataset.col;
  if (row === undefined || col === undefined) return null;
  return { row: Number(row), col: Number(col) };
}

export default function WordSearchGrid({
  grid,
  foundCells,
  onSelectionComplete,
}: {
  grid: string[][];
  foundCells: Set<string>;
  onSelectionComplete: (path: Coord[]) => void;
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<Coord | null>(null);
  const [highlighted, setHighlighted] = useState<Coord[]>([]);

  function beginSelection(cell: Coord) {
    setIsSelecting(true);
    setStartCell(cell);
    setHighlighted([cell]);
  }

  function extendSelection(cell: Coord) {
    if (!isSelecting || !startCell) return;
    const path = getPath(startCell, cell);
    if (path) setHighlighted(path);
  }

  const endSelection = useCallback(() => {
    if (isSelecting && highlighted.length > 0) {
      onSelectionComplete(highlighted);
    }
    setIsSelecting(false);
    setStartCell(null);
    setHighlighted([]);
  }, [isSelecting, highlighted, onSelectionComplete]);

  // Mouse can release outside the grid entirely, so this has to be a window
  // listener rather than an onMouseUp on the container.
  useEffect(() => {
    window.addEventListener("mouseup", endSelection);
    return () => window.removeEventListener("mouseup", endSelection);
  }, [endSelection]);

  const highlightedKeys = new Set(highlighted.map(({ row, col }) => cellKey(row, col)));
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="inline-grid touch-none gap-0.5 select-none"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      onTouchEnd={endSelection}
      onTouchMove={(event) => {
        const touch = event.touches[0];
        const cell = cellFromPoint(touch.clientX, touch.clientY);
        if (cell) extendSelection(cell);
      }}
    >
      {grid.map((row, r) =>
        row.map((phoneme, c) => (
          <WordSearchCell
            key={cellKey(r, c)}
            row={r}
            col={c}
            phoneme={phoneme}
            highlighted={highlightedKeys.has(cellKey(r, c))}
            found={foundCells.has(cellKey(r, c))}
            onMouseDown={() => beginSelection({ row: r, col: c })}
            onMouseEnter={() => extendSelection({ row: r, col: c })}
            onTouchStart={() => beginSelection({ row: r, col: c })}
          />
        )),
      )}
    </div>
  );
}
