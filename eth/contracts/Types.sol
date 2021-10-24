// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

enum TileType {UNKNOWN, WATER, SAND, TREE, STUMP, CHEST, FARM, WINDMILL, GRASS, SNOW, STONE, ICE}

struct Tile {
    Coords coords;
    uint256[2] perlin;
    uint256 raritySeed;
    TileType currentTileType;
}

struct Coords {
    uint256 x;
    uint256 y;
}
