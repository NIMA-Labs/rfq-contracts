// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

/// @dev fee constant
uint256 constant MAX_FEE_PIPS = 1_00_00;

/// @dev precision constants
uint256 constant PIPS = 1_00_00_00;

/// @dev permit constants
string constant MAKER_WITNESS_TYPE_STRING = "MakerSwapIntent witness)MakerSwapIntent(address counterparty,address inputToken,address outputToken,uint256 inputAmount,uint256 outputAmount,bool unwrap)TokenPermissions(address token,uint256 amount)";
bytes32 constant MAKER_WITNESS_TYPEHASH = keccak256("MakerSwapIntent(address counterparty,address inputToken,address outputToken,uint256 inputAmount,uint256 outputAmount,bool unwrap)");

string constant TAKER_WITNESS_TYPE_STRING = "TakerSwapIntent witness)TakerSwapIntent(address inputToken,address outputToken,uint256 inputAmount,uint256 outputAmount,bool unwrap,bytes32 frontendReferral)TokenPermissions(address token,uint256 amount)";
bytes32 constant TAKER_WITNESS_TYPEHASH = keccak256("TakerSwapIntent(address inputToken,address outputToken,uint256 inputAmount,uint256 outputAmount,bool unwrap,bytes32 frontendReferral)");
