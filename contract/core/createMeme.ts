import {Address, decodeEventLog, parseEther, parseUnits} from 'viem';
import {readContract, waitForTransactionReceipt, writeContract} from 'wagmi/actions';
import {EMPTY_ADDREE, handleError} from './../utils';
import {getRes} from '@/lib/getRes';
import {getBuyParams} from './buy';
import {CreateMemeContractParams} from '../types';
import {gatewayAbi} from '../abi/gateway/gateway';

export async function createMeme(
  contractsAddress: Address,
  params: CreateMemeContractParams,
): Promise<{txHash: string; token: Address}> {
  const {config, name, symbol, tknAmount, ethAmount, slippage} = params;

  const isBuy = tknAmount > 0 || ethAmount > 0;

  const deadline = BigInt(new Date().getTime() + 5);

  try {
    const {quotedEthAmount, fee} = isBuy
      ? await getBuyParams({
          config,
          token: EMPTY_ADDREE,
          ownerAddress: contractsAddress,
          tknAmount,
          ethAmount,
          slippage,
        })
      : {
          quotedEthAmount: BigInt(0),
          fee: BigInt(0),
        };

    const mintFee = await readContract(config, {
      abi: gatewayAbi,
      address: contractsAddress,
      functionName: 'getMintFee',
    });

    const totalCost = mintFee + quotedEthAmount + fee;

    const txHash = await writeContract(config, {
      abi: gatewayAbi,
      address: contractsAddress,
      functionName: 'createMeme',
      args: [
        name,
        symbol,
        parseUnits(tknAmount.toString(), 6),
        parseEther(ethAmount.toString()),
        deadline,
      ],
      value: totalCost,
    });

    const receipt = await waitForTransactionReceipt(config, {hash: txHash});

    const token = getRes(() => {
      let token: string | undefined;

      receipt.logs.find(log => {
        try {
          const event = decodeEventLog({
            abi: gatewayAbi,
            eventName: 'MemeCreated',
            data: log.data,
            topics: log.topics,
          });
          token = event.args.token;
        } catch (error) {}
      });

      return token as Address;
    });

    if (!token) throw new Error('Token not created');
    if (!txHash) throw new Error('TxHash not created');

    return {token, txHash};
  } catch (error) {
    throw handleError(error);
  }
}
