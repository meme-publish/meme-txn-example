'use client';

import {Web3ModalProvider} from '@/config/walletconnect';
import {useStore} from 'zustand';
import {Button} from '@/components/ui/button';
import {useWeb3Modal} from '@web3modal/wagmi/react';
import {Config, useAccount, useChainId, useChains, useConfig} from 'wagmi';
import {baseSepolia} from 'viem/chains';
import {random} from 'lodash-es';
import {Address} from 'viem';
import {signMessage} from 'wagmi/actions';
import {store} from './store';
import {Api} from './api';
import {CreateMemeView} from './view.CreateMeme';
import {BuyView} from './view.Buy';
import {SellView} from './view.Sell';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default function Home() {
  return (
    <Web3ModalProvider chains={[baseSepolia]}>
      <Content />
    </Web3ModalProvider>
  );
}

function Content() {
  const chainId = useChainId();

  const {address: wallet} = useAccount();

  const authorization = useStore(store, state => state.authorization);

  const memego_contract_address = useStore(store, state => state.memego_contract_address);

  return (
    <main className='flex flex-col items-center space-y-3 py-6'>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='text-[20px]'>Contract Address</CardTitle>
        </CardHeader>
        <CardContent>{memego_contract_address}</CardContent>
      </Card>

      <SwitchChain />
      {chainId && <ConnectWallet />}
      {wallet && <Sign />}
      {wallet && authorization && (
        <div className='grid grid-cols-3 gap-3'>
          <CreateMemeView />
          <BuyView />
          <SellView />
        </div>
      )}
    </main>
  );
}

function Sign() {
  const {address: wallet} = useAccount();

  const chainId = useChainId();

  const config = useConfig();

  const authorization = useStore(store, state => state.authorization);

  async function auth(wallet: Address, chain_id: number, config: Config) {
    try {
      const nonce = new Date().valueOf() + '_' + random(10000, 100000);

      const hexsign = await signMessage(config, {message: nonce});

      const authorization = await new Api().auth({wallet, hexsign, nonce, chain_id});

      store.getState().apply({type: 'setAuthorization', authorization});
    } catch (error) {
      throw new Error('Please complete the signature!');
    }
  }

  return (
    <Button
      variant={authorization ? 'secondary' : 'default'}
      className='truncate w-[300px] overflow-hidden'
      onClick={() => {
        if (!wallet) return;
        auth(wallet, chainId, config);
      }}>
      {authorization ? <div className='truncate'>AUTH : {authorization}</div> : 'Sign'}
    </Button>
  );
}

function SwitchChain() {
  const chainId = useChainId();

  const chains = useChains();

  const chain = chains.find(e => e.id === chainId);

  const {open} = useWeb3Modal();

  const hasChain = !!chain;

  return (
    <Button
      variant={hasChain ? 'secondary' : 'default'}
      onClick={() => {
        open({view: 'Networks'});
      }}>
      {hasChain ? `CHAINS : ${chain.name}` : 'Change Networks'}
    </Button>
  );
}

function ConnectWallet() {
  const {open} = useWeb3Modal();

  const wallet = useAccount();

  const {address, isConnected} = wallet;

  const hasWallet = isConnected && address;

  return (
    <Button variant={hasWallet ? 'secondary' : 'default'} onClick={() => open()}>
      {hasWallet ? `WALLET : ${address}` : 'Connect Wallet'}
    </Button>
  );
}
