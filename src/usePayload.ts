import { useEffect, useState } from 'react';
import { AdminRegion, BonusDataItem, Region, TeamData } from './interfaces';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8080/';

function usePayload(token: string) {
  const [payload, setPayload] = useState<{ regions: Region[] | AdminRegion[], bonus_tiles: BonusDataItem[], team?: TeamData } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayload = () => {
      setLoading(true);
      setError(null);

      // No token still gets a response — just a public/no-progress view of
      // the board — so only attach the header when we actually have one.
      fetch(API_URL, token ? { headers: { 'X-Token': token } } : undefined)
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

export default usePayload;
