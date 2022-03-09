// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "hardhat/console.sol";

interface ITileContract {
    function tileEmoji() external view returns (string memory);

    function tileName() external view returns (string memory);

    function tileDescription() external view returns (string memory);

    function tileABI() external view returns (string memory);
}

contract StubTileContract is ITileContract {
    function tileEmoji() external view override returns (string memory) {
        return unicode"🌃";
    }

    function tileName() external view override returns (string memory) {
        return "Test Tile";
    }

    function tileDescription() external view override returns (string memory) {
        return "This is a test tile";
    }

    function tileABI() external view virtual override returns (string memory) {
        return "ipfs";
    }
}

contract TestTileContract is StubTileContract {
    string world = "hello";
    struct Coords {
        uint256 x;
        uint256 y;
    }

    function tileABI() external pure override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/8c7bd0fdda2bad92511d031f54fb407802f9eb84/TestTileContract.json";
    }

    function test(string memory inp) public {
        world = inp;
    }

    function logger() public view returns (string memory, Coords memory) {
        console.log("world:", world);
        return (world, Coords(1, 2));
    }
}
