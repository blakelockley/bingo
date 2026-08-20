import { useMemo, useState } from 'react';
import { Region, Tile } from './interfaces';
import GridTile from './GridTile';
import usePayload from './usePayload';
import GridTileModal from './GridTileModal';

const TOKEN_STORAGE_KEY = 'bingoToken';
const REGIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];


export function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
  const { payload, loading, error } = usePayload(token);

  const [currentModal, setCurrentModal] = useState<Tile | null>(null)

  const handleTokenChange = (value: string) => {
    setToken(value);
    localStorage.setItem(TOKEN_STORAGE_KEY, value);
  };

  const regionMap = useMemo(() => {
    if (!payload)
      return {};

    let res: Record<number, Region> = {};
    for (const region of payload!.regions)
      res[region.number] = region;
    return res;
  }, [payload]);

  const bonusTiles = useMemo(() => {
    if (!payload)
      return [];

    return payload["bonus_tiles"];
  }, [payload]);

  return (
    <div className='relative w-full h-full'>
      {currentModal &&
        <GridTileModal tile={currentModal} closeModal={() => setCurrentModal(null)} />
      }
      <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center gap-4">
        {payload && (
          <div className="overflow-auto">
            <div className="grid grid-cols-4 gap-4 overflow-auto flex-shrink-0">
              <div key={1} className='text-white border w-[200px] h-[200px] flex-shrink-0'>
                <div className="grid grid-cols-2 gap-2 overflow-visible flex-shrink-0 p-2">
                  <GridTile key={0} tile={regionMap[0]?.["tiles"]![0]} onClick={setCurrentModal} />
                  {regionMap[1]?.["tiles"].map((tile) =>
                    <GridTile key={tile.number} tile={tile} onClick={setCurrentModal} />
                  )}
                </div>
              </div>

              {REGIONS.map((regionNumber: number) => {
                return (
                  <div key={regionNumber} className='text-white border w-[200px] h-[200px] flex-shrink-0 flex flex-col justify-center items-center'>

                    {!regionMap[regionNumber] &&
                      <div className='text-red-400 text-center'>Region {regionNumber} is locked!</div>
                    }
                    <div className="grid grid-cols-2 gap-2 overflow-visible flex-shrink-0 p-2">
                      {regionMap[regionNumber]?.["tiles"].map((tile) =>
                        <GridTile key={tile.number} tile={tile} onClick={setCurrentModal} />
                      )}
                    </div>
                  </div>
                );
              })}

              <div key={16} className='text-white border w-[200px] h-[200px] flex-shrink-0'>
                <div className="grid grid-cols-2 gap-2 overflow-visible flex-shrink-0 p-2">
                  {!!regionMap[16]
                    ? <GridTile key={0} tile={regionMap[16]?.["tiles"]![0]} onClick={setCurrentModal} />
                    : <div className={`border w-[88px] h-[88px] p-2 overflow-hidden cursor-pointer flex items-center justify-center text-center text-red-400 border-red-400`}>Final tile locked</div>
                  }

                  <div className={`w-[88px] h-[88px] p-2 overflow-hidden cursor-pointer flex items-end justify-center text-center text-yellow-400 underline`}>Bonus Tiles</div>

                  {bonusTiles.map((tile) =>
                    <GridTile key={tile.number} tile={tile} onClick={setCurrentModal} />
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {!payload && <p className="text-xl text-yellow-200 mt-20">Enter your team token to view the board</p>}

        <input
          type="text"
          value={token}
          onChange={(e) => handleTokenChange(e.target.value)}
          placeholder="Paste your team token"
          className="w-80 max-w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:border-gray-400"
        />

        {loading && <p className="text-gray-200">Loading…</p>}
        {error && <p className="text-red-400">Failed to load: {error}</p>}
      </div>
    </div>
  );
}

export default App;
