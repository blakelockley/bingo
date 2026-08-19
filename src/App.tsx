import { useEffect, useMemo, useState } from 'react';
import { Region } from './interfaces';
import GridTile from './GridTile';

const REGIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8080/';
const TOKEN_STORAGE_KEY = 'bingoToken';

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

    const fetchPayload = () => {
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
    };

    fetchPayload();

    // Pick up any completions/unlocks that happened while the tab was in
    // the background instead of waiting on a manual refresh.
    window.addEventListener('focus', fetchPayload);
    return () => window.removeEventListener('focus', fetchPayload);
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

  const regionMap = useMemo(() => {
    if (!payload)
      return {};

    let res: Record<number, Region> = {};
    for (const region of payload!.regions)
      res[region.number] = region;
    return res;
  }, [payload]);

  console.log(payload?.regions)

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center gap-4">
      {payload && (
        <div className="overflow-auto">
          <div className="grid grid-cols-4 gap-4 overflow-auto flex-shrink-0">
            <div key={1} className='text-white border w-[200px] h-[200px] flex-shrink-0'>
              <div className="grid grid-cols-2 gap-2 overflow-visible flex-shrink-0 p-2">
                <GridTile key={0} tile={regionMap[0]?.["tiles"]![0]} />
                {regionMap[1]?.["tiles"].map((tile) =>
                  <GridTile key={tile.number} tile={tile} />
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
                      <GridTile key={tile.number} tile={tile} />
                    )}
                  </div>
                </div>
              );
            })}
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
  );
}

export default App;
