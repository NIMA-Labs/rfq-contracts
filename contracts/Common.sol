// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import {
    PermitTransferFrom,
    SignatureTransferDetails
} from "./interfaces/IPermit2.sol";

struct SignatureParams {
    address signer;
    uint256 nonce;
    uint256 deadline;
    bytes signature;
}
struct MakerSwapIntent {
    address counterparty;
    address inputToken;
    address outputToken;
    uint256 inputAmount;
    uint256 outputAmount;
    bool unwrap;
}
struct TakerSwapIntent {
    address inputToken;
    address outputToken;
    uint256 inputAmount;
    uint256 outputAmount;
    bool unwrap;
    bytes32 frontendReferral;
}
struct MakerSignedSwapIntent {
    SignatureParams signatureParams;
    MakerSwapIntent makerSwapIntent;
}
struct TakerSignedSwapIntent {
    SignatureParams signatureParams;
    TakerSwapIntent takerSwapIntent;
}
struct RFQParams {
    MakerSignedSwapIntent makerSignedSwapIntent;
    TakerSignedSwapIntent takerSignedSwapIntent;
    uint256 feePips;
}
struct PermitData {
    address signer;
    bytes32 witness;
    bytes signature;
    PermitTransferFrom permit;
    SignatureTransferDetails transferDetails;
}
