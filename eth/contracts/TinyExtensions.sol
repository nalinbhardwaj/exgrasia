// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./TinyWorld.sol";
import "./TileContract.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

abstract contract TinyERC20 is ERC20Burnable, ITileContract {
    TinyWorld connectedWorld;

    constructor(
        string memory name_,
        string memory symbol_,
        TinyWorld _connectedWorld
    ) ERC20(name_, symbol_) {
        connectedWorld = _connectedWorld;
    }

    function isContract(address addr) internal view returns (bool) {
        return addr.code.length > 0;
    }

    function getAddressOrContractLocations(address addr) internal view returns (Coords[] memory) {
        if (isContract(addr)) {
            return connectedWorld.getContractLocations(addr);
        } else {
            require(connectedWorld.isPlayerInit(addr), "addr is not an exgrasia player");
            Coords[] memory ret = new Coords[](1);
            ret[0] = connectedWorld.getPlayerLocation(addr);
            return ret;
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (from == address(0) || to == address(0)) return;
        Coords[] memory fromLocations = getAddressOrContractLocations(from);
        Coords[] memory toLocations = getAddressOrContractLocations(to);
        bool satisfactory = false;
        for (uint256 i = 0; i < fromLocations.length; i++) {
            for (uint256 j = 0; j < toLocations.length; j++) {
                if (connectedWorld.dist(fromLocations[i], toLocations[j]) <= 1) {
                    satisfactory = true;
                    break;
                }
            }
            if (satisfactory) break;
        }
        require(satisfactory, "Transfer is only allowed between adjacent tiles");
    }

    function mint(address to, uint256 count) public virtual;

    function approveAll(address aprovee) public {
        super.approve(aprovee, 2**250);
    }

    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"💰";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return string(abi.encodePacked("Stack of ", ERC20.name(), " (", ERC20.symbol(), ")"));
    }

    function tileDescription(Coords memory coords) external view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "This is a stack of ",
                    ERC20.name(),
                    " (",
                    ERC20.symbol(),
                    "). You can use this to manage and authorise access to your tokens for different contracts."
                )
            );
    }

    function tileABI(Coords memory coords) external view virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/ef20a647b07d1796cca88745d0d4bf95/raw/ea69052ba9c70f6574ba5d19c29193b1fa183c61/TinyERC20.json";
    }
}

abstract contract TinyERC721 is ERC721Enumerable {
    TinyWorld connectedWorld;

    constructor(
        string memory name_,
        string memory symbol_,
        TinyWorld _connectedWorld
    ) ERC721(name_, symbol_) {
        connectedWorld = _connectedWorld;
    }

    function isContract(address addr) internal view returns (bool) {
        return addr.code.length > 0;
    }

    function getAddressOrContractLocations(address addr) internal view returns (Coords[] memory) {
        if (isContract(addr)) {
            return connectedWorld.getContractLocations(addr);
        } else {
            require(connectedWorld.isPlayerInit(addr), "addr is not an exgrasia player");
            Coords[] memory ret = new Coords[](1);
            ret[0] = connectedWorld.getPlayerLocation(addr);
            return ret;
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (from == address(0) || to == address(0)) return;
        Coords[] memory fromLocations = getAddressOrContractLocations(from);
        Coords[] memory toLocations = getAddressOrContractLocations(to);
        bool satisfactory = false;
        for (uint256 i = 0; i < fromLocations.length; i++) {
            for (uint256 j = 0; j < toLocations.length; j++) {
                if (connectedWorld.dist(fromLocations[i], toLocations[j]) <= 1) {
                    satisfactory = true;
                    break;
                }
            }
            if (satisfactory) break;
        }
        require(satisfactory, "Transfer is only allowed between adjacent tiles");
    }
}
