# RFQ Settlement

This package contains contracts, tests, sdk and utilities for the RFQ settlement contracts.

## Setup and tests

If `$pwd` is this package you can drop `workspace rfq-contracts` from the commands below.

1. `corepack enable`

2. `yarn workspace rfq-contracts install`

3. `yarn workspace rfq-contracts compile`

4. `yarn workspace rfq-contracts test`

5. `yarn workspace rfq-contracts coverage`

6. `yarn workspace rfq-contracts deploy`

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
