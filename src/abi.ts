//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPermit2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPermit2Abi = [
  { type: 'error', inputs: [], name: 'InvalidSigner' },
  {
    type: 'function',
    inputs: [
      {
        name: 'permit',
        internalType: 'struct PermitTransferFrom',
        type: 'tuple',
        components: [
          {
            name: 'permitted',
            internalType: 'struct TokenPermissions',
            type: 'tuple',
            components: [
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
            ],
          },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'transferDetails',
        internalType: 'struct SignatureTransferDetails',
        type: 'tuple',
        components: [
          { name: 'to', internalType: 'address', type: 'address' },
          { name: 'requestedAmount', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'witness', internalType: 'bytes32', type: 'bytes32' },
      { name: 'witnessTypeString', internalType: 'string', type: 'string' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'permitWitnessTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWETH9
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iweth9Abi = [
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockBankPrecompile
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockBankPrecompileAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'acc', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
    ],
    name: 'balance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'fromAddress', internalType: 'address', type: 'address' },
      { name: 'toAddress', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'send',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'setBalanceParams',
        internalType: 'struct SetBalanceParams[]',
        type: 'tuple[]',
        components: [
          { name: 'acc', internalType: 'address', type: 'address' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'balance', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'setBalances',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockErc20Abi = [
  {
    type: 'function',
    inputs: [{ name: 'acc', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'bankPrecompile',
    outputs: [
      {
        name: '',
        internalType: 'contract MockBankPrecompile',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockWETH9
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockWeth9Abi = [
  {
    type: 'function',
    inputs: [{ name: 'acc', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'bankPrecompile',
    outputs: [
      {
        name: '',
        internalType: 'contract MockBankPrecompile',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RFQSettlement
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const rfqSettlementAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_permit2', internalType: 'address', type: 'address' },
      { name: '_weth9', internalType: 'address', type: 'address' },
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_feeTreasury', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'NoValueDonations' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'RFQInvalidAmount' },
  { type: 'error', inputs: [], name: 'RFQInvalidCounterparty' },
  { type: 'error', inputs: [], name: 'RFQInvalidFeePips' },
  { type: 'error', inputs: [], name: 'RFQInvalidToken' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'ValueTransferFailed' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFeeTreasury',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newFeeTreasury',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'FeeTreasuryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'frontendReferral',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'feeToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'feeAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rfqParams',
        internalType: 'struct RFQParams',
        type: 'tuple',
        components: [
          {
            name: 'makerSignedSwapIntent',
            internalType: 'struct MakerSignedSwapIntent',
            type: 'tuple',
            components: [
              {
                name: 'signatureParams',
                internalType: 'struct SignatureParams',
                type: 'tuple',
                components: [
                  { name: 'signer', internalType: 'address', type: 'address' },
                  { name: 'nonce', internalType: 'uint256', type: 'uint256' },
                  {
                    name: 'deadline',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'signature', internalType: 'bytes', type: 'bytes' },
                ],
              },
              {
                name: 'makerSwapIntent',
                internalType: 'struct MakerSwapIntent',
                type: 'tuple',
                components: [
                  {
                    name: 'counterparty',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'inputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'outputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'inputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'outputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'unwrap', internalType: 'bool', type: 'bool' },
                ],
              },
            ],
          },
          {
            name: 'takerSignedSwapIntent',
            internalType: 'struct TakerSignedSwapIntent',
            type: 'tuple',
            components: [
              {
                name: 'signatureParams',
                internalType: 'struct SignatureParams',
                type: 'tuple',
                components: [
                  { name: 'signer', internalType: 'address', type: 'address' },
                  { name: 'nonce', internalType: 'uint256', type: 'uint256' },
                  {
                    name: 'deadline',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'signature', internalType: 'bytes', type: 'bytes' },
                ],
              },
              {
                name: 'takerSwapIntent',
                internalType: 'struct TakerSwapIntent',
                type: 'tuple',
                components: [
                  {
                    name: 'inputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'outputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'inputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'outputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'unwrap', internalType: 'bool', type: 'bool' },
                  {
                    name: 'frontendReferral',
                    internalType: 'bytes32',
                    type: 'bytes32',
                  },
                ],
              },
            ],
          },
          { name: 'feePips', internalType: 'uint256', type: 'uint256' },
        ],
        indexed: false,
      },
    ],
    name: 'RFQSettled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokensRescued',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeTreasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'permit2',
    outputs: [{ name: '', internalType: 'contract IPermit2', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'rescueTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_feeTreasury', internalType: 'address', type: 'address' },
    ],
    name: 'setFeeTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rfqParams',
        internalType: 'struct RFQParams',
        type: 'tuple',
        components: [
          {
            name: 'makerSignedSwapIntent',
            internalType: 'struct MakerSignedSwapIntent',
            type: 'tuple',
            components: [
              {
                name: 'signatureParams',
                internalType: 'struct SignatureParams',
                type: 'tuple',
                components: [
                  { name: 'signer', internalType: 'address', type: 'address' },
                  { name: 'nonce', internalType: 'uint256', type: 'uint256' },
                  {
                    name: 'deadline',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'signature', internalType: 'bytes', type: 'bytes' },
                ],
              },
              {
                name: 'makerSwapIntent',
                internalType: 'struct MakerSwapIntent',
                type: 'tuple',
                components: [
                  {
                    name: 'counterparty',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'inputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'outputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'inputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'outputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'unwrap', internalType: 'bool', type: 'bool' },
                ],
              },
            ],
          },
          {
            name: 'takerSignedSwapIntent',
            internalType: 'struct TakerSignedSwapIntent',
            type: 'tuple',
            components: [
              {
                name: 'signatureParams',
                internalType: 'struct SignatureParams',
                type: 'tuple',
                components: [
                  { name: 'signer', internalType: 'address', type: 'address' },
                  { name: 'nonce', internalType: 'uint256', type: 'uint256' },
                  {
                    name: 'deadline',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'signature', internalType: 'bytes', type: 'bytes' },
                ],
              },
              {
                name: 'takerSwapIntent',
                internalType: 'struct TakerSwapIntent',
                type: 'tuple',
                components: [
                  {
                    name: 'inputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'outputToken',
                    internalType: 'address',
                    type: 'address',
                  },
                  {
                    name: 'inputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'outputAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  { name: 'unwrap', internalType: 'bool', type: 'bool' },
                  {
                    name: 'frontendReferral',
                    internalType: 'bytes32',
                    type: 'bytes32',
                  },
                ],
              },
            ],
          },
          { name: 'feePips', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'settleRFQ',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'weth9',
    outputs: [{ name: '', internalType: 'contract IWETH9', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const
