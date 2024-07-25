'use client';

import {Button} from '@/components/ui/button';
import {Config, useAccount, useConfig} from 'wagmi';
import {Input} from '@/components/ui/input';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useForm} from 'react-hook-form';
import {store} from './store';
import {toast} from 'sonner';
import {buy} from '@/contract/core/buy';
import {dismissToast} from '@/components/ui/sonner';
import {TxnParams} from '@/contract/types';
import {Address} from 'viem';

const formSchema = z.object({
  token: z.string().min(1),
  slippage: z.number().transform(v => Number(v)),
  tknAmount: z.number().transform(v => Number(v)),
  ethAmount: z.number().transform(v => Number(v)),
});

export function BuyView() {
  const config = useConfig();
  const {address: wallet} = useAccount();

  async function onBuy(config: Config, params: Omit<TxnParams, 'config'>) {
    const {memego_contract_address} = store.getState();

    let toastId;

    try {
      toastId = toast.loading('Starting the wallet, please complete the operation in the wallet', {
        position: 'top-center',
      });

      await buy(memego_contract_address, {config, ...params});

      dismissToast(toastId);
      toast.success('The transaction is completed!', {position: 'top-center'});
      return true;
    } catch (error) {
      const e = error as Error;
      console.info('buy error:', e.message);
      toastId && dismissToast(toastId);
      toast.error(e.message, {position: 'top-center'});
      return false;
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      token: '',
      tknAmount: 0,
      ethAmount: 0.1,
      slippage: 5,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!wallet) return;
    console.log(values);
    onBuy(config, {...values, toWallet: wallet, token: values.token as Address});
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col w-[400px]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='token'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Input placeholder='Token' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='slippage'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Slippage</FormLabel>
                  <FormControl>
                    <Input placeholder='Slippage' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tknAmount'
              render={({field}) => (
                <FormItem>
                  <FormLabel>TknAmount</FormLabel>
                  <FormControl>
                    <Input placeholder='TknAmount' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ethAmount'
              render={({field}) => (
                <FormItem>
                  <FormLabel>EthAmount</FormLabel>
                  <FormControl>
                    <Input placeholder='EthAmount' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit'>Buy</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
