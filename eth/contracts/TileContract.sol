// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "hardhat/console.sol";

interface ITileContract {
    function emoji() external view returns (string memory);

    function name() external view returns (string memory);

    function description() external view returns (string memory);

    function extendedAbi() external view returns (string memory);
}

contract StubTileContract is ITileContract {
    function emoji() external view override returns (string memory) {
        return unicode"🌃";
    }

    function name() external view override returns (string memory) {
        return "Test Tile";
    }

    function description() external view override returns (string memory) {
        return "This is a test tile";
    }

    function extendedAbi() external view virtual override returns (string memory) {
        return "ipfs";
    }
}

contract TestTileContract is StubTileContract {
    string world = "hello";
    struct Coords {
        uint256 x;
        uint256 y;
    }

    function extendedAbi() external pure override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/c1bf5abd104adc98e50c62351c2ca668/raw/713c878f9fa85cf49d0c79429dc547df06c7ece4/test_abi.json";
    }

    function test(string memory inp) public {
        world = inp;
    }

    function logger() public view returns (string memory, Coords memory) {
        console.log("world:", world);
        return (world, Coords(1, 2));
    }
}
