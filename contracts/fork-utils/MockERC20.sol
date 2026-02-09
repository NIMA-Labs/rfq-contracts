// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {MockBankPrecompile} from "./MockBankPrecompile.sol";

contract MockERC20 {
    MockBankPrecompile public constant bankPrecompile = MockBankPrecompile(0x0000000000000000000000000000000000001001);
    function balanceOf(address acc) external view returns (uint256) {
        return bankPrecompile.balance(acc, address(this));
    }
    function transfer(address to, uint256 amount) external returns (bool) {
        return bankPrecompile.send(msg.sender, to, address(this), amount);
    }
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        return bankPrecompile.send(from, to, address(this), amount);
    }
}
