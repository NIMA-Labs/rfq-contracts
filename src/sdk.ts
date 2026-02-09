import rfqSettlementArtifact from '../artifacts/contracts/RFQSettlement.sol/RFQSettlement.json' with {type: 'json'};
import {
  Account,
  Address,
  ContractEventArgsFromTopics,
  ContractFunctionArgs,
  decodeEventLog,
  getAddress,
  isHex,
  parseEventLogs,
  PublicClient,
  verifyTypedData,
  WalletClient,
} from 'viem';
import { iPermit2Abi, rfqSettlementAbi } from './abi';

export const CHAIN_CONSTANTS = {
  1329: {
    permit2: getAddress('0xC6b7aC7Bbd8b456b67e8440694503cAC2Afb1d98'),
    weth9: getAddress('0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7'),
  },
} as const;
export type SupportedChainId = keyof typeof CHAIN_CONSTANTS;
export type RFQParams = ContractFunctionArgs<typeof rfqSettlementAbi, 'nonpayable', 'settleRFQ'>[0];
export type MakerSignedSwapIntent = RFQParams['makerSignedSwapIntent'];
export type TakerSignedSwapIntent = RFQParams['takerSignedSwapIntent'];
export type SignatureParams = MakerSignedSwapIntent['signatureParams'];
export type MakerSwapIntent = MakerSignedSwapIntent['makerSwapIntent'];
export type TakerSwapIntent = TakerSignedSwapIntent['takerSwapIntent'];
export type PermitTransferFrom = ContractFunctionArgs<typeof iPermit2Abi, 'nonpayable', 'permitWitnessTransferFrom'>[0];
export type DecodedRfqSettledEventArgs = ContractEventArgsFromTopics<typeof rfqSettlementAbi, 'RFQSettled'>;
export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return chainId in CHAIN_CONSTANTS;
}
export function formatMakerTypedDataParams(
  makerSwapIntent: MakerSwapIntent,
  deadline: bigint,
  nonce: bigint,
  rfqSettlement: Address,
  chainId: SupportedChainId,
) {
  const permit = {
    permitted: {
      token: makerSwapIntent.inputToken,
      amount: makerSwapIntent.inputAmount,
    },
    deadline,
    nonce,
  } as const satisfies PermitTransferFrom;
  const witness = {
    witness: makerSwapIntent,
    witnessTypeName: 'MakerSwapIntent',
    witnessType: {
      MakerSwapIntent: [
        { name: 'counterparty', type: 'address' },
        { name: 'inputToken', type: 'address' },
        { name: 'outputToken', type: 'address' },
        { name: 'inputAmount', type: 'uint256' },
        { name: 'outputAmount', type: 'uint256' },
        { name: 'unwrap', type: 'bool' },
      ],
    },
  } as const;
  const { permit2 } = CHAIN_CONSTANTS[chainId];
  const domain = {
    chainId,
    name: 'Permit2',
    verifyingContract: permit2,
  } as const;
  const types = {
    PermitWitnessTransferFrom: [
      { name: 'permitted', type: 'TokenPermissions' },
      { name: 'spender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'witness', type: witness.witnessTypeName },
    ],
    TokenPermissions: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    ...witness.witnessType,
  } as const;
  const message = {
    ...permit,
    spender: getAddress(rfqSettlement),
    witness: witness.witness,
  } as const;
  return {
    domain,
    types,
    message,
    primaryType: 'PermitWitnessTransferFrom',
  } as const;
}
export function formatTakerTypedDataParams(
  TakerSwapIntent: TakerSwapIntent,
  deadline: bigint,
  nonce: bigint,
  rfqSettlement: Address,
  chainId: SupportedChainId,
) {
  const permit = {
    permitted: {
      token: TakerSwapIntent.inputToken,
      amount: TakerSwapIntent.inputAmount,
    },
    deadline,
    nonce,
  } as const satisfies PermitTransferFrom;
  const witness = {
    witness: TakerSwapIntent,
    witnessTypeName: 'TakerSwapIntent',
    witnessType: {
      TakerSwapIntent: [
        { name: 'inputToken', type: 'address' },
        { name: 'outputToken', type: 'address' },
        { name: 'inputAmount', type: 'uint256' },
        { name: 'outputAmount', type: 'uint256' },
        { name: 'unwrap', type: 'bool' },
        { name: 'frontendReferral', type: 'bytes32' },
      ],
    },
  } as const;
  const { permit2 } = CHAIN_CONSTANTS[chainId];
  const domain = {
    chainId,
    name: 'Permit2',
    verifyingContract: permit2,
  } as const;
  const types = {
    PermitWitnessTransferFrom: [
      { name: 'permitted', type: 'TokenPermissions' },
      { name: 'spender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'witness', type: witness.witnessTypeName },
    ],
    TokenPermissions: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    ...witness.witnessType,
  } as const;
  const message = {
    ...permit,
    spender: getAddress(rfqSettlement),
    witness: witness.witness,
  } as const;
  return {
    domain,
    types,
    message,
    primaryType: 'PermitWitnessTransferFrom',
  } as const;
}
export async function signMakerSwapIntent(
  signerAccount: Account,
  deadline: bigint,
  nonce: bigint,
  makerSwapIntent: MakerSwapIntent,
  rfqSettlement: Address,
  chainId: SupportedChainId,
) {
  if (signerAccount.signTypedData === undefined) {
    throw new Error('Account unable to sign');
  }
  const signature = await signerAccount.signTypedData(formatMakerTypedDataParams(makerSwapIntent, deadline, nonce, rfqSettlement, chainId));
  const signatureParams = {
    deadline,
    nonce,
    signer: signerAccount.address,
    signature,
  };
  return {
    signatureParams,
    makerSwapIntent,
  } satisfies MakerSignedSwapIntent;
}
export async function verifyMakerSignedSwapIntent(
  signedSwapIntent: MakerSignedSwapIntent,
  rfqSettlement: Address,
  chainId: SupportedChainId,
) {
  const {
    signatureParams,
    makerSwapIntent,
  } = signedSwapIntent;
  const valid = verifyTypedData({
    ...formatMakerTypedDataParams(
      makerSwapIntent,
      signatureParams.deadline,
      signatureParams.nonce,
      rfqSettlement,
      chainId,
    ),
    address: signatureParams.signer,
    signature: signatureParams.signature,
  });
  return valid;
}
export async function signTakerSwapIntent(
  signerAccount: Account,
  deadline: bigint,
  nonce: bigint,
  takerSwapIntent: TakerSwapIntent,
  rfqSettlement: Address,
  chainId: SupportedChainId,
) {
  if (signerAccount.signTypedData === undefined) {
    throw new Error('Account unable to sign');
  }
  const signature = await signerAccount.signTypedData(formatTakerTypedDataParams(takerSwapIntent, deadline, nonce, rfqSettlement, chainId));
  const signatureParams = {
    deadline,
    nonce,
    signer: signerAccount.address,
    signature,
  };
  return {
    signatureParams,
    takerSwapIntent,
  } satisfies TakerSignedSwapIntent;
}
export async function verifyTakerSignedSwapIntent(
  takerSignedSwapIntent: TakerSignedSwapIntent,
  rfqSettlement: Address,
  chainId: SupportedChainId,
) {
  const {
    signatureParams,
    takerSwapIntent,
  } = takerSignedSwapIntent;
  const valid = verifyTypedData({
    ...formatTakerTypedDataParams(
      takerSwapIntent,
      signatureParams.deadline,
      signatureParams.nonce,
      rfqSettlement,
      chainId,
    ),
    address: signatureParams.signer,
    signature: signatureParams.signature,
  });
  return valid;
}
export async function settleRfq(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Account,
  rfqSettlement: Address,
  makerSignedSwapIntent: MakerSignedSwapIntent,
  takerSignedSwapIntent: TakerSignedSwapIntent,
  feePips: bigint,
) {
  const tx = await walletClient.writeContract({
    abi: rfqSettlementAbi,
    account,
    address: rfqSettlement,
    chain: null,
    functionName: 'settleRFQ',
    args: [{
      makerSignedSwapIntent,
      takerSignedSwapIntent,
      feePips,
    }],
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
  const { topics, data } = parseEventLogs({
    abi: rfqSettlementAbi,
    logs: receipt.logs,
    eventName: 'RFQSettled',
  })[0];
  const decodedRfqSettledEventArgs = decodeEventLog({
    abi: rfqSettlementAbi,
    eventName: 'RFQSettled',
    topics,
    data,
  }).args;
  return {
    tx,
    receipt,
    decodedRfqSettledEventArgs,
  };
}

export async function deployRfqSettlement(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Account,
  owner: Address,
  feeTreasury: Address,
) {
  const rfqSettlementBytecode = rfqSettlementArtifact.bytecode;
  if (!isHex(rfqSettlementBytecode)) {
    throw new Error('rfqSettlementBytecode is not valid hex');
  }
  const chainId = await publicClient.getChainId();
  if (!isSupportedChainId(chainId)) {
    throw new Error(`Chain ${chainId} is not supported`);
  }
  const { permit2, weth9 } = CHAIN_CONSTANTS[chainId];
  const tx = await walletClient.deployContract({
    chain: null,
    abi: rfqSettlementAbi,
    account,
    bytecode: rfqSettlementBytecode,
    args: [
      permit2,
      weth9,
      owner,
      feeTreasury,
    ],
  });
  const { contractAddress } = await publicClient.waitForTransactionReceipt({ hash: tx });
  if (!isHex(contractAddress)) {
    throw new Error('RFQSettlement deploy tx failed');
  }
  return contractAddress;
}
