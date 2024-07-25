import {Address} from 'viem';
import {createStore} from 'zustand';
import {immer} from 'zustand/middleware/immer';

interface StoreValue {
  authorization?: string;
  aws_s3_domain: string;
  server_domain: string;
  memego_contract_address: Address;
  web3_modal_project_id: string;
  apply: (op: {type: 'setAuthorization'; authorization: string}) => void;
}

export const store = createStore(
  immer<StoreValue>(set => {
    return {
      web3_modal_project_id: 'ccd1d21876bd324f49d3b3271814146a',
      aws_s3_domain: 'https://oss.memego.meme',
      server_domain: 'https://service.memego.meme',
      memego_contract_address: '0xdc4847c860E5B4a9dd1BEdA4755174b4D385A0C4',
      apply: op => {
        switch (op.type) {
          case 'setAuthorization':
            set({authorization: op.authorization});
            break;
        }
      },
    };
  }),
);
