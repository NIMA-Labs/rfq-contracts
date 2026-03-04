import {
  Abi,
  BaseError,
  ContractErrorName,
  decodeErrorResult,
  getAddress,
  Hex,
  isHex,
  maxUint256,
  PublicClient,
  TestClient,
  toHex,
  WalletClient,
  zeroAddress,
  zeroHash,
} from 'viem';
import hre from 'hardhat';
import { before, describe, it } from 'node:test';
import { Address, privateKeyToAccount } from 'viem/accounts';
import { setErc20Balance, setMockBankPrecompile, setMockErc20, unsigned } from '../src/fork-utils';
import { randomBytes } from 'node:crypto';
import {
  deployRfqSettlement,
  isSupportedChainId,
  settleRfq,
  signMakerSwapIntent,
  signTakerSwapIntent,
  SupportedChainId,
  MakerSwapIntent,
  TakerSwapIntent,
  verifyMakerSignedSwapIntent,
  verifyTakerSignedSwapIntent,
} from '../src/sdk';
import { PIPS, PRECISION } from '../src/common';
import { iPermit2Abi, rfqSettlementAbi } from '../src/abi';
import assert from 'node:assert';
const { viem } = await hre.network.connect('hardhat');

const baseToken = getAddress('0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7'); // WSEI
const quoteToken = getAddress('0xe15fc38f6d8c56af07bbcbe3baf5708a2bf42392'); // USDC
const makerQuotePricePrecision = BigInt(5e11) * PRECISION; // 1 WSEI = 0.5 USDC
const feePips = 10n;
const takerQuoteTokenAmount = BigInt(1e6); // taker sell amount
const takerQuoteTokenFeeAmount = takerQuoteTokenAmount * feePips / PIPS; // taker fee in quote token
const makerQuoteTokenAmount = takerQuoteTokenAmount - takerQuoteTokenFeeAmount; // maker buy amount
const makerBaseTokenAmount = makerQuoteTokenAmount * makerQuotePricePrecision / PRECISION; // maker sell amount
const takerBaseTokenAmount = makerBaseTokenAmount; // taker buy amount

const makerAccount = privateKeyToAccount(toHex('makerAccount', { size: 32 }));
const takerAccount = privateKeyToAccount(toHex('takerAccount', { size: 32 }));
const rfqAccount = privateKeyToAccount(toHex('rfqAccount', { size: 32 }));
const ownerAccount = privateKeyToAccount(toHex('ownerAccount', { size: 32 }));
const treasuryAccount = privateKeyToAccount(toHex('treasuryAccount', { size: 32 }));

describe('RFQSettlement test', function () {
  let publicClient: PublicClient;
  let testClient: TestClient;
  let walletClient: WalletClient;
  let rfqSettlement: Address;
  let chainId: SupportedChainId;
  before(async function () {
    publicClient = await viem.getPublicClient();
    testClient = await viem.getTestClient({ mode: 'hardhat' });
    walletClient = await viem.getWalletClient(zeroAddress);
    chainId = await publicClient.getChainId().then((e) => {
      if (!isSupportedChainId(e)) {
        throw new Error(`Chain ${e} is not supported`);
      }
      return e;
    });

    await testClient.setBalance({ address: rfqAccount.address, value: BigInt(10e18) });
    await testClient.setBalance({ address: unsigned.address, value: BigInt(10e18) });
    await testClient.setBalance({ address: ownerAccount.address, value: BigInt(10e18) });
    rfqSettlement = await deployRfqSettlement(
      publicClient,
      walletClient,
      rfqAccount,
      ownerAccount.address,
      treasuryAccount.address,
    );
    await Promise.all([
      setMockBankPrecompile(testClient),
      setMockErc20(testClient, baseToken),
      setMockErc20(testClient, quoteToken),
    ]);
  });
  it('...should settle valid rfq', async function () {
    const makerSignedSwapIntent = await (async () => {
      const swapIntent = {
        counterparty: zeroAddress,
        inputToken: baseToken,
        outputToken: quoteToken,
        inputAmount: makerBaseTokenAmount,
        outputAmount: makerQuoteTokenAmount,
        unwrap: false,
      } satisfies MakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signMakerSwapIntent(makerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyMakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await setErc20Balance(
      publicClient,
      walletClient,
      testClient,
      makerSignedSwapIntent.signatureParams.signer,
      makerSignedSwapIntent.makerSwapIntent.inputToken,
      makerSignedSwapIntent.makerSwapIntent.inputAmount,
    );
    const takerSignedSwapIntent = await (async () => {
      const swapIntent = {
        inputToken: quoteToken,
        outputToken: baseToken,
        inputAmount: takerQuoteTokenAmount,
        outputAmount: takerBaseTokenAmount,
        unwrap: false,
        frontendReferral: zeroHash,
      } satisfies TakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signTakerSwapIntent(takerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyTakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await setErc20Balance(
      publicClient,
      walletClient,
      testClient,
      takerSignedSwapIntent.signatureParams.signer,
      takerSignedSwapIntent.takerSwapIntent.inputToken,
      takerSignedSwapIntent.takerSwapIntent.inputAmount,
    );
    const { decodedRfqSettledEventArgs } = await settleRfq(
      publicClient,
      walletClient,
      rfqAccount,
      rfqSettlement,
      makerSignedSwapIntent,
      takerSignedSwapIntent,
      feePips,
    );
    console.log(JSON.stringify(decodedRfqSettledEventArgs, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  });
  it('...should settle valid rfq taker unwrap', async function () {
    const makerSignedSwapIntent = await (async () => {
      const swapIntent = {
        counterparty: zeroAddress,
        inputToken: baseToken,
        outputToken: quoteToken,
        inputAmount: makerBaseTokenAmount,
        outputAmount: makerQuoteTokenAmount,
        unwrap: false,
      } satisfies MakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signMakerSwapIntent(makerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyMakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await setErc20Balance(
      publicClient,
      walletClient,
      testClient,
      makerSignedSwapIntent.signatureParams.signer,
      makerSignedSwapIntent.makerSwapIntent.inputToken,
      makerSignedSwapIntent.makerSwapIntent.inputAmount,
    );
    const takerSignedSwapIntent = await (async () => {
      const swapIntent = {
        inputToken: quoteToken,
        outputToken: baseToken,
        inputAmount: takerQuoteTokenAmount,
        outputAmount: takerBaseTokenAmount,
        unwrap: true,
        frontendReferral: zeroHash,
      } satisfies TakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signTakerSwapIntent(takerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyTakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await setErc20Balance(
      publicClient,
      walletClient,
      testClient,
      takerSignedSwapIntent.signatureParams.signer,
      takerSignedSwapIntent.takerSwapIntent.inputToken,
      takerSignedSwapIntent.takerSwapIntent.inputAmount,
    );
    await settleRfq(
      publicClient,
      walletClient,
      rfqAccount,
      rfqSettlement,
      makerSignedSwapIntent,
      takerSignedSwapIntent,
      feePips,
    );
  });
  it('...should update fee treasury', async function () {
    await walletClient.writeContract({
      chain: null,
      account: ownerAccount,
      abi: rfqSettlementAbi,
      address: rfqSettlement,
      functionName: 'setFeeTreasury',
      args: [ownerAccount.address],
    });
  });
  it('...should withdraw token donations', async function () {
    {
      const donationAmount = 1n;
      const donationToken = quoteToken;
      await setErc20Balance(
        publicClient,
        walletClient,
        testClient,
        rfqSettlement,
        donationToken,
        donationAmount,
      );
      await walletClient.writeContract({
        chain: null,
        account: unsigned,
        abi: rfqSettlementAbi,
        address: rfqSettlement,
        functionName: 'rescueTokens',
        args: [
          donationToken,
          unsigned.address,
        ],
      });
    }
    {
      const donationAmount = 1n;
      const donationToken = zeroAddress;
      await testClient.setBalance({
        address: rfqSettlement,
        value: donationAmount,
      });
      await walletClient.writeContract({
        chain: null,
        account: unsigned,
        abi: rfqSettlementAbi,
        address: rfqSettlement,
        functionName: 'rescueTokens',
        args: [
          donationToken,
          unsigned.address,
        ],
      });
    }
  });
  it('...should revert on bricked value recipient', async function () {
    {
      const donationAmount = 1n;
      const donationToken = zeroAddress;
      await testClient.setBalance({
        address: rfqSettlement,
        value: donationAmount,
      });
      await revertWithCustomError(walletClient.writeContract({
        chain: null,
        account: unsigned,
        abi: rfqSettlementAbi,
        address: rfqSettlement,
        functionName: 'rescueTokens',
        args: [
          donationToken,
          quoteToken,
        ],
      }),
        rfqSettlementAbi,
        'ValueTransferFailed',
      );
    }
  });
  it('...should revert on invalid signature', async function () {
    const makerSignedSwapIntent = await (async () => {
      const swapIntent = {
        counterparty: zeroAddress,
        inputToken: baseToken,
        outputToken: quoteToken,
        inputAmount: makerBaseTokenAmount,
        outputAmount: makerQuoteTokenAmount,
        unwrap: false,
      } satisfies MakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signMakerSwapIntent(makerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyMakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await setErc20Balance(
      publicClient,
      walletClient,
      testClient,
      makerSignedSwapIntent.signatureParams.signer,
      makerSignedSwapIntent.makerSwapIntent.inputToken,
      makerSignedSwapIntent.makerSwapIntent.inputAmount,
    );
    const takerSignedSwapIntent = await (async () => {
      const swapIntent = {
        inputToken: quoteToken,
        outputToken: baseToken,
        inputAmount: takerQuoteTokenAmount,
        outputAmount: takerBaseTokenAmount,
        unwrap: false,
        frontendReferral: zeroHash,
      } satisfies TakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signTakerSwapIntent(takerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyTakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await setErc20Balance(
      publicClient,
      walletClient,
      testClient,
      takerSignedSwapIntent.signatureParams.signer,
      takerSignedSwapIntent.takerSwapIntent.inputToken,
      takerSignedSwapIntent.takerSwapIntent.inputAmount,
    );
    await revertWithCustomError(
      settleRfq(
        publicClient,
        walletClient,
        rfqAccount,
        rfqSettlement,
        {
          ...makerSignedSwapIntent,
          makerSwapIntent: {
            ...makerSignedSwapIntent.makerSwapIntent,
            unwrap: !makerSignedSwapIntent.makerSwapIntent.unwrap,
          },
        },
        takerSignedSwapIntent,
        feePips,
      ),
      iPermit2Abi,
      'InvalidSigner',
    );
  });
  it('...should revert on invalid counterparty', async function () {
    const makerSignedSwapIntent = await (async () => {
      const swapIntent = {
        counterparty: toHex(1, { size: 20 }),
        inputToken: baseToken,
        outputToken: quoteToken,
        inputAmount: makerBaseTokenAmount,
        outputAmount: makerQuoteTokenAmount,
        unwrap: false,
      } satisfies MakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signMakerSwapIntent(makerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyMakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    const takerSignedSwapIntent = await (async () => {
      const swapIntent = {
        inputToken: quoteToken,
        outputToken: baseToken,
        inputAmount: takerQuoteTokenAmount,
        outputAmount: takerBaseTokenAmount,
        unwrap: false,
        frontendReferral: zeroHash,
      } satisfies TakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signTakerSwapIntent(takerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyTakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await revertWithCustomError(
      settleRfq(
        publicClient,
        walletClient,
        rfqAccount,
        rfqSettlement,
        makerSignedSwapIntent,
        takerSignedSwapIntent,
        feePips,
      ),
      rfqSettlementAbi,
      'RFQInvalidCounterparty',
    );
  });
  it('...should revert on invalid token', async function () {
    const makerSignedSwapIntent = await (async () => {
      const swapIntent = {
        counterparty: zeroAddress,
        inputToken: baseToken,
        outputToken: quoteToken,
        inputAmount: makerBaseTokenAmount,
        outputAmount: makerQuoteTokenAmount,
        unwrap: false,
      } satisfies MakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signMakerSwapIntent(makerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyMakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    const takerSignedSwapIntent = await (async () => {
      const swapIntent = {
        inputToken: quoteToken,
        outputToken: quoteToken,
        inputAmount: takerQuoteTokenAmount,
        outputAmount: takerBaseTokenAmount,
        unwrap: false,
        frontendReferral: zeroHash,
      } satisfies TakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signTakerSwapIntent(takerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyTakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await revertWithCustomError(
      settleRfq(
        publicClient,
        walletClient,
        rfqAccount,
        rfqSettlement,
        makerSignedSwapIntent,
        takerSignedSwapIntent,
        feePips,
      ),
      rfqSettlementAbi,
      'RFQInvalidToken',
    );
  });
  it('...should revert on invalid amount', async function () {
    const makerSignedSwapIntent = await (async () => {
      const swapIntent = {
        counterparty: zeroAddress,
        inputToken: baseToken,
        outputToken: quoteToken,
        inputAmount: makerBaseTokenAmount,
        outputAmount: makerQuoteTokenAmount,
        unwrap: false,
      } satisfies MakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signMakerSwapIntent(makerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyMakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    const takerSignedSwapIntent = await (async () => {
      const swapIntent = {
        inputToken: quoteToken,
        outputToken: baseToken,
        inputAmount: takerQuoteTokenAmount,
        outputAmount: takerBaseTokenAmount + 1n,
        unwrap: false,
        frontendReferral: zeroHash,
      } satisfies TakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signTakerSwapIntent(takerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyTakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await revertWithCustomError(
      settleRfq(
        publicClient,
        walletClient,
        rfqAccount,
        rfqSettlement,
        makerSignedSwapIntent,
        takerSignedSwapIntent,
        feePips,
      ),
      rfqSettlementAbi,
      'RFQInvalidAmount',
    );
  });
  it('...should revert on invalid fee percentage', async function () {
    const makerSignedSwapIntent = await (async () => {
      const swapIntent = {
        counterparty: zeroAddress,
        inputToken: baseToken,
        outputToken: quoteToken,
        inputAmount: makerBaseTokenAmount,
        outputAmount: makerQuoteTokenAmount,
        unwrap: false,
      } satisfies MakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signMakerSwapIntent(makerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyMakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    const takerSignedSwapIntent = await (async () => {
      const swapIntent = {
        inputToken: quoteToken,
        outputToken: baseToken,
        inputAmount: takerQuoteTokenAmount,
        outputAmount: takerBaseTokenAmount,
        unwrap: false,
        frontendReferral: zeroHash,
      } satisfies TakerSwapIntent;
      const deadline = maxUint256;
      const nonce = BigInt(`0x${randomBytes(32).toString('hex')}`);
      const signedSwapIntent = await signTakerSwapIntent(takerAccount, deadline, nonce, swapIntent, rfqSettlement, chainId);
      const valid = await verifyTakerSignedSwapIntent(signedSwapIntent, rfqSettlement, chainId);
      if (!valid) {
        throw new Error('Invalid signed swap intent');
      }
      return signedSwapIntent;
    })();
    await revertWithCustomError(
      settleRfq(
        publicClient,
        walletClient,
        rfqAccount,
        rfqSettlement,
        makerSignedSwapIntent,
        takerSignedSwapIntent,
        0n,
      ),
      rfqSettlementAbi,
      'RFQInvalidFeePips',
    );
  });
  it('...should revert on value donation', async function () {
    await revertWithCustomError(
      walletClient.sendTransaction({
        chain: null,
        account: takerAccount,
        to: rfqSettlement,
        value: 1n,
      }),
      rfqSettlementAbi,
      'NoValueDonations',
    );
  });
  it('...should revert on invalid fee treasury set', async function () {
    await revertWithCustomError(
      walletClient.writeContract({
        chain: null,
        account: ownerAccount,
        abi: rfqSettlementAbi,
        address: rfqSettlement,
        functionName: 'setFeeTreasury',
        args: [zeroAddress],
      }),
      rfqSettlementAbi,
      'InvalidAddress',
    );
  });
});

/*
 * @dev hardhat viem assertion plugin replacement
 * Type-safe
 * Compatible with pure viem
 * Able to decode library function and delegatecall errors
 */
async function revertWithCustomError<
  TAbi extends Abi,
  TName extends ContractErrorName<TAbi>
>(
  promise: Promise<unknown>,
  abi: TAbi,
  errorName: TName,
) {
  try {
    await promise;
  } catch (e) {
    if (!(e instanceof BaseError)) {
      throw new Error('Unexpected error', { cause: e });
    }
    type ContractError = {
      data: Hex,
    };
    function isContractError(err: unknown): err is ContractError {
      return (
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        isHex(err.data)
      );
    }
    const contractError = e.walk(isContractError);
    if (!isContractError(contractError)) {
      throw new Error('Unexpected error', { cause: e });
    }
    const decoded = decodeErrorResult({
      abi,
      data: contractError.data,
    });
    assert.equal(errorName, decoded.errorName);
    return;
  }
  throw new Error('Expected contract error but transaction succeeded');
}
