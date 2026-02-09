// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {MockBankPrecompile, SetBalanceParams} from "./MockBankPrecompile.sol";
import {MockERC20} from "./MockERC20.sol";
import {IWETH9} from "../interfaces/IWETH9.sol";

contract MockWETH9 is IWETH9, MockERC20 {
    function deposit() external payable {
        SetBalanceParams[] memory setBalanceParams = new SetBalanceParams[](1);
        setBalanceParams[0] = SetBalanceParams(
            msg.sender,
            address(this),
            this.balanceOf(msg.sender) + msg.value
        );
        bankPrecompile.setBalances(setBalanceParams);
    }
    function withdraw(uint256 amount) external {
        SetBalanceParams[] memory setBalanceParams = new SetBalanceParams[](1);
        setBalanceParams[0] = SetBalanceParams(
            msg.sender,
            address(this),
            this.balanceOf(msg.sender) - amount
        );
        bankPrecompile.setBalances(setBalanceParams);
        payable(msg.sender).transfer(amount);
    }
}
