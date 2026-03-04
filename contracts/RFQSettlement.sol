// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    SignatureTransferDetails,
    TokenPermissions,
    PermitTransferFrom,
    IPermit2
} from "./interfaces/IPermit2.sol";
import {IWETH9} from "./interfaces/IWETH9.sol";
import {
    MAKER_WITNESS_TYPE_STRING,
    MAKER_WITNESS_TYPEHASH,
    TAKER_WITNESS_TYPE_STRING,
    TAKER_WITNESS_TYPEHASH,
    PIPS,
    MAX_FEE_PIPS
} from "./Constants.sol";
import {
    PermitData,
    TakerSwapIntent,
    MakerSwapIntent,
    MakerSignedSwapIntent,
    TakerSignedSwapIntent,
    RFQParams
} from "./Common.sol";

contract RFQSettlement is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NoValueDonations();
    error InvalidAddress();
    error RFQInvalidCounterparty();
    error RFQInvalidToken();
    error RFQInvalidAmount();
    error RFQInvalidFeePips();

    event RFQSettled(bytes32 indexed frontendReferral, address feeToken, uint256 feeAmount, RFQParams rfqParams);

    IPermit2 public immutable permit2;
    IWETH9 public immutable weth9;
    address public feeTreasury;

    constructor(
        address _permit2,
        address _weth9,
        address _owner,
        address _feeTreasury
    ) Ownable(_validateAddress(_owner)) {
        permit2 = IPermit2(_validateAddress(_permit2));
        weth9 = IWETH9(_validateAddress(_weth9));
        feeTreasury = _validateAddress(_feeTreasury);
    }

    function setFeeTreasury(address _feeTreasury) external onlyOwner {
        feeTreasury = _validateAddress(_feeTreasury);
    }

    function _validateAddress(address _address) internal pure returns (address) {
        if (address(0) == _address) {
            revert InvalidAddress();
        }
        return _address;
    }

    /// @notice withdraw accidental donations
    function rescueTokens(address token, address to) external nonReentrant {
        if (address(0) == token) {
            payable(to).transfer(address(this).balance);
        } else {
            IERC20(token).safeTransfer(to, IERC20(token).balanceOf(address(this)));
        }
    }

    function settleRFQ(RFQParams calldata rfqParams) external nonReentrant {
        MakerSignedSwapIntent calldata makerSignedSwapIntent = rfqParams.makerSignedSwapIntent;
        TakerSignedSwapIntent calldata takerSignedSwapIntent = rfqParams.takerSignedSwapIntent;
        MakerSwapIntent calldata makerSwapIntent = makerSignedSwapIntent.makerSwapIntent;
        TakerSwapIntent calldata takerSwapIntent = takerSignedSwapIntent.takerSwapIntent;
        address maker = makerSignedSwapIntent.signatureParams.signer;
        address taker = takerSignedSwapIntent.signatureParams.signer;
        address quoteToken = takerSwapIntent.inputToken;
        address baseToken = takerSwapIntent.outputToken;
        uint256 feeAmount = takerSwapIntent.inputAmount * rfqParams.feePips / PIPS;
        uint256 quoteAmount = takerSwapIntent.inputAmount - feeAmount;
        uint256 baseAmount = takerSwapIntent.outputAmount;
        _validateAddress(quoteToken);
        _validateAddress(baseToken);
        if (
            !(address(0) == makerSwapIntent.counterparty || makerSwapIntent.counterparty == taker)
        ) {
            revert RFQInvalidCounterparty();
        }
        if (
            makerSwapIntent.inputToken != baseToken ||
            makerSwapIntent.outputToken != quoteToken ||
            quoteToken == baseToken
        ) {
            revert RFQInvalidToken();
        }
        if (
            rfqParams.feePips > MAX_FEE_PIPS ||
            rfqParams.feePips == 0
        ) {
            revert RFQInvalidFeePips();
        }
        if (
            makerSwapIntent.inputAmount != baseAmount ||
            makerSwapIntent.outputAmount != quoteAmount ||
            0 == quoteAmount ||
            0 == baseAmount
        ) {
            revert RFQInvalidAmount();
        }
        _permitWithIntentWitness(_formatMakerPermitData(makerSignedSwapIntent), MAKER_WITNESS_TYPE_STRING);
        _permitWithIntentWitness(_formatTakerPermitData(takerSignedSwapIntent), TAKER_WITNESS_TYPE_STRING);
        _handleOutflow(quoteToken, feeAmount, false, feeTreasury);
        _handleOutflow(quoteToken, quoteAmount, makerSwapIntent.unwrap, maker);
        _handleOutflow(baseToken, baseAmount, takerSwapIntent.unwrap, taker);
        emit RFQSettled(
            takerSwapIntent.frontendReferral,
            quoteToken,
            feeAmount,
            rfqParams
        );
    }

    /// @dev needed for native token unwrap
    receive() external payable {
        if (!_reentrancyGuardEntered()) {
            revert NoValueDonations();
        }
    }

    function _handleOutflow(
        address token,
        uint256 amount,
        bool unwrap,
        address recipient
    ) internal {
        /// @dev fees can amount to 0
        if (amount != 0) {
            if (unwrap && address(weth9) == token) {
                weth9.withdraw(amount);
                payable(recipient).transfer(amount);
            } else {
                IERC20(token).safeTransfer(recipient, amount);
            }
        }
    }

    function _permitWithIntentWitness(PermitData memory permitData, string memory witnessTypeString) internal {
        permit2.permitWitnessTransferFrom(
            permitData.permit,
            permitData.transferDetails,
            permitData.signer,
            permitData.witness,
            witnessTypeString,
            permitData.signature
        );
    }

    function _formatMakerPermitData(MakerSignedSwapIntent memory makerSignedSwapIntent) internal view returns (PermitData memory permitData) {
        permitData.signer = makerSignedSwapIntent.signatureParams.signer;
        permitData.witness = keccak256(
            abi.encode(MAKER_WITNESS_TYPEHASH, makerSignedSwapIntent.makerSwapIntent)
        );
        permitData.signature = makerSignedSwapIntent.signatureParams.signature;
        permitData.permit = PermitTransferFrom({
            permitted: TokenPermissions({
                token: makerSignedSwapIntent.makerSwapIntent.inputToken,
                amount: makerSignedSwapIntent.makerSwapIntent.inputAmount
            }),
            nonce: makerSignedSwapIntent.signatureParams.nonce,
            deadline: makerSignedSwapIntent.signatureParams.deadline
        });
        permitData.transferDetails = SignatureTransferDetails({
            to: address(this),
            requestedAmount: makerSignedSwapIntent.makerSwapIntent.inputAmount
        });
    }

    function _formatTakerPermitData(TakerSignedSwapIntent memory takerSignedSwapIntent) internal view returns (PermitData memory permitData) {
        permitData.signer = takerSignedSwapIntent.signatureParams.signer;
        permitData.witness = keccak256(
            abi.encode(TAKER_WITNESS_TYPEHASH, takerSignedSwapIntent.takerSwapIntent)
        );
        permitData.signature = takerSignedSwapIntent.signatureParams.signature;
        permitData.permit = PermitTransferFrom({
            permitted: TokenPermissions({
                token: takerSignedSwapIntent.takerSwapIntent.inputToken,
                amount: takerSignedSwapIntent.takerSwapIntent.inputAmount
            }),
            nonce: takerSignedSwapIntent.signatureParams.nonce,
            deadline: takerSignedSwapIntent.signatureParams.deadline
        });
        permitData.transferDetails = SignatureTransferDetails({
            to: address(this),
            requestedAmount: takerSignedSwapIntent.takerSwapIntent.inputAmount
        });
    }
}
