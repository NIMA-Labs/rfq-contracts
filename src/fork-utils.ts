import mockBankPrecompileArtifact from '../artifacts/contracts/fork-utils/MockBankPrecompile.sol/MockBankPrecompile.json' with {type: 'json'};
import mockErc20Artifact from '../artifacts/contracts/fork-utils/MockERC20.sol/MockERC20.json' with {type: 'json'};
import mockWeth9Artifact from '../artifacts/contracts/fork-utils/MockWETH9.sol/MockWETH9.json' with {type: 'json'};
import { Address, isAddressEqual, isHex, PublicClient, TestClient, toHex, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mockBankPrecompileAbi } from './abi';

export const WSEI = '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7';
export const MOCK_BANK_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000001001';
export const unsigned = privateKeyToAccount(toHex('unsigned', { size: 32 }));

const mockBankPrecompileBytecode = mockBankPrecompileArtifact.deployedBytecode;
const mockErc20Bytecode = mockErc20Artifact.deployedBytecode;
const mockWeth9Bytecode = mockWeth9Artifact.deployedBytecode;

export async function setMockBankPrecompile(testClient: TestClient) {
  if (!isHex(mockBankPrecompileBytecode)) {
    throw new Error('Invalid MockBankPrecompile bytecode');
  }
  return testClient.setCode({
    address: MOCK_BANK_PRECOMPILE_ADDRESS,
    bytecode: mockBankPrecompileBytecode,
  });
}
export async function setMockErc20(testClient: TestClient, address: Address) {
  if (address.toLowerCase() == WSEI.toLowerCase()) {
    if (!isHex(mockWeth9Bytecode)) {
      throw new Error('Invalid MockWETH9 bytecode');
    }
    return testClient.setCode({
      address,
      bytecode: mockWeth9Bytecode,
    });
  }
  if (!isHex(mockErc20Bytecode)) {
    throw new Error('Invalid MockErc20 bytecode');
  }
  return testClient.setCode({
    address,
    bytecode: mockErc20Bytecode,
  });
}
export async function setErc20Balance(publicClient: PublicClient, walletClient: WalletClient, testClient: TestClient, acc: Address, token: Address, balance: bigint) {
  if (isAddressEqual(token, WSEI)) {
    const prevWseiDeposit = await publicClient.getBalance({ address: WSEI });
    await testClient.setBalance({
      address: WSEI,
      value: prevWseiDeposit + balance,
    });
  }
  return walletClient.writeContract({
    chain: null,
    address: MOCK_BANK_PRECOMPILE_ADDRESS,
    account: unsigned,
    abi: mockBankPrecompileAbi,
    functionName: 'setBalances',
    args: [[{
      acc,
      token,
      balance,
    }]],
    gas: 10_000_000n,
  });
}
