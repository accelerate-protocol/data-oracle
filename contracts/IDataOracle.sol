// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

/**
 * @title IDataOracle
 * @author AXC
 * @notice Interface file for data oracle
 */
interface IDataOracle {
    /**
     * @notice return last update value
     * @return value - last stored data
     */
    function getLastData() external view returns (uint256);
}
