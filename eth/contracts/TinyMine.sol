// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "./Perlin.sol";
import "./Types.sol";
import "./TileContract.sol";
import "./TinyFarm.sol";

contract TinyIron is TinyERC20 {
    address mineshaft;

    constructor(address _mineshaft, TinyWorld _connnectedWorld)
        TinyERC20("TinyIron", "TIRN", _connnectedWorld)
    {
        mineshaft = _mineshaft;
    }

    modifier onlyMineshaft() {
        require(msg.sender == mineshaft, "Caller is not a mineshaft tile");
        _;
    }

    function mint(address miner) public override onlyMineshaft {
        _mint(miner, 10**18);
    }
}

contract TinyMine is ITileContract {
    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"⛰️";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return "Tiny Mine";
    }

    function tileDescription(Coords memory coords)
        external
        view
        virtual
        override
        returns (string memory)
    {
        return "This is a tiny mine";
    }

    function tileABI(Coords memory coords) external view override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/1755e45240ae85f393ea0ef9d3ce2f6c0bdcfc8e/TinyMine.json";
    }

    uint256 constant WIDTH = 5;
    uint256 constant HEIGHT = 5;
    enum MazeTileType {
        UNKNOWN,
        RESOURCE,
        EMPTY,
        WALL
    }

    mapping(address => mapping(uint256 => mapping(uint256 => uint32))) private currentSeeder;
    mapping(address => mapping(uint32 => Coords)) private currentLocation;
    mapping(address => mapping(uint32 => mapping(uint256 => mapping(uint256 => MazeTileType))))
        private currentCachedTiles;
    mapping(address => TinyERC20) private currentResource;
    TinyWorld connectedWorld;
    TinyERC20 iron;

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getProcGenMazeValue(
        uint256 x,
        uint256 y,
        uint32 seeder
    ) internal view returns (MazeTileType) {
        uint256 perlin = Perlin.computePerlin(uint32(x), uint32(y), uint32(seeder), uint32(4));
        return
            perlin < 20
                ? (perlin < 5 ? MazeTileType.RESOURCE : MazeTileType.EMPTY)
                : MazeTileType.WALL;
    }

    function getMazeValue(
        uint256 x,
        uint256 y,
        uint32 seeder
    ) internal returns (MazeTileType) {
        if (currentCachedTiles[msg.sender][seeder][x][y] == MazeTileType.UNKNOWN) {
            currentCachedTiles[msg.sender][seeder][x][y] = getProcGenMazeValue(x, y, seeder);
        }
        return currentCachedTiles[msg.sender][seeder][x][y];
    }

    function viewMazeValue(
        uint256 x,
        uint256 y,
        uint32 seeder
    ) internal view returns (MazeTileType) {
        if (currentCachedTiles[msg.sender][seeder][x][y] == MazeTileType.UNKNOWN) {
            return getProcGenMazeValue(x, y, seeder);
        } else return currentCachedTiles[msg.sender][seeder][x][y];
    }

    function move(
        Coords memory selfCoords,
        int256 deltaX,
        int256 deltaY
    ) internal {
        uint32 seeder = currentSeeder[msg.sender][selfCoords.x][selfCoords.y];
        Coords memory loc = currentLocation[msg.sender][seeder];

        require(
            int256(loc.x) + deltaX >= 0 && int256(loc.x) + deltaX < int256(HEIGHT),
            "Invalid x"
        );
        require(int256(loc.y) + deltaY >= 0 && int256(loc.y) + deltaY < int256(WIDTH), "Invalid y");
        Coords memory newLoc = Coords(
            uint256(int256(loc.x) + deltaX),
            uint256(int256(loc.y) + deltaY)
        );

        if (getMazeValue(newLoc.x, newLoc.y, seeder) == MazeTileType.WALL) {
            currentCachedTiles[msg.sender][seeder][newLoc.x][newLoc.y] = MazeTileType.EMPTY;
        } else {
            if (getMazeValue(newLoc.x, newLoc.y, seeder) == MazeTileType.RESOURCE) {
                currentResource[msg.sender].mint(msg.sender);
                currentCachedTiles[msg.sender][seeder][newLoc.x][newLoc.y] = MazeTileType.EMPTY;
            }
            currentLocation[msg.sender][seeder] = newLoc;
        }
    }

    function moveUp(Coords memory selfCoords) public {
        move(selfCoords, 0, -1);
    }

    function moveDown(Coords memory selfCoords) public {
        move(selfCoords, 0, 1);
    }

    function moveLeft(Coords memory selfCoords) public {
        move(selfCoords, -1, 0);
    }

    function moveRight(Coords memory selfCoords) public {
        move(selfCoords, 1, 0);
    }

    function rollMine(Coords memory selfCoords) public {
        uint256 seeder = random(
            string(abi.encodePacked(selfCoords.x, selfCoords.y, block.timestamp, msg.sender))
        );
        currentSeeder[msg.sender][selfCoords.x][selfCoords.y] = uint32(seeder % uint256(10**8));
        currentResource[msg.sender] = iron;
    }

    function mine(Coords memory selfCoords) public view returns (string[HEIGHT] memory) {
        uint32 seeder = currentSeeder[msg.sender][selfCoords.x][selfCoords.y];

        string[HEIGHT] memory prettyMaze;
        for (uint256 x = 0; x < HEIGHT; x++) {
            string memory row = "";
            for (uint256 y = 0; y < WIDTH; y++) {
                MazeTileType mazeVal = viewMazeValue(x, y, seeder);
                if (
                    currentLocation[msg.sender][seeder].x == x &&
                    currentLocation[msg.sender][seeder].y == y
                ) {
                    row = string(abi.encodePacked(row, "P"));
                } else if (mazeVal == MazeTileType.EMPTY) {
                    row = string(abi.encodePacked(row, "."));
                } else if (mazeVal == MazeTileType.RESOURCE) {
                    row = string(abi.encodePacked(row, "I"));
                } else {
                    row = string(abi.encodePacked(row, "#"));
                }
            }
            prettyMaze[x] = row;
        }
        return prettyMaze;
    }

    constructor(TinyWorld _connectedWorld) {
        connectedWorld = _connectedWorld;
        iron = new TinyIron(address(this), connectedWorld);
    }
}
