// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "./Perlin.sol";
import "./Types.sol";
import "./TileContract.sol";
import "./TinyExtensions.sol";

contract TinyIron is TinyERC20 {
    address mineshaft;

    constructor(address _mineshaft, TinyWorld _connectedWorld)
        TinyERC20("TinyIron", "TIRN", _connectedWorld)
    {
        mineshaft = _mineshaft;
    }

    modifier onlyMineshaft() {
        require(msg.sender == mineshaft, "Caller is not a mineshaft tile");
        _;
    }

    function mint(address miner, uint256 count) public override onlyMineshaft {
        _mint(miner, count * 10**18);
    }
}

contract TinyGold is TinyERC20 {
    address mineshaft;

    constructor(address _mineshaft, TinyWorld _connectedWorld)
        TinyERC20("TinyGold", "TGLD", _connectedWorld)
    {
        mineshaft = _mineshaft;
    }

    modifier onlyMineshaft() {
        require(msg.sender == mineshaft, "Caller is not a mineshaft tile");
        _;
    }

    function mint(address miner, uint256 count) public override onlyMineshaft {
        _mint(miner, count * 10**18);
    }
}

contract TinyDiamond is TinyERC20 {
    address mineshaft;

    constructor(address _mineshaft, TinyWorld _connectedWorld)
        TinyERC20("TinyDiamond", "TDIA", _connectedWorld)
    {
        mineshaft = _mineshaft;
    }

    modifier onlyMineshaft() {
        require(msg.sender == mineshaft, "Caller is not a mineshaft tile");
        _;
    }

    function mint(address miner, uint256 count) public override onlyMineshaft {
        _mint(miner, count * 10**18);
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
        return
            "This is a mine shaft. You can mine precious metals here. To get started, use exploreMine to find a fresh mine. You can then view the map using the mineMap function and move around to the resource cells using the move functions. You can explore other mines when you are done, or select a new resource to mine using selectResource.";
    }

    function tileABI(Coords memory coords) external view override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/ef20a647b07d1796cca88745d0d4bf95/raw/3beec6e4a3a3df3f839d1b651474359d0f0de27a/TinyMine.json";
    }

    modifier closeToMyself(Coords memory selfCoords) {
        require(connectedWorld.playerInited(msg.sender), "Not an exgrasia player");
        Coords memory playerLoc = connectedWorld.getPlayerLocation(msg.sender);
        Coords[4] memory neighbors = [
            Coords(playerLoc.x - 1, playerLoc.y),
            Coords(playerLoc.x + 1, playerLoc.y),
            Coords(playerLoc.x, playerLoc.y - 1),
            Coords(playerLoc.x, playerLoc.y + 1)
        ];
        bool closeToSelf = false;
        for (uint256 i = 0; i < neighbors.length; i++) {
            if (
                connectedWorld.getTile(neighbors[i]).smartContract == address(this) &&
                neighbors[i].x == selfCoords.x &&
                neighbors[i].y == selfCoords.y
            ) {
                closeToSelf = true;
            }
        }
        require(closeToSelf, "You need to be next to the mineshaft to mine");
        _;
    }

    uint256 constant WIDTH = 20;
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
    TinyIron iron;
    TinyGold gold;
    TinyDiamond diamond;

    function getOres()
        public
        view
        returns (
            TinyIron,
            TinyGold,
            TinyDiamond
        )
    {
        return (iron, gold, diamond);
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getResourceRarity(TinyERC20 resource) internal view returns (uint256) {
        if (resource == iron) {
            return 7;
        }
        if (resource == gold) {
            return 10;
        }
        if (resource == diamond) {
            return 15;
        }
        return 0;
    }

    function getProcGenMazeValue(
        uint256 x,
        uint256 y,
        uint32 seeder,
        uint256 resourceRarity
    ) internal view returns (MazeTileType) {
        bool isResource = random(string(abi.encodePacked(x, y, seeder))) % resourceRarity == 0;
        uint256 perlin = Perlin.computePerlin(uint32(x), uint32(y), uint32(seeder), uint32(8));
        return
            isResource
                ? MazeTileType.RESOURCE
                : (perlin > 30 ? MazeTileType.EMPTY : MazeTileType.WALL);
    }

    function getMazeValue(
        uint256 x,
        uint256 y,
        uint32 seeder
    ) internal returns (MazeTileType) {
        if (currentCachedTiles[msg.sender][seeder][x][y] == MazeTileType.UNKNOWN) {
            currentCachedTiles[msg.sender][seeder][x][y] = getProcGenMazeValue(
                x,
                y,
                seeder,
                getResourceRarity(currentResource[msg.sender])
            );
        }
        return currentCachedTiles[msg.sender][seeder][x][y];
    }

    function viewMazeValue(
        uint256 x,
        uint256 y,
        uint32 seeder
    ) internal view returns (MazeTileType) {
        if (currentCachedTiles[msg.sender][seeder][x][y] == MazeTileType.UNKNOWN) {
            return
                getProcGenMazeValue(x, y, seeder, getResourceRarity(currentResource[msg.sender]));
        } else return currentCachedTiles[msg.sender][seeder][x][y];
    }

    function move(
        Coords memory selfCoords,
        int256 deltaX,
        int256 deltaY
    ) internal closeToMyself(selfCoords) {
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
                currentResource[msg.sender].mint(msg.sender, 1);
                currentCachedTiles[msg.sender][seeder][newLoc.x][newLoc.y] = MazeTileType.EMPTY;
            }
            currentLocation[msg.sender][seeder] = newLoc;
        }
    }

    function moveUp(Coords memory selfCoords) public {
        move(selfCoords, -1, 0);
    }

    function moveDown(Coords memory selfCoords) public {
        move(selfCoords, 1, 0);
    }

    function moveLeft(Coords memory selfCoords) public {
        move(selfCoords, 0, -1);
    }

    function moveRight(Coords memory selfCoords) public {
        move(selfCoords, 0, 1);
    }

    function exploreMine(Coords memory selfCoords) public closeToMyself(selfCoords) {
        require(
            connectedWorld.getTile(selfCoords).tileType == TileType.STONE,
            "A mineshaft can only be mined on a stone tile"
        );
        uint256 seeder = random(
            string(abi.encodePacked(selfCoords.x, selfCoords.y, block.timestamp, msg.sender))
        );
        currentSeeder[msg.sender][selfCoords.x][selfCoords.y] = uint32(
            (seeder % uint256(10**8)) + 1
        );
        if (currentResource[msg.sender] == TinyERC20(address(0))) {
            currentResource[msg.sender] = iron;
        }
    }

    function selectResource(Coords memory selfCoords, string memory resource)
        public
        closeToMyself(selfCoords)
    {
        if (keccak256(bytes(resource)) == keccak256(bytes("iron"))) {
            currentResource[msg.sender] = iron;
        } else if (keccak256(bytes(resource)) == keccak256(bytes("gold"))) {
            require(iron.balanceOf(msg.sender) > 10**19, "Don't have enough iron to go deeper");
            currentResource[msg.sender] = gold;
        } else if (keccak256(bytes(resource)) == keccak256(bytes("diamond"))) {
            require(iron.balanceOf(msg.sender) > 10**19, "Don't have enough iron to go deeper");
            require(
                gold.balanceOf(msg.sender) > 15 * 10**18,
                "Don't have enough gold to go deeper"
            );
            currentResource[msg.sender] = diamond;
        } else {
            revert("Invalid resource");
        }
    }

    function mineMap(Coords memory selfCoords) public view returns (string[HEIGHT] memory) {
        require(
            currentSeeder[msg.sender][selfCoords.x][selfCoords.y] != 0,
            "exploreMine before entering"
        );
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
                    if (currentResource[msg.sender] == gold) {
                        row = string(abi.encodePacked(row, "G"));
                    } else if (currentResource[msg.sender] == diamond) {
                        row = string(abi.encodePacked(row, "D"));
                    } else {
                        row = string(abi.encodePacked(row, "I"));
                    }
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
        gold = new TinyGold(address(this), connectedWorld);
        diamond = new TinyDiamond(address(this), connectedWorld);
    }
}
