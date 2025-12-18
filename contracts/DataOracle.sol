// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error IndexOutOfBounds();

contract DataOracle is Ownable, AccessControl {
    // Role for data updater
    bytes32 public constant DATA_UPDATER_ROLE = keccak256("DATA_UPDATER_ROLE");

    // Struct to hold timestamped data
    struct TimestampedData {
        uint256 timestamp;
        uint256 data;
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
    function setData(uint256 _data) public onlyRole(DATA_UPDATER_ROLE) {
        // Update current data
        lastData = TimestampedData({
            timestamp: block.timestamp,
            data: _data
        });
        // Store current data as historical record
        historicalData.push(lastData);
    }

    // Function for users to get the last updated data
    function getLastUpdate() public view returns (uint256, uint256) {
        return (lastData.timestamp, lastData.data);
    }

    // Function to get historical data by index
    function getHistoricalData(uint256 index) public view returns (uint256, uint256) {
        require(index < historicalData.length, IndexOutOfBounds());
        return (historicalData[index].timestamp, historicalData[index].data);
    }

    // Function to get total historical records count
    function getHistoricalCount() public view returns (uint256) {
        return historicalData.length;
    }
}
