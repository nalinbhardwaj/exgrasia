// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

contract TinyWorldRegistry {
    address admin;
    address[] registeredRealAddresses;
    mapping(address => bool) public whitelistAddresses;
    mapping(address => address) public realAddressToProxyAddress;
    mapping(address => address) public proxyAddressToRealAddress;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    function appendWhitelist(address[] memory _addresses) public onlyAdmin {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelistAddresses[_addresses[i]] = true;
        }
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelistAddresses[_address];
    }

    function setProxyAddress(address _proxyAddress) public {
        require(whitelistAddresses[msg.sender], "Only whitelisted addresses can play for now");
        require(realAddressToProxyAddress[msg.sender] == address(0), "Proxy address already set");
        require(proxyAddressToRealAddress[_proxyAddress] == address(0), "Real address already set");
        realAddressToProxyAddress[msg.sender] = _proxyAddress;
        proxyAddressToRealAddress[_proxyAddress] = msg.sender;
    }

    // DELETE BEFORE DEPLOY
    function dummySetProxyAddress(address[] memory realAddresses, address proxyAddress) public {
        for (uint256 i = 0; i < realAddresses.length; i++) {
            address realAddress = realAddresses[i];
            require(whitelistAddresses[realAddress], "Only whitelisted addresses can play for now");
            require(
                realAddressToProxyAddress[realAddress] == address(0),
                "Proxy address already set"
            );
            require(
                proxyAddressToRealAddress[proxyAddress] == address(0),
                "Real address already set"
            );
            realAddressToProxyAddress[realAddress] = proxyAddress;
            proxyAddressToRealAddress[proxyAddress] = realAddress;
        }
    }

    function getProxyAddress(address _realAddress) public view returns (address) {
        return realAddressToProxyAddress[_realAddress];
    }

    function getRealAddress(address _proxyAddress) public view returns (address) {
        return proxyAddressToRealAddress[_proxyAddress];
    }

    function getPlayerInfos() public view returns (address[] memory, address[] memory) {
        address[] memory realAddresses = new address[](registeredRealAddresses.length);
        address[] memory proxyAddresses = new address[](registeredRealAddresses.length);
        for (uint256 i = 0; i < registeredRealAddresses.length; i++) {
            address realAddress = registeredRealAddresses[i];
            realAddresses[i] = realAddress;
            proxyAddresses[i] = realAddressToProxyAddress[realAddress];
        }
        return (proxyAddresses, realAddresses);
    }
}
