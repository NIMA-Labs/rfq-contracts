import { createPublicClient, createWalletClient, getAddress, http, isAddress, isHex } from 'viem';
import { deployRfqSettlement } from '../src/sdk';
import { config as dotenv } from 'dotenv';
import { privateKeyToAccount } from 'viem/accounts';
dotenv();

if (!isHex(process.env.DEPLOY_KEY)) {
  throw new Error('invalid env variable DEPLOY_KEY');
}
const account = privateKeyToAccount(process.env.DEPLOY_KEY);
const publicClient = createPublicClient({ transport: http('https://evm-rpc.sei-apis.com') });
const walletClient = createWalletClient({ transport: http('https://evm-rpc.sei-apis.com') });
const owner = process.argv[2] || account.address;
const feeTreasury = process.argv[3] || account.address;
if (!isAddress(owner)) {
  throw new Error('invalid positional variable owner');
}
if (!isAddress(feeTreasury)) {
  throw new Error('invalid positional variable feeTreasury');
}

deployRfqSettlement(
  publicClient,
  walletClient,
  account,
  owner,
  feeTreasury,
).then(e => console.log(getAddress(e)));
