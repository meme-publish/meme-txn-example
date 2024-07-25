'use client';

import {CreateConfigParameters, WagmiProvider} from 'wagmi';
import {createWeb3Modal} from '@web3modal/wagmi/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createWagmiConfig} from './wagmi';
import {useMemo} from 'react';
import {useStore} from 'zustand';
import {store} from '@/app/store';

const queryClient = new QueryClient();

export function Web3ModalProvider(
  props: React.PropsWithChildren<{chains: CreateConfigParameters['chains']}>,
) {
  const {chains} = props;

  const web3_modal_project_id = useStore(store, state => state.web3_modal_project_id);

  const wagmiConfig = useMemo(() => {
    const wagmiConfig = createWagmiConfig({projectId: web3_modal_project_id, chains});

    createWeb3Modal({
      wagmiConfig,
      projectId: web3_modal_project_id,
      enableAnalytics: true,
      enableOnramp: true,
    });

    return wagmiConfig;
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </WagmiProvider>
  );
}
