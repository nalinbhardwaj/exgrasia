// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

enum TileType {UNKNOWN, WATER, LAND}
struct Tile {
    uint256 x;
    uint256 y;
    TileType originalTileType;
    TileType currentTileType;
}
