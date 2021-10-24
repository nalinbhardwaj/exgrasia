// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./Types.sol";

contract TinyWorldStorage {
    uint256 public seed;
    uint256 public worldWidth;
    mapping(uint256 => mapping(uint256 => Tile)) public cachedTiles;
    mapping(TileType => mapping(TileType => bool)) public transitions; // Stores tree > stump as 1 (valid transition)
    Coords[] public touchedTiles;
    uint256 public worldScale;
    mapping(address => uint256) public wheatScore;
    mapping(uint256 => mapping(uint256 => uint256)) public lastHarvested;
    mapping(address => uint256) public woodScore;

    function getCachedTile(Coords memory coords) public view returns (Tile memory) {
        return cachedTiles[coords.x][coords.y];
    }

    function getTouchedTiles() public view returns (Coords[] memory) {
        return touchedTiles;
    }
}
