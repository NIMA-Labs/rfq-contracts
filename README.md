# RFQ Settlement

This package contains contracts, tests, sdk and utilities for the RFQ settlement contracts.

## Setup and tests

1. `corepack enable`

2. `yarn install`

3. `yarn compile`

4. `yarn test`

5. `yarn coverage`

6. `yarn deploy`

## SDK

This package exports contract types, signing and verification utils, contract interaction helpers, deploy scripts.

### Usage

```typescript
// Main SDK — signing, verification, settlement
import {
  signMakerSwapIntent,
  signTakerSwapIntent,
  formatMakerTypedDataParams,
  formatTakerTypedDataParams,
  verifyMakerSignedSwapIntent,
  verifyTakerSignedSwapIntent,
  settleRfq,
  deployRfqSettlement,
  CHAIN_CONSTANTS,
} from 'rfq-contracts'

// ABI-only import
import { rfqSettlementAbi, iPermit2Abi } from 'rfq-contracts/abi'
```

### Exported Types

`MakerSwapIntent`, `TakerSwapIntent`, `MakerSignedSwapIntent`, `TakerSignedSwapIntent`, `RFQParams`, `SignatureParams`, `PermitTransferFrom`, `SupportedChainId`, `DecodedRfqSettledEventArgs`
