import { useMemo, useState } from 'react';
import { CogIcon } from '@heroicons/react/solid';
import { BonusDataItem, Region, Tile } from './interfaces';
import GridTile from './GridTile';
import usePayload from './usePayload';
import GridTileModal from './GridTileModal';
import BonusTileModal from './BonusTileModal';

const TOKEN_STORAGE_KEY = 'bingoToken';
const REGIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];


function getInitialToken(): string {
  const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (saved) return saved;

  // Only fall back to a `?token=` in the URL when nothing is saved yet —
  // localStorage always wins once it has something.
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, urlToken);
    return urlToken;
  }

  return '';
}

export function App() {
  const [token, setToken] = useState(getInitialToken);
  const { payload, loading, error } = usePayload(token);

  const [currentModal, setCurrentModal] = useState<{ tile?: Tile, bonusDataItem?: BonusDataItem } | null>(null)
  const [showTokenInput, setShowTokenInput] = useState(false);

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
        <>
          {currentModal.tile
            ? <GridTileModal tile={currentModal.tile} closeModal={() => setCurrentModal(null)} bonusDataItem={currentModal.bonusDataItem} />
            : <BonusTileModal bonusDataItem={currentModal.bonusDataItem!} closeModal={() => setCurrentModal(null)} />
          }
        </>

      }
      <button
        type="button"
        onClick={() => setShowTokenInput((prev) => !prev)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
        title="Change team token"
      >
        <CogIcon className="w-5 h-5" />
      </button>


      <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center gap-4">
        {!payload && <p className="text-xl text-yellow-200 mt-20">Enter your team token to view the board</p>}

        {(!token || !!error || showTokenInput) && (
          <input
            type="text"
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="Paste your team token"
            className="w-80 max-w-full px-3 py-2 mb-8 rounded bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:border-gray-400"
          />
        )}

        {payload && (
          <div>
            <div className="grid grid-cols-4 gap-4 flex-shrink-0">
              <div key={1} className='text-white border w-[200px] h-[200px] flex-shrink-0'>
                <div className="grid grid-cols-2 gap-2 overflow-visible flex-shrink-0 p-2">
                  <GridTile key={0} tile={regionMap[0]?.["tiles"]![0]} onClick={() => setCurrentModal({ tile: regionMap[0]?.["tiles"]![0] })} />
                  {regionMap[1]?.["tiles"].map((tile) =>
                    <GridTile key={tile.number} tile={tile} onClick={() => setCurrentModal({ tile })} />
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
                        <GridTile key={tile.number} tile={tile} onClick={() => setCurrentModal({ tile })} />
                      )}
                    </div>
                  </div>
                );
              })}

              <div key={16} className='text-white border w-[200px] h-[200px] flex-shrink-0'>
                <div className="grid grid-cols-2 gap-2 overflow-visible flex-shrink-0 p-2">
                  {!!regionMap[16]
                    ? <GridTile key={0} tile={regionMap[16]?.["tiles"]![0]} onClick={() => setCurrentModal({ tile: regionMap[16]?.["tiles"]![0] })} />
                    : <div className={`border w-[88px] h-[88px] p-2 overflow-hidden cursor-pointer flex items-center justify-center text-center text-red-400 border-red-400`}>Final tile locked</div>
                  }

                  <div className={`w-[88px] h-[88px] p-2 overflow-hidden cursor-pointer flex items-end justify-center text-center text-yellow-400 underline`}>Bonus Tiles</div>

                  {bonusTiles.map((bonusDataItem) =>
                    bonusDataItem["tile"]
                      ? <GridTile key={bonusDataItem.tile.number} tile={bonusDataItem.tile} onClick={() => { setCurrentModal({ tile: bonusDataItem.tile!, bonusDataItem }) }} />
                      : <div className={`border w-[88px] h-[88px] p-2 overflow-hidden cursor-pointer flex items-center justify-center text-center text-gray-400 border-gray-400 border-dashed`} onClick={() => setCurrentModal({ bonusDataItem })}>Hidden</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {loading && <p className="text-gray-200">Loading…</p>}
        {error && <p className="text-red-400">Failed to load: {error}</p>}
      </div>
    </div>
  );
}

export default App;
