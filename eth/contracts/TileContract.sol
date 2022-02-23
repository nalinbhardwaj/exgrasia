// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface ITileContract {
    function emoji() external view returns (string memory);

    function name() external view returns (string memory);

    function description() external view returns (string memory);
}

contract TestTileContract is ITileContract {
    function emoji() external pure override returns (string memory) {
        return unicode"🌃";
    }

    function name() external pure override returns (string memory) {
        return "Test Tile";
    }

    function description() external pure override returns (string memory) {
        return "This is a test tile";
    }
}
