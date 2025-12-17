// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DataOracle is Ownable, AccessControl {
    // Role for data updater
    bytes32 public constant DATA_UPDATER_ROLE = keccak256("DATA_UPDATER_ROLE");

    // Struct to hold timestamped data
    struct TimestampedData {
        bytes data;
        uint256 timestamp;
    }

    // Storage for current data
    TimestampedData private lastData;

    // Storage for historical data
    TimestampedData[] private historicalData;

    // Constructor
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DATA_UPDATER_ROLE, msg.sender);
    }

    // Function for admin to set timestamped data
    function setData(bytes memory _data) public onlyRole(DATA_UPDATER_ROLE) {
        // Store current data as historical record
        historicalData.push(lastData);
        
        // Update current data
        lastData = TimestampedData({
            data: _data,
            timestamp: block.timestamp
        });
    }

    // Function for users to get the last updated data
    function getLastUpdate() public view returns (bytes memory, uint256) {
        return (lastData.data, lastData.timestamp);
    }

    // Function to get historical data by index
    function getHistoricalData(uint256 index) public view returns (bytes memory, uint256) {
        require(index < historicalData.length, "Index out of bounds");
        return (historicalData[index].data, historicalData[index].timestamp);
    }

    // Function to get total historical records count
    function getHistoricalCount() public view returns (uint256) {
        return historicalData.length;
    }

    // Function to get all historical data
    function getAllHistoricalData() public view returns (TimestampedData[] memory) {
        return historicalData;
    }
}
