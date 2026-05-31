export type CurrencyState = {
  coins: number;
  gems: number;
  energy: number;
  sprouts: number;
};

export const defaultCurrencies: CurrencyState = {
  coins: 12840,
  gems: 420,
  energy: 78,
  sprouts: 36,
};

const storageKey = 'anipals.currencies';
export const currencyEvent = 'anipals:currencies';

export function getCurrencies(): CurrencyState {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return defaultCurrencies;

  try {
    return { ...defaultCurrencies, ...JSON.parse(stored) };
  } catch {
    return defaultCurrencies;
  }
}

export function setCurrencies(next: CurrencyState) {
  localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(currencyEvent, { detail: next }));
}
