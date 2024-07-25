import {store} from './store';
import {Address} from 'viem';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {format} from 'date-fns';
import {random} from 'lodash-es';

export class Api {
  public async auth(params: {
    chain_id: number;
    wallet: string;
    hexsign: string;
    nonce: string;
    referral?: string;
  }) {
    const {server_domain} = store.getState();

    const res = await fetch(server_domain + '/v1/user/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(params),
    });

    const {data} = (await res.json()) as {data: {authorization: string}};

    return data.authorization;
  }

  public async saveMeme(params: {
    address: Address;
    image_uri: string;
    description: string;
    chain_id: number;
    sign?: string;
    twitter?: string;
    telegram?: string;
    website?: string;
  }) {
    const {server_domain, authorization} = store.getState();

    await fetch(server_domain + '/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        authorization: 'Bearer ' + authorization,
      },
      body: JSON.stringify(params),
    });
  }

  public async uploadToS3(file: File, fileTag: string = 'common') {
    const {server_domain, authorization} = store.getState();

    const res = await fetch(server_domain + '/v1/common/oss/token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        authorization: 'Bearer ' + authorization,
      },
    });

    const {data: s3Auth} = (await res.json()) as {
      data: {
        accessKeyId: string;
        expiration: string;
        secretAccessKey: string;
        sessionToken: string;
        region: string;
        bucket: string;
      };
    };

    const suffix = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';

    const dir = format(new Date(), 'yyyyMMdd');

    const remoteUri = `${dir}/${fileTag}_${format(new Date(), 'yyyyMMddHHmmss')}_${random(
      100000,
      900000,
    )}${suffix}`;

    const client = new S3Client({
      region: s3Auth.region,
      credentials: {
        accessKeyId: s3Auth.accessKeyId,
        secretAccessKey: s3Auth.secretAccessKey,
        sessionToken: s3Auth.sessionToken,
      },
    });

    const command = new PutObjectCommand({
      Bucket: s3Auth.bucket,
      Key: remoteUri,
      Body: file,
      ContentType: file.type,
    });

    const response = await client.send(command);

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error('upload failed');
    }

    return remoteUri;
  }
}
