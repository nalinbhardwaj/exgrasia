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
    function emoji() external pure override returns (string memory) {
        return unicode"🌃";
    }

    function name() external pure override returns (string memory) {
        return "Test Tile";
    }

    function description() external pure override returns (string memory) {
        return "This is a test tile";
    }

    function extendedAbi() external pure virtual override returns (string memory) {
        return "ipfs";
    }
}

contract TestTileContract is StubTileContract {
    string world = "hello";

    function extendedAbi() external pure override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/c1bf5abd104adc98e50c62351c2ca668/raw/6846f47b703a40e429c0f1d3bf26d28007a355b4/test_abi.json";
    }

    function test(string memory inp) public {
        world = inp;
    }

    function logger() public view returns (string memory) {
        console.log("world:", world);
        return world;
    }
}
