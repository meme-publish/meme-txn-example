import {defaultWagmiConfig} from '@web3modal/wagmi/react/config';
import {CreateConfigParameters} from 'wagmi';

export const createWagmiConfig = (options: {
  projectId: string;
  chains: CreateConfigParameters['chains'];
}) => {
  return defaultWagmiConfig({
    chains: options.chains,
    projectId: options.projectId,
    metadata: {
      name: 'MemeGo',
      description: 'MemeGo meme',
      url: 'https://www.memego.meme',
      icons: ['https://avatars.mywebsite.com/'],
    },
    ssr: true,
  });
};
