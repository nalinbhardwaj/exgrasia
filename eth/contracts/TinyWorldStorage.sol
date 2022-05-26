// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Types.sol";

contract TinyWorldStorage {
    //player masks
    uint256 constant internal IS_PLAYER_INIT = 1;
    uint256 constant internal IS_PLAYER_ADMIN = 1 << 1;
    uint256 constant internal CAN_MOVE_WATER = 1 << 2;
    uint256 constant internal CAN_MOVE_SNOW = 1 << 3;
    uint256 constant internal CAN_PUT_ANYTHING = 1 << 4;

    uint256 public seed;
    uint256 public worldWidth;
    uint256 public worldScale;
    int16[2][16] public vecs;
    int16 public vecsDenom;
    uint16 public perlinMax;
    address[] public playerIds;
    address[] public whitelistedContracts;
    address questMaster;

    mapping(uint256 => mapping(uint256 => Tile)) public cachedTiles;
    Coords[] public touchedCoords;

    mapping(address => Coords) public playerLocation;
    mapping(address => string) public playerEmoji;
    mapping(address => uint256) public playerPerm;
    mapping(string => string) public validPlayerEmoji;

    function getCachedTile(Coords memory coords) public view returns (Tile memory) {
        return cachedTiles[coords.x][coords.y];
    }

    function getTouchedTiles() public view returns (Tile[] memory) {
        Tile[] memory touchedTiles = new Tile[](touchedCoords.length);
        for (uint256 i = 0; i < touchedCoords.length; i++) {
            touchedTiles[i] = getCachedTile(touchedCoords[i]);
        }
        return touchedTiles;
    }

    function getPlayerIds() public view returns (address[] memory) {
        return playerIds;
    }

    function getPlayerInfos()
        public
        view
        returns (
            Coords[] memory,
            string[] memory,
            bool[] memory,
            bool[] memory,
            bool[] memory
        )
    {
        Coords[] memory retLoc = new Coords[](playerIds.length);
        string[] memory retEmoji = new string[](playerIds.length);
        bool[] memory retCanMoveWater = new bool[](playerIds.length);
        bool[] memory retCanMoveSnow = new bool[](playerIds.length);
        bool[] memory retCanPutAnything = new bool[](playerIds.length);
        for (uint256 i = 0; i < playerIds.length; i++) {
            retLoc[i] = playerLocation[playerIds[i]];
            retEmoji[i] = playerEmoji[playerIds[i]];
            retCanMoveWater[i] = (playerPerm[playerIds[i]] & CAN_MOVE_WATER) > 0;
            retCanMoveSnow[i] = (playerPerm[playerIds[i]] & CAN_MOVE_SNOW) > 0;
            retCanPutAnything[i] = (playerPerm[playerIds[i]] & CAN_PUT_ANYTHING) > 0;
        }
        return (retLoc, retEmoji, retCanMoveWater, retCanMoveSnow, retCanPutAnything);
    }

    function getPlayerLocation(address player) public view returns (Coords memory) {
        return playerLocation[player];
    }

    function getContractLocations(address contractAddress) public view returns (Coords[] memory) {
        uint256 locCount = 0;
        for (uint256 i = 0; i < touchedCoords.length; i++) {
            if (getCachedTile(touchedCoords[i]).smartContract == contractAddress) locCount++;
        }
        Coords[] memory ret = new Coords[](locCount);
        uint256 locIndex = 0;
        for (uint256 i = 0; i < touchedCoords.length; i++) {
            if (getCachedTile(touchedCoords[i]).smartContract == contractAddress) {
                ret[locIndex] = touchedCoords[i];
                locIndex++;
            }
        }
        return ret;
    }

    function isPlayerInit(address player) public view returns(bool){
        return (playerPerm[player] & IS_PLAYER_INIT) > 0;
    }

    function isAdmin(address player) public view returns(bool){
        return (playerPerm[player] & IS_PLAYER_ADMIN) > 0;
    }

    function canMoveWater(address player) external view returns(bool) {
        return (playerPerm[player] & CAN_MOVE_WATER) > 0;
    }

    function canMoveSnow(address player) external view returns(bool) {
        return (playerPerm[player] & CAN_MOVE_SNOW) > 0;
    }

    function canPutAnything(address player) external view returns(bool) {
        return (playerPerm[player] & CAN_PUT_ANYTHING) > 0;
    }
}
