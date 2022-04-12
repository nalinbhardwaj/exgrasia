// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "./Types.sol";
import "./TileContract.sol";
import "./TinyExtensions.sol";

contract TinyWheat is TinyERC20 {
    address farmland;

    constructor(address _farmland, TinyWorld _connectedWorld)
        TinyERC20("TinyWheat", "TWH", _connectedWorld)
    {
        farmland = _farmland;
    }

    modifier onlyFarmland() {
        require(msg.sender == farmland, "Caller is not a farmland tile");
        _;
    }

    function mint(address farmer, uint256 count) public override onlyFarmland {
        _mint(farmer, count * 10**18);
    }
}

contract TinyCorn is TinyERC20 {
    address farmland;

    constructor(address _farmland, TinyWorld _connectedWorld)
        TinyERC20("TinyCorn", "TCN", _connectedWorld)
    {
        farmland = _farmland;
    }

    modifier onlyFarmland() {
        require(msg.sender == farmland, "Caller is not a farmland tile");
        _;
    }

    function mint(address farmer, uint256 count) public override onlyFarmland {
        _mint(farmer, count * 10**18);
    }
}

contract TinyCactus is TinyERC20 {
    address farmland;

    constructor(address _farmland, TinyWorld _connectedWorld)
        TinyERC20("TinyCactus", "TCT", _connectedWorld)
    {
        farmland = _farmland;
    }

    modifier onlyFarmland() {
        require(msg.sender == farmland, "Caller is not a farmland tile");
        _;
    }

    function mint(address farmer, uint256 count) public override onlyFarmland {
        _mint(farmer, count * 10**18);
    }
}

contract TinyMilk is TinyERC20 {
    address ranch;

    constructor(address _ranch, TinyWorld _connectedWorld)
        TinyERC20("TinyMilk", "TMLK", _connectedWorld)
    {
        ranch = _ranch;
    }

    modifier onlyRanch() {
        require(msg.sender == ranch, "Caller is not a ranch tile");
        _;
    }

    function mint(address farmer, uint256 count) public override onlyRanch {
        _mint(farmer, count * 10**18);
    }
}

contract TinyEgg is TinyERC20 {
    address ranch;

    constructor(address _ranch, TinyWorld _connectedWorld)
        TinyERC20("TinyEgg", "TEGG", _connectedWorld)
    {
        ranch = _ranch;
    }

    modifier onlyRanch() {
        require(msg.sender == ranch, "Caller is not a ranch tile");
        _;
    }

    function mint(address farmer, uint256 count) public override onlyRanch {
        _mint(farmer, count * 10**18);
    }
}

contract TinyFarm is ITileContract {
    TinyWorld connectedWorld;
    TinyWheat wheat;
    TinyCorn corn;
    TinyCactus cactus;

    mapping(uint256 => mapping(uint256 => TinyERC20)) farm;

    constructor(TinyWorld _connectedWorld) {
        connectedWorld = _connectedWorld;

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
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/6c3870fc031dfaa6e4c0c1f3a05bf72d08c211dd/TinyFarm.json";
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
        farm[selfCoords.x][selfCoords.y].mint(msg.sender, 1);
        farm[selfCoords.x][selfCoords.y] = TinyERC20(address(0));
        connectedWorld.forceTileUpdate(selfCoords);
    }

    function getCrops()
        public
        view
        returns (
            TinyWheat,
            TinyCorn,
            TinyCactus
        )
    {
        return (wheat, corn, cactus);
    }
}

contract TinyRanch is ITileContract {
    TinyWorld connectedWorld;
    enum RanchType {
        UNKNOWN,
        COW,
        CHICKEN
    }

    mapping(uint256 => mapping(uint256 => RanchType)) ranch;
    mapping(uint256 => mapping(uint256 => uint256)) ranchSize;
    mapping(uint256 => mapping(uint256 => uint256)) lastFeeding;
    mapping(uint256 => mapping(uint256 => uint256)) lastHarvest;

    TinyWheat wheat;
    TinyCorn corn;
    TinyCactus cactus;
    TinyMilk milkContract;
    TinyEgg eggContract;

    constructor(
        TinyWorld _connectedWorld,
        TinyWheat _wheat,
        TinyCorn _corn,
        TinyCactus _cactus
    ) {
        connectedWorld = _connectedWorld;
        wheat = _wheat;
        corn = _corn;
        cactus = _cactus;

        milkContract = new TinyMilk(address(this), connectedWorld);
        eggContract = new TinyEgg(address(this), connectedWorld);
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
        require(closeToSelf, "You need to be next to the ranch to farm");
        _;
    }

    function currentPopulation(Coords memory coords) public view returns (uint256) {
        int256 hoursSinceFeeding = (int256(block.timestamp) -
            int256(lastFeeding[coords.x][coords.y])) / (60 * 60);
        int256 res = int256(ranchSize[coords.x][coords.y]) - hoursSinceFeeding;
        return res < 0 ? 0 : uint256(res);
    }

    function tileEmoji(Coords memory coords) public view override returns (string memory) {
        if (ranch[coords.x][coords.y] == RanchType.COW) {
            return unicode"🐄";
        } else if (ranch[coords.x][coords.y] == RanchType.CHICKEN) {
            return unicode"🐔";
        }
        return unicode"🤠";
    }

    function tileName(Coords memory coords) public view override returns (string memory) {
        if (ranch[coords.x][coords.y] == RanchType.COW) {
            return "Tiny Cow Ranch";
        } else if (ranch[coords.x][coords.y] == RanchType.CHICKEN) {
            return "Tiny Chicken Ranch";
        }
        return "Tiny Ranch";
    }

    function tileDescription(Coords memory coords) public view override returns (string memory) {
        if (ranch[coords.x][coords.y] == RanchType.COW) {
            return
                string(
                    abi.encodePacked(
                        toString(currentPopulation(coords)),
                        unicode" cow live here. You can either feed them wheat or get milk."
                    )
                );
        } else if (ranch[coords.x][coords.y] == RanchType.CHICKEN) {
            return
                string(
                    abi.encodePacked(
                        toString(currentPopulation(coords)),
                        unicode" chicken live here. You can either feed them corn or get eggs."
                    )
                );
        }
        return
            "Start your ranch here. Begin by approving the Ranch contract to use your crops from a Tiny Farm. Then, use the start function to start your ranch. You can then use the milk/egg function to obtain produce. Remember to feed your animals regularly or they will die. :(";
    }

    function tileABI(Coords memory coords) public pure virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/a066ede9deaff126395da589479516e0ca8b3375/TinyRanch.json";
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT license
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function startRanch(string memory ranchType, Coords memory selfCoords)
        public
        closeToMyself(selfCoords)
    {
        require(
            connectedWorld.dist(selfCoords, connectedWorld.getPlayerLocation(msg.sender)) <= 1,
            "Too far to start"
        );
        require(connectedWorld.getTile(selfCoords).owner == msg.sender, "Not your Ranch");
        require(ranch[selfCoords.x][selfCoords.y] == RanchType.UNKNOWN, "Already started");

        if (
            keccak256(bytes(ranchType)) == keccak256(bytes("cow")) &&
            connectedWorld.getTile(selfCoords).tileType == TileType.GRASS
        ) {
            require(wheat.balanceOf(msg.sender) >= 1, "Not enough wheat");
            require(
                wheat.allowance(msg.sender, address(this)) >= 1,
                "Ranch is not approved to use crops"
            );
            ranch[selfCoords.x][selfCoords.y] = RanchType.COW;
        } else if (
            keccak256(bytes(ranchType)) == keccak256(bytes("chicken")) &&
            connectedWorld.getTile(selfCoords).tileType == TileType.GRASS
        ) {
            require(corn.balanceOf(msg.sender) >= 1, "Not enough corn");
            require(
                corn.allowance(msg.sender, address(this)) >= 1,
                "Ranch is not approved to use crops"
            );
            ranch[selfCoords.x][selfCoords.y] = RanchType.CHICKEN;
        } else revert("Invalid ranch type");
        ranchSize[selfCoords.x][selfCoords.y] = 1;
        connectedWorld.forceTileUpdate(selfCoords);
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function feed(Coords memory selfCoords) public closeToMyself(selfCoords) {
        require(
            connectedWorld.dist(selfCoords, connectedWorld.getPlayerLocation(msg.sender)) <= 1,
            "Too far to feed"
        );
        require(connectedWorld.getTile(selfCoords).owner == msg.sender, "Not your Ranch");
        require(ranch[selfCoords.x][selfCoords.y] != RanchType.UNKNOWN, "Not started");
        if (ranch[selfCoords.x][selfCoords.y] == RanchType.COW) {
            wheat.burnFrom(msg.sender, 10**18);
        } else if (ranch[selfCoords.x][selfCoords.y] == RanchType.CHICKEN) {
            corn.burnFrom(msg.sender, 10**18);
        }
        if (
            random(string(abi.encodePacked("cow", selfCoords.x, selfCoords.y, block.timestamp))) %
                3 ==
            0
        ) {
            ranchSize[selfCoords.x][selfCoords.y] += 1;
            connectedWorld.forceTileUpdate(selfCoords);
        }
        lastFeeding[selfCoords.x][selfCoords.y] = block.timestamp;
    }

    function harvest(Coords memory selfCoords) internal {
        require(
            block.timestamp - lastHarvest[selfCoords.x][selfCoords.y] >= 5 minutes,
            "Cannot harvest so soon"
        );
        if (ranch[selfCoords.x][selfCoords.y] == RanchType.COW) {
            milkContract.mint(msg.sender, currentPopulation(selfCoords));
        } else if (ranch[selfCoords.x][selfCoords.y] == RanchType.CHICKEN) {
            eggContract.mint(msg.sender, currentPopulation(selfCoords));
        }
    }

    function milk(Coords memory selfCoords) public {
        harvest(selfCoords);
    }

    function egg(Coords memory selfCoords) public {
        harvest(selfCoords);
    }

    function getProduce() public view returns (TinyMilk, TinyEgg) {
        return (milkContract, eggContract);
    }
}
