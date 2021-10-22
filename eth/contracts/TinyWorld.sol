// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./TinyWorldStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract TinyWorld is OwnableUpgradeable, TinyWorldStorage {
    function initialize(uint256 _seed) public initializer {
        __Ownable_init();
        seed = _seed;
    }

    function proveTile(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory publicSignals
    ) public {
        uint256 x = publicSignals[0];
        uint256 y = publicSignals[1];
        uint256 claimedSeed = publicSignals[2];
        uint256 claimedTileType = publicSignals[3];
        require(claimedSeed == seed);
        cachedTiles[x][y] = TileType(claimedTileType);
    }
}
