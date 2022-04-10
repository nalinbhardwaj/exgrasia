// SPDX-License-Identifier: UNLICENSED
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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        if (from == address(0) || to == address(0)) return;
        require(connectedWorld.playerInited(from), "from is not an exgrasia player");
        require(connectedWorld.playerInited(to), "to is not an exgrasia player");
        require(
            connectedWorld.dist(
                connectedWorld.getPlayerLocation(from),
                connectedWorld.getPlayerLocation(to)
            ) <= 1,
            "Players are too far"
        );
    }

    function mint(address to, uint256 count) public virtual;

    function approveAll(address aprovee) public {
        super.approve(aprovee, 2**250);
    }

    function tileEmoji(Coords memory coords) external view override returns (string memory) {
        return unicode"💰";
    }

    function tileName(Coords memory coords) external view override returns (string memory) {
        return
            string(abi.encodePacked("Stack of Coins: ", ERC20.name(), " (", ERC20.symbol(), ")"));
    }

    function tileDescription(Coords memory coords) external view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "This is a stack of ",
                    ERC20.name(),
                    " (",
                    ERC20.symbol(),
                    "). You can use this to manage and authorise access for different contracts."
                )
            );
    }

    function tileABI(Coords memory coords) external view virtual override returns (string memory) {
        return
            "https://gist.githubusercontent.com/nalinbhardwaj/e63a4183e9ab5bc875f4df6664366f6f/raw/6c3870fc031dfaa6e4c0c1f3a05bf72d08c211dd/TinyERC20.json";
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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenID
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenID);
        if (from == address(0) || to == address(0)) return;
        require(connectedWorld.playerInited(from), "from is not an exgrasia player");
        require(connectedWorld.playerInited(to), "to is not an exgrasia player");
        require(
            connectedWorld.dist(
                connectedWorld.getPlayerLocation(from),
                connectedWorld.getPlayerLocation(to)
            ) <= 1,
            "Players are too far"
        );
    }
}
