// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./Types.sol";

contract TinyWorldStorage {
    uint256 public seed;
    uint256 public worldWidth;
    mapping(uint256 => mapping(uint256 => TileType)) cachedTiles;

    function getCachedTile(uint256 x, uint256 y) public view returns (TileType) {
        return cachedTiles[x][y];
    }
}
