// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./Types.sol";

contract ValhallaStorage {
    address public adminAddress;
    mapping(uint256 => ValhallaPlanet) public planets;
}
