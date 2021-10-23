// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./TinyWorldStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract TinyWorld is OwnableUpgradeable, TinyWorldStorage {
    event TileUpdated(uint256 x, uint256 y, TileType tileType);

    function initialize(
        uint256 _seed,
        uint256 _worldWidth,
        uint256 _worldScale
    ) public initializer {
        __Ownable_init();
        seed = _seed;
        worldWidth = _worldWidth;
        worldScale = _worldScale;
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
        TileType tileType = TileType(publicSignals[3]);

        require(x < worldWidth);
        require(y < worldWidth);
        require(claimedSeed == seed);

        Tile memory tile = Tile({
            x: x,
            y: y,
            originalTileType: tileType,
            currentTileType: tileType
        });
        cachedTiles[x][y] = tile;
        touchedTiles.push(tile);
    }
}
