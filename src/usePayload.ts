import { useEffect, useState } from 'react';
import { BonusDataItem, Region } from './interfaces';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8080/';

function usePayload(token: string) {
  const [payload, setPayload] = useState<{ regions: Region[], bonus_tiles: BonusDataItem[] } | null>(null);
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

export default usePayload;
