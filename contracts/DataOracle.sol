// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error IndexOutOfBounds();

/**
 * @title DataOracle
 * @dev A contract to store and retrieve timestamped data with historical records.
 */

contract DataOracle is Ownable, AccessControl {
    // Role for data updater
    bytes32 public constant DATA_UPDATER_ROLE = keccak256("DATA_UPDATER_ROLE");

    /**
     * @dev Emitted when data is updated.
     * @param timestamp The timestamp of the update.
     * @param data The data that was updated.
     * @param historicalCount The total count of historical records after the update.
     */
    event DataUpdated(uint256 timestamp, uint256 data, uint256 historicalCount);

    /**
     * @dev Struct to hold timestamped data.
     * @param timestamp The timestamp of the data.
     * @param data The data value.
     */
    struct TimestampedData {
        uint256 timestamp;
        uint256 data;
    }

    // Storage for current data
    TimestampedData private lastData;

    // Storage for historical data using mapping and counter
    mapping(uint256 => TimestampedData) private historicalData;
    uint256 private historicalCount;

    /**
     * @dev Constructor to initialize the contract.
     * Grants the deployer the DEFAULT_ADMIN_ROLE and DATA_UPDATER_ROLE.
     */
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DATA_UPDATER_ROLE, msg.sender);
    }

    /**
     * @dev Sets the timestamped data and stores it as a historical record.
     * Only users with the DATA_UPDATER_ROLE can call this function.
     * @param _data The data to be set.
     */
    function setData(uint256 _data) public onlyRole(DATA_UPDATER_ROLE) {
        // Update current data
        lastData = TimestampedData({
            timestamp: block.timestamp,
            data: _data
        });
        // Store current data as historical record
        historicalData[historicalCount] = lastData;
        historicalCount++;

        // Emit event when data is updated
        emit DataUpdated(block.timestamp, _data, historicalCount);
    }

    /**
     * @dev Returns the last updated data.
     * @return timestamp The timestamp of the last update.
     * @return data The data value of the last update.
     */
    function getLastUpdate() public view returns (uint256, uint256) {
        return (lastData.timestamp, lastData.data);
    }

    /**
     * @dev Returns historical data by index.
     * @param index The index of the historical record to retrieve.
     * @return timestamp The timestamp of the historical record.
     * @return data The data value of the historical record.
     */
    function getHistoricalData(uint256 index) public view returns (uint256, uint256) {
        require(index < historicalCount, IndexOutOfBounds());
        return (historicalData[index].timestamp, historicalData[index].data);
    }

    /**
     * @dev Returns the total number of historical records.
     * @return The count of historical records.
     */
    function getHistoricalCount() public view returns (uint256) {
        return historicalCount;
    }
}
