// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Types.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface ITileContract {
    function tileEmoji(Coords memory coords) external view returns (string memory);

    function tileName(Coords memory coords) external view returns (string memory);

    function tileDescription(Coords memory coords) external view returns (string memory);

    function tileABI(Coords memory coords) external view returns (string memory);
}

contract StubTileContract is ITileContract {
    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"🌃";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return "Test Tile";
    }

    function tileDescription(Coords memory coords)
        external
        view
        virtual
        override
        returns (string memory)
    {
        return "This is a test tile";
    }

    function tileABI(Coords memory coords) external view virtual override returns (string memory) {
        return "ipfs";
    }
}

contract TestTileContract is StubTileContract {
    string world = "hello";
    uint256 a = 5;
    bytes32 b = "0x12345678";
    bytes c = "0x12345678";
    address d = 0xF05b5f04B7a77Ca549C0dE06beaF257f40C66FDB;

    function tileDescription(Coords memory coords)
        external
        pure
        virtual
        override
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "this is a test tile on x:",
                    Strings.toString(coords.x),
                    " y:",
                    Strings.toString(coords.y)
                )
            );
    }

    function tileABI(Coords memory coords) external pure override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/d9be0db4ac8c292f3430923c572e7e4e8382975d/TestTileContract.json";
    }

    function test(string memory inp) public {
        world = inp;
    }

    function logger() public view returns (string memory, Coords memory) {
        console.log("world:", world);
        return (world, Coords(1, 2));
    }

    function test_a(uint256 inp) public {
        a = inp;
    }

    function test_b(bytes32 inp) public {
        b = inp;
    }

    function test_c(bytes memory inp) public {
        c = inp;
    }

    function test_d(address inp) public {
        d = inp;
    }

    function logger_a() public view returns (uint256) {
        console.log("a:", a);
        return a;
    }

    function logger_b() public view returns (bytes32) {
        return b;
    }

    function logger_c() public view returns (bytes memory) {
        return c;
    }

    function logger_d() public view returns (address) {
        console.log("d:", d);
        return d;
    }
}
