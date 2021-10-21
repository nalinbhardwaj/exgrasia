// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./ValhallaStorage.sol";

contract Valhalla is ERC721Upgradeable, ValhallaStorage {
    modifier onlyAdmin() {
        require(msg.sender == adminAddress, "Only the Admin address can fiddle with Valhalla.");
        _;
    }

    function initialize(address _adminAddress) public initializer {
        adminAddress = _adminAddress;
    }

    function doesPlanetExist(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }
}
