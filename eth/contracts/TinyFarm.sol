// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "./Types.sol";
import "./TileContract.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract TinyERC20 is ERC20 {
    TinyWorld connectedWorld;

    constructor(
        string memory name_,
        string memory symbol_,
        TinyWorld _connectedWorld
    ) ERC20(name_, symbol_) {
        connectedWorld = _connectedWorld;
    }

    modifier areUserClose(address from, address to) {
        require(connectedWorld.playerInited(from), "Not an exgrasia player");
        require(connectedWorld.playerInited(to), "Not an exgrasia player");
        require(
            connectedWorld.dist(
                connectedWorld.getPlayerLocation(from),
                connectedWorld.getPlayerLocation(to)
            ) <= 1,
            "Players are too far"
        );
        _;
    }

    function transfer(address to, uint256 amount)
        public
        virtual
        override
        areUserClose(msg.sender, to)
        returns (bool)
    {
        return ERC20.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override areUserClose(from, to) returns (bool) {
        return ERC20.transferFrom(from, to, amount);
    }

    function mint(address to) public virtual;
}

contract TinyWheat is TinyERC20 {
    address farmland;

    constructor(address _farmland, TinyWorld _connnectedWorld)
        TinyERC20("TinyWheat", "TWH", _connnectedWorld)
    {
        farmland = _farmland;
    }

    modifier onlyFarmland() {
        require(msg.sender == farmland, "Caller is not a farmland tile");
        _;
    }

    function mint(address farmer) public override onlyFarmland {
        _mint(farmer, 10**18);
    }
}

contract TinyCorn is TinyERC20 {
    address farmland;

    constructor(address _farmland, TinyWorld _connnectedWorld)
        TinyERC20("TinyCorn", "TCN", _connnectedWorld)
    {
        farmland = _farmland;
    }

    modifier onlyFarmland() {
        require(msg.sender == farmland, "Caller is not a farmland tile");
        _;
    }

    function mint(address farmer) public override onlyFarmland {
        _mint(farmer, 10**18);
    }
}

contract TinyCactus is TinyERC20 {
    address farmland;

    constructor(address _farmland, TinyWorld _connnectedWorld)
        TinyERC20("TinyCactus", "TCT", _connnectedWorld)
    {
        farmland = _farmland;
    }

    modifier onlyFarmland() {
        require(msg.sender == farmland, "Caller is not a farmland tile");
        _;
    }

    function mint(address farmer) public override onlyFarmland {
        _mint(farmer, 10**18);
    }
}

contract TinyFarm is ITileContract {
    TinyWorld connectedWorld;
    TinyWheat wheat;
    TinyCorn corn;
    TinyCactus cactus;

    mapping(uint256 => mapping(uint256 => TinyERC20)) farm;

    constructor(TinyWorld _connnectedWorld) {
        connectedWorld = _connnectedWorld;

        wheat = new TinyWheat(address(this), connectedWorld);
        corn = new TinyCorn(address(this), connectedWorld);
        cactus = new TinyCactus(address(this), connectedWorld);
    }

    function tileEmoji(Coords memory coords) public view override returns (string memory) {
        if (farm[coords.x][coords.y] == wheat) {
            return unicode"🌾";
        } else if (farm[coords.x][coords.y] == corn) {
            return unicode"🌽";
        } else if (farm[coords.x][coords.y] == cactus) {
            return unicode"🌵";
        }
        return unicode"🧑‍🌾";
    }

    function tileName(Coords memory coords) public view override returns (string memory) {
        if (farm[coords.x][coords.y] == wheat) {
            return unicode"Tiny Wheat Farm";
        } else if (farm[coords.x][coords.y] == corn) {
            return unicode"Tiny Corn Farm";
        } else if (farm[coords.x][coords.y] == cactus) {
            return unicode"Tiny Cactus Farm";
        }
        return "Tiny Farm";
    }

    function tileDescription(Coords memory coords) public view override returns (string memory) {
        if (farm[coords.x][coords.y] == wheat) {
            return unicode"🌾 is growing here. Use harvest to collect some wheat.";
        } else if (farm[coords.x][coords.y] == corn) {
            return unicode"🌽 is growing here. Use harvest to collect some corn.";
        } else if (farm[coords.x][coords.y] == cactus) {
            return unicode"🌵 is growing here. Use harvest to collect some cactus.";
        }
        return "Plant some crops here! Use plant to grow some wheat, corn or cactus.";
    }

    function tileABI(Coords memory coords) public pure virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/9bd39332363c0d6109e8f889ca44bc4b5e879b94/TinyFarm.json";
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
        require(closeToSelf, "You need to be next to the farm to farm");
        _;
    }

    function plant(string memory farmType, Coords memory selfCoords)
        public
        closeToMyself(selfCoords)
    {
        require(
            connectedWorld.dist(selfCoords, connectedWorld.getPlayerLocation(msg.sender)) <= 1,
            "Too far to plant"
        );
        require(connectedWorld.getTile(selfCoords).owner == msg.sender, "Not your farm");

        if (
            keccak256(bytes(farmType)) == keccak256(bytes("wheat")) &&
            connectedWorld.getTile(selfCoords).tileType == TileType.GRASS
        ) farm[selfCoords.x][selfCoords.y] = wheat;
        else if (
            keccak256(bytes(farmType)) == keccak256(bytes("corn")) &&
            connectedWorld.getTile(selfCoords).tileType == TileType.GRASS
        ) farm[selfCoords.x][selfCoords.y] = corn;
        else if (
            keccak256(bytes(farmType)) == keccak256(bytes("cactus")) &&
            connectedWorld.getTile(selfCoords).tileType == TileType.SAND
        ) farm[selfCoords.x][selfCoords.y] = cactus;
        else revert("Invalid farm type");
        connectedWorld.forceTileUpdate(selfCoords);
    }

    function harvest(Coords memory selfCoords) public closeToMyself(selfCoords) {
        require(
            connectedWorld.dist(selfCoords, connectedWorld.getPlayerLocation(msg.sender)) <= 1,
            "Too far to harvest"
        );
        require(connectedWorld.getTile(selfCoords).owner == msg.sender, "Not your farm");
        require(farm[selfCoords.x][selfCoords.y] != TinyERC20(address(0)), "No farm found");
        farm[selfCoords.x][selfCoords.y].mint(msg.sender);
    }
}
