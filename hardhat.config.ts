import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import { defineConfig } from "hardhat/config";

const RPC_URL = 'https://evm-rpc.sei-apis.com';

export default defineConfig({
  plugins: [
    hardhatViem,
    hardhatToolboxViemPlugin,
  ],
  solidity: {
    compilers: [{
      version: '0.8.28',
      settings: {
        viaIR: false,
        evmVersion: 'cancun',
        optimizer: {
          enabled: true,
          runs: 99999
        }
      },
    }],
  },
  networks: {
    hardhat: {
      type: 'edr-simulated',
      forking: {
        url: RPC_URL,
      },
      chainId: 1329,
    },
  },
});
