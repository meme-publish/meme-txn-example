import {Address} from 'viem';
import {Config} from 'wagmi';

// Slippage 1-100
export type Slippage = number;

export interface TxnParams {
  config: Config;
  token: Address;
  tknAmount: number;
  ethAmount: number;
  slippage: Slippage;
  toWallet: Address;
}

export interface CreateMemeContractParams {
  config: Config;
  name: string;
  symbol: string;
  tknAmount: number;
  ethAmount: number;
  slippage: Slippage;
}

export type UseQuoteBuy = (params?: Omit<TxnParams, 'config' | 'toWallet'>) => {
  isLoading: boolean;
  data?: {
    receiveTknAmount: string;
    costEthAmount: string;
    tknPer: number;
    tokenSupply: number;
  };
};

export type UseQuoteSell = (params?: Omit<TxnParams, 'config' | 'toWallet'>) => {
  isLoading: boolean;
  data?: {
    costTknAmount: string;
    receiveEthAmount: string;
    tknPer: number;
    tokenSupply: number;
  };
};
