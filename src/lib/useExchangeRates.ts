import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useExchangeRates() {
  const { data, error, isLoading } = useSWR('/api/exchange-rates', fetcher, { revalidateOnFocus: false });
  const rates = data?.data?.rates ?? {};
  const base = data?.data?.base ?? 'GBP';
  const fetchedAt = data?.fetched_at ?? null;

  function convert(amount: number, to: string) {
    if (!rates || !rates[to]) return null;
    return amount * rates[to];
  }

  return { rates, base, convert, error, isLoading, fetchedAt };
}
