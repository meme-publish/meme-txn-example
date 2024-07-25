/**
 * Slippage
 * @param params
 * @returns
 */
export function getPriceBySlippage(params: {
  type: 'buy' | 'sell';
  quotedEthAmount: bigint;
  quotedTknAmount: bigint;
  slippage: number;
}) {
  const slippage = params.type === 'buy' ? params.slippage : 0 - params.slippage;

  const price =
    ((params.quotedEthAmount / params.quotedTknAmount) * BigInt(100 + slippage)) / BigInt(100);

  return price;
}

/**
 * Fee
 * @param params
 * @returns
 */
export function getFee(params: {quotedEthAmount: bigint; feeRatio: number}) {
  const fee = (params.quotedEthAmount * BigInt((params.feeRatio / 1000) * 100)) / BigInt(100);
  return fee;
}
