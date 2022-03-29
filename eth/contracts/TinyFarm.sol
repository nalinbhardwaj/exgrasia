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

    function tileEmoji() public pure override returns (string memory) {
        return unicode"🧑‍🌾";
    }

    function tileName() public pure override returns (string memory) {
        return "Farm Tile";
    }

    function tileDescription() public pure override returns (string memory) {
        return "Plant some crops here!";
    }

    function tileABI() public pure virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/e5f3bed5edc0421047d761e8e1ff6a821295bf36/TinyFarm.json";
    }

    function getClosestSelf() public returns (Coords memory) {
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

        if (keccak256(bytes(_farmType)) == keccak256(bytes("wheat")))
            farm[tileLoc.x][tileLoc.y] = wheat;
        else if (keccak256(bytes(_farmType)) == keccak256(bytes("corn")))
            farm[tileLoc.x][tileLoc.y] = corn;
        else if (
            keccak256(bytes(_farmType)) == keccak256(bytes("cactus")) &&
            connectedWorld.getTile(tileLoc).tileType == TileType.SAND
        ) farm[tileLoc.x][tileLoc.y] = cactus;
        else revert("Invalid farm type");
    }

    function harvest() public {
        Coords memory tileLoc = getClosestSelf();
        require(tileLoc.x != 0, "No closeby farm found");
        require(connectedWorld.getTile(tileLoc).owner == msg.sender, "Not your farm");
        require(farm[tileLoc.x][tileLoc.y] != TinyERC20(address(0)), "No farm found");
        farm[tileLoc.x][tileLoc.y].mint(msg.sender);
    }
}
