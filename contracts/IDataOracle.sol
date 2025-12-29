// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDataOracle
 * @author AXC
 * @notice Interface file for data oracle
 */
interface IDataOracle {
    /**
     * @notice return last update value
     * @return timestamp  Timestamp of last value
     * @return datq Return data
     */
    function getLastUpdate() external returns (uint256, uint256);
}
