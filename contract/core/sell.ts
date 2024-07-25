import {Address, parseEther, parseUnits} from 'viem';
import {Config} from 'wagmi';
import {readContracts, waitForTransactionReceipt, writeContract} from 'wagmi/actions';
import {handleError} from './../utils';
import {TxnParams} from './../types';
import {getFee, getPriceBySlippage} from './utils';
import {getOwner} from './getOwner';
import {gatewayAbi} from '../abi/gateway/gateway';

export async function sell(contractsAddress: Address, params: TxnParams) {
  const {config, token, tknAmount, ethAmount, slippage} = params;

  const deadline = BigInt(new Date().getTime() + 5);

  try {
    const ownerAddress = await getOwner({config, contractsAddress, token});

    const {minPrice} = await getSellParams({
      token,
      config,
      tknAmount,
      ethAmount,
      slippage,
      ownerAddress,
    });

    console.info('token ownerAddress:', ownerAddress);

    const txHash = await writeContract(config, {
      abi: gatewayAbi,
      address: ownerAddress,
      functionName: 'sell',
      args: [
        token,
        parseUnits(tknAmount.toString(), 6),
        parseEther(ethAmount.toString()),
        minPrice,
        deadline,
      ],
    });

    await waitForTransactionReceipt(config, {hash: txHash});
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSellParams(params: {
  token: Address;
  config: Config;
  ownerAddress: Address;
  tknAmount: number;
  ethAmount: number;
  slippage: number;
}) {
  const {config, token, tknAmount, ethAmount, slippage, ownerAddress} = params;

  if (tknAmount === 0 && ethAmount === 0) {
    throw new Error('tknAmount and ethAmount cannot be 0');
  }

  const [[quotedTknAmount, quotedEthAmount], feeRatio] = await readContracts(config, {
    allowFailure: false,
    contracts: [
      {
        abi: gatewayAbi,
        address: ownerAddress,
        functionName: 'quoteSell',
        args: [token, parseUnits(tknAmount.toString(), 6), parseEther(ethAmount.toString())],
      },
      {
        abi: gatewayAbi,
        address: ownerAddress,
        functionName: 'getFeeRatio',
      },
    ],
  });
  const fee = getFee({quotedEthAmount, feeRatio});

  const minPrice = getPriceBySlippage({quotedEthAmount, quotedTknAmount, slippage, type: 'sell'});

  return {
    quotedEthAmount,
    quotedTknAmount,
    fee,
    minPrice,
  };
}
