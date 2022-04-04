import {
  DEFAULT_GAS_PRICES,
  GAS_PRICE_API,
  MAX_AUTO_GAS_PRICE_GWEI,
} from '@darkforest_eth/constants';
import { GasPrices } from '@darkforest_eth/types';

/**
 * Gets the current gas prices from xDai's price oracle. If the oracle is broken, return some sane
 * defaults.
 */
export async function getAutoGasPrices(): Promise<GasPrices> {
  try {
    const res = await fetch(GAS_PRICE_API, {
      method: 'GET',
    });

    const prices = (await res.json()) as GasPrices;
    cleanGasPrices(prices);
    return prices;
  } catch (e) {
    return DEFAULT_GAS_PRICES;
  }
}

/**
 * In case xDai gives us a malformed response, clean it up with some default gas prices.
 */
function cleanGasPrices(gasPrices: GasPrices): void {
  if (typeof gasPrices.fast !== 'number') {
    gasPrices.fast = DEFAULT_GAS_PRICES.fast;
  }

  if (typeof gasPrices.average !== 'number') {
    gasPrices.average = DEFAULT_GAS_PRICES.average;
  }

  if (typeof gasPrices.slow !== 'number') {
    gasPrices.slow = DEFAULT_GAS_PRICES.slow;
  }

  gasPrices.fast = Math.max(1, Math.min(MAX_AUTO_GAS_PRICE_GWEI, gasPrices.fast));
  gasPrices.average = Math.max(1, Math.min(MAX_AUTO_GAS_PRICE_GWEI, gasPrices.average));
  gasPrices.slow = Math.max(1, Math.min(MAX_AUTO_GAS_PRICE_GWEI, gasPrices.slow));
}
