// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

struct SetBalanceParams {
    address acc;
    address token;
    uint256 balance;
}

contract MockBankPrecompile {
    mapping(address => mapping(address => uint256)) internal _balances;

    function setBalances(
        SetBalanceParams[] calldata setBalanceParams
    ) external {
        for (uint256 i; i < setBalanceParams.length; i++) {
            SetBalanceParams calldata params = setBalanceParams[i];
            _balances[params.acc][params.token] = params.balance;
        }
    }
    function balance(address acc, address token) external view returns (uint256) {
        return _balances[acc][token];
    }
    function send(
        address fromAddress,
        address toAddress,
        address token,
        uint256 amount
    ) external returns (bool success) {
        _balances[fromAddress][token] -= amount;
        _balances[toAddress][token] += amount;
        return true;
    }
}
