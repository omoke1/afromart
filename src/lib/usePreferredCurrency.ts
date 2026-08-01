import { useEffect, useState } from 'react';
const KEY = 'preferredCurrency';
export function usePreferredCurrency(defaultCode = 'GBP') {
  const [currency, setCurrency] = useState<string>(defaultCode);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) setCurrency(v);
    } catch (e) {
      // ignore
    }

    let mounted = true;
    async function loadProfileCurrency() {
      try {
        const res = await fetch('/api/profile/currency');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json?.currency) {
          setCurrency(json.currency);
        }
      } catch (e) {
        // ignore
      }
    }

    loadProfileCurrency();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, currency);
    } catch (e) {}
  }, [currency]);

  return { currency, setCurrency };
}
