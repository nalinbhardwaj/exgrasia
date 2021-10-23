// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./TinyWorldStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";
import "./ProveTileVerifier.sol";

contract TinyWorld is OwnableUpgradeable, TinyWorldStorage {
    event TileUpdated(uint256 x, uint256 y, TileType tileType);

    function perlinToTileType(uint256 perlin, bool isRare) private pure returns (TileType) {
        if (perlin > 18 && isRare) {
            return TileType.TREE;
        } else if (perlin > 15) {
            return TileType.LAND;
        } else if (perlin > 13) {
            return TileType.BEACH;
        } else {
            return TileType.WATER;
        }
    }

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
        uint256[8] memory publicSignals
    ) public {
        require(Verifier.verifyMainProof(a, b, c, publicSignals), "Failed ZK check");

        uint256 perlinBase = publicSignals[0];
        uint256 isRare = publicSignals[1];
        uint256 x = publicSignals[2];
        uint256 y = publicSignals[3];
        uint256 claimedSeed = publicSignals[4];
        uint256 claimedScale = publicSignals[5];
        uint256 claimedWidth = publicSignals[6];
        uint256 claimedRarityThreshold = publicSignals[7];

        require(x < worldWidth);
        require(y < worldWidth);
        require(claimedScale == worldScale);
        require(claimedSeed == seed);
        // TODO: check rarityThreshold

        TileType tileType = perlinToTileType(perlinBase, isRare == 1);

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
