import { useEffect, useState } from 'react';
import { Tile, Region } from './interfaces';

const GRID_SIZE = 8;
const BLOCK_SIZE = 2; // tiles are numbered in 2x2 blocks, not straight rows
const BLOCKS_PER_ROW = GRID_SIZE / BLOCK_SIZE;
const TILES_PER_BLOCK = BLOCK_SIZE * BLOCK_SIZE;

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8080/';
const TOKEN_STORAGE_KEY = 'bingoToken';

interface PositionedTile extends Tile {
  region: number;
  row: number;
  col: number;
}

// Tiles are numbered block-by-block: all 4 tiles of a block are numbered in
// row-major order before moving on to the next block, and blocks themselves
// are numbered left-to-right, row by row across the whole grid. So tile 3
// lands on the second row of the grid (the third slot in the first block),
// not the third column of the first row.
function positionForTileNumber(number: number) {
  const index = number - 1;
  const blockIndex = Math.floor(index / TILES_PER_BLOCK);
  const withinBlockIndex = index % TILES_PER_BLOCK;

  const blockRow = Math.floor(blockIndex / BLOCKS_PER_ROW);
  const blockCol = blockIndex % BLOCKS_PER_ROW;

  const withinRow = Math.floor(withinBlockIndex / BLOCK_SIZE);
  const withinCol = withinBlockIndex % BLOCK_SIZE;

  return {
    row: blockRow * BLOCK_SIZE + withinRow,
    col: blockCol * BLOCK_SIZE + withinCol,
  };
}

function usePayload(token: string) {
  const [payload, setPayload] = useState<{ regions: Region[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setPayload(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(API_URL, { headers: { 'X-Token': token } })
      .then((res) => {
        if (res.status === 401) throw new Error('Invalid token');
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then(setPayload)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return { payload, loading, error };
}

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
  const { payload, loading, error } = usePayload(token);

  const handleTokenChange = (value: string) => {
    setToken(value);
    localStorage.setItem(TOKEN_STORAGE_KEY, value);
  };

  const tiles: PositionedTile[] = (payload?.regions ?? []).flatMap((region) =>
    region.tiles.map((tile) => ({
      ...tile,
      region: region.number,
      ...positionForTileNumber(tile.number),
    }))
  );

  const tileGrid: (PositionedTile | undefined)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(undefined)
  );
  tiles.forEach((tile) => {
    if (tile.row >= 0 && tile.row < GRID_SIZE && tile.col >= 0 && tile.col < GRID_SIZE) {
      tileGrid[tile.row][tile.col] = tile;
    }
  });

  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    row: Math.floor(i / GRID_SIZE),
    col: i % GRID_SIZE,
  }));

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center gap-4">
      <input
        type="text"
        value={token}
        onChange={(e) => handleTokenChange(e.target.value)}
        placeholder="Paste your team token"
        className="w-80 max-w-full px-3 py-2 rounded bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-600 focus:outline-none focus:border-gray-400"
      />

      {!token && <p className="text-sm text-gray-400">Enter your team token to view the board</p>}
      {loading && <p className="text-gray-200">Loading…</p>}
      {error && <p className="text-red-400">Failed to load: {error}</p>}

      {payload && (
        <div className="max-w-full max-h-[80vh] overflow-auto">
          <div className="grid grid-cols-8 w-fit">
            {cells.map(({ row, col }) => {
              const tile = tileGrid[row][col];
              const outline = regionOutlineClasses(row, col, tileGrid);

              if (!tile) {
                return <div key={`${row}-${col}`} className={`w-24 h-24 ${outline}`} />;
              }

              return (
                <div
                  key={`${row}-${col}`}
                  title={`${tile.name} (region ${tile.region})`}
                  className={`flex items-center justify-center text-center text-xs p-1 w-24 h-24 text-gray-200 ${outline}`}
                >
                  {tile.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {payload && (
        <pre className="w-full max-w-4xl overflow-auto bg-gray-800 text-gray-100 text-xs p-4 rounded border border-gray-600">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

// Thin border between tiles within the same region, thick highlighted
// border on the edges where one region ends and the next begins (or the
// board edge).
function regionOutlineClasses(
  row: number,
  col: number,
  tileGrid: (PositionedTile | undefined)[][]
) {
  const current = tileGrid[row]?.[col]?.region;
  const up = row === 0 ? undefined : tileGrid[row - 1]?.[col]?.region;
  const left = col === 0 ? undefined : tileGrid[row]?.[col - 1]?.region;
  const down = row === GRID_SIZE - 1 ? undefined : tileGrid[row + 1]?.[col]?.region;
  const right = col === GRID_SIZE - 1 ? undefined : tileGrid[row]?.[col + 1]?.region;

  return [
    up === current ? 'border-t border-t-gray-600' : 'border-t-2 border-t-gray-400',
    left === current ? 'border-l border-l-gray-600' : 'border-l-2 border-l-gray-400',
    right === current ? 'border-r border-r-gray-600' : 'border-r-2 border-r-gray-400',
    down === current ? 'border-b border-b-gray-600' : 'border-b-2 border-b-gray-400',
  ].join(' ');
}

export default App;
