import {Address} from 'viem';
import {Config} from 'wagmi';
import {readContract} from 'wagmi/actions';
import {EMPTY_ADDREE} from '../utils';

export async function getOwner(params: {
  config: Config;
  contractsAddress: Address;
  token: Address;
}) {
  const {config, token, contractsAddress} = params;

  if (token === EMPTY_ADDREE) return contractsAddress;

  const owner = await readContract(config, {
    abi: [
      {
        inputs: [],
        name: 'owner',
        outputs: [{internalType: 'address', name: '', type: 'address'}],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: token,
    functionName: 'owner',
  });

  return owner;
}
