// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

/**
 * @title IDataOracle
 * @author AXC
 * @notice Interface file for data oracle
 */
interface IDataOracle {
    /**
     * @notice return last update value
     * @return timestamp  Timestamp of last value
     */
    function getLastData() external returns (uint256);
}
