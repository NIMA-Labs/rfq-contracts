import { defineConfig } from '@wagmi/cli'
import { hardhat } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/abi.ts',
  plugins: [
    hardhat({
      project: './',
    }),
  ],
});
