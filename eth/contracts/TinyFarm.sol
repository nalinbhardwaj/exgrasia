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
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/611fdea6dcd9023b4d213e70f85c8c7ddadbfdde/TinyFarm.json";
    }

    function getClosestSelf() internal returns (Coords memory) {
        Coords memory playerLoc = connectedWorld.getPlayerLocation(msg.sender);
        Coords[4] memory neighbors = [
            Coords(playerLoc.x - 1, playerLoc.y),
            Coords(playerLoc.x + 1, playerLoc.y),
            Coords(playerLoc.x, playerLoc.y - 1),
            Coords(playerLoc.x, playerLoc.y + 1)
        ];

        for (uint256 i = 0; i < neighbors.length; i++) {
            if (connectedWorld.getTile(neighbors[i]).smartContract == address(this)) {
                return neighbors[i];
            }
        }
        return Coords(0, 0);
    }

    function plant(string memory _farmType) public {
        Coords memory tileLoc = getClosestSelf();
        require(tileLoc.x != 0, "No closeby farm found");
        require(connectedWorld.getTile(tileLoc).owner == msg.sender, "Not your farm");

        if (
            keccak256(bytes(_farmType)) == keccak256(bytes("wheat")) &&
            connectedWorld.getTile(tileLoc).tileType == TileType.GRASS
        ) farm[tileLoc.x][tileLoc.y] = wheat;
        else if (
            keccak256(bytes(_farmType)) == keccak256(bytes("corn")) &&
            connectedWorld.getTile(tileLoc).tileType == TileType.GRASS
        ) farm[tileLoc.x][tileLoc.y] = corn;
        else if (
            keccak256(bytes(_farmType)) == keccak256(bytes("cactus")) &&
            connectedWorld.getTile(tileLoc).tileType == TileType.SAND
        ) farm[tileLoc.x][tileLoc.y] = cactus;
        else revert("Invalid farm type");
        connectedWorld.forceTileUpdate(tileLoc);
    }

    function harvest() public {
        Coords memory tileLoc = getClosestSelf();
        require(tileLoc.x != 0, "No closeby farm found");
        require(connectedWorld.getTile(tileLoc).owner == msg.sender, "Not your farm");
        require(farm[tileLoc.x][tileLoc.y] != TinyERC20(address(0)), "No farm found");
        farm[tileLoc.x][tileLoc.y].mint(msg.sender);
    }
}
