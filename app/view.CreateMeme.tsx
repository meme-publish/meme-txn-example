'use client';

import {Button} from '@/components/ui/button';
import {Config, useChainId, useConfig} from 'wagmi';
import {Input} from '@/components/ui/input';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useForm} from 'react-hook-form';
import {store} from './store';
import {Api} from './api';
import {toast} from 'sonner';
import {LoopHelper} from '@/lib/loopHelper';
import {dismissToast} from '@/components/ui/sonner';
import {createMeme} from '@/contract/core/createMeme';

const formSchema = z.object({
  name: z.string().min(1).max(30),
  symbol: z.string().min(1).max(10),
  description: z.string().min(1).max(1500),
  image_uri: z.string().min(1, 'Please upload an avatar'),
  twitter: z.string().url().optional(),
  telegram: z.string().url().optional(),
  website: z.string().url().optional(),
  slippage: z.number().transform(v => Number(v)),
  ethAmount: z.number().transform(v => Number(v)),
});

export function CreateMemeView() {
  const chain_id = useChainId();

  const config = useConfig();

  async function onCreateMeme(
    config: Config,
    params: {
      name: string;
      symbol: string;
      image_uri: string;
      description: string;
      chain_id: number;
      tknAmount: number;
      ethAmount: number;
      slippage: number;
      twitter?: string;
      telegram?: string;
      website?: string;
    },
  ) {
    const {memego_contract_address} = store.getState();

    let toastId;

    try {
      toastId = toast.loading('Starting the wallet, please complete the operation in the wallet', {
        position: 'top-center',
      });

      const {token, txHash} = await createMeme(memego_contract_address, {config, ...params});

      const isSuccrss = await LoopHelper.run({
        maxCount: 60,
        interval: 1000,
        exec: async () => {
          try {
            await new Api().saveMeme({...params, address: token, sign: txHash});
            return true;
          } catch (error) {
            return false;
          }
        },
        isStopkFun: isSuccess => {
          return isSuccess;
        },
      });

      if (!isSuccrss) {
        throw new Error('Mint Event not retrieved');
      }

      dismissToast(toastId);

      toast.success(`token : ${token}`, {position: 'top-center'});

      console.info('token', token);

      return token;
    } catch (error) {
      const errorMsg = (error as Error).message;

      console.info('errorMsg:', errorMsg);

      toastId && dismissToast(toastId);

      toast.error(errorMsg, {position: 'top-center'});
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      ethAmount: 0.1,
      slippage: 5,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    onCreateMeme(config, {...values, tknAmount: 0, chain_id});
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Meme</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col w-[400px]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
            <FormField
              control={form.control}
              name='name'
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      name='asdasd'
                      type='file'
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await new Api().uploadToS3(file);
                          console.info('upload url:', url);
                          form.setValue('image_uri', url);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({field}) => (
                <FormItem>
                  <FormLabel>MemeName</FormLabel>
                  <FormControl>
                    <Input placeholder='MemeName' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='symbol'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Ticker</FormLabel>
                  <FormControl>
                    <Input placeholder='Ticker' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder='Description' {...field} />
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

            <FormField
              control={form.control}
              name='twitter'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Twitter(optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Twitter' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='telegram'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Telegram(optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Telegram' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='website'
              render={({field}) => (
                <FormItem>
                  <FormLabel>Website(optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Website' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit'>CreateMeme</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
