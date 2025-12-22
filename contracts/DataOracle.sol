// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

error AlreadyVoted(address);
error InvalidThreshold();

/**
 * @title DataOracle
 * @author AXC
 * @notice A contract to store and retrieve timestamped data with
 *      historical records.  To maintain data integrity this system
 *      creates a voting mechanism.  To change data there must be N
 *      votes that agree on the new data.  If any voter tries to set
 *      the data to a different value or attempts to double vote
 *      before the threshold is reached the vote is invalid and the
 *      vote restarted.
 */
contract DataOracle is Ownable, AccessControl {
    /**
     * @notice Role for data updater
     */
    bytes32 public constant DATA_UPDATER_ROLE = keccak256("DATA_UPDATER_ROLE");

    /**
     * @notice Emitted when data is updated.
     * @param timestamp The timestamp of the update.
     * @param data The data that was updated.
     * @param historicalCount The total count of historical records after the update.
     */
    event DataUpdated(uint256 indexed timestamp,
		      uint256 indexed data,
		      uint256 indexed historicalCount
		     );

    /**
     * @notice Emitted when vote is valid vote
     * @param voter - voter
     * @param proposal - proposal numbner
     * @param voteCount - vote count
     * @param data - new data
     */
    event VoteCast(address indexed voter,
		   uint256 indexed proposal,
		   uint256 indexed voteCount,
		   uint256 data);

    /**
     * @notice Emitted when vote is reset.
     * @param voter - voter
     * @param proposal - proposal number
     * @param voteCount - vote count
     * @param newData - new data
     * @param oldData - the old data
     */
    event VoteFailed(address indexed voter,
		     uint256 indexed proposal,
		     uint256 indexed voteCount,
		     uint256 newData,
		     uint256 oldData
		    );

    /**
     * @notice Struct to hold timestamped data.
     * @param timestamp The timestamp of the data.
     * @param data The data value.
     */
    struct TimestampedData {
        uint256 timestamp;
        uint256 data;
    }

    /**
     * @notice Storage for current data
     */

    TimestampedData public lastData;

    /**
     * @notice Storage for historical data using mapping and counter
     */

    mapping(uint256 => TimestampedData) public historicalData;

    /**
     * @notice Count of data histories
     */
    uint256 public historicalCount;

    /**
     * @notice Count of proposals
     */
    uint256 public proposalCount;

    /**
     * @notice Threshold for number of users required to set data
     */
    uint256 public threshold;

    /**
     * @notice Storage to track which users have called setData
     */

    mapping(uint256=>mapping(address => bool)) public userVotes;

    /**
     * @notice current vote count
     */
    uint256 public voteCount;

    /**
     * @notice Storage for the current value being voted on
     */
    uint256 public currentVoteValue;

    /**
     * @notice Constructor to initialize the contract.  Grants the
     * deployer the DEFAULT_ADMIN_ROLE but not the DATA_UPDATER_ROLE.
     * Sets the default threshold to 1.
     */
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DATA_UPDATER_ROLE, msg.sender);
        threshold = 1;
    }

    /**
     * @notice Sets the threshold for the number of users required to
     * update the data.  Only the owner can call this function.
     * Changing threshold resets votes.
     * @param _threshold The new threshold value.
     */
    function setThreshold(uint256 _threshold) public onlyOwner {
        require(_threshold > 0, InvalidThreshold());
        threshold = _threshold;
	resetVotes();
    }

    /**
     * @notice Sets the timestamped data and stores it as a historical
     * record.  Only users with the DATA_UPDATER_ROLE can call this
     * function.
     * @param _data The data to be set.
     */

    function setData(uint256 _data) public onlyRole(DATA_UPDATER_ROLE) {
        // If user has already voted, or
        // If this is the first vote for a new value, reset the vote tracking
        if (userVotes[proposalCount][msg.sender] ||
	    (voteCount !=0 && currentVoteValue != _data)) {
	    emit VoteFailed(msg.sender,  proposalCount, voteCount,
			   _data, currentVoteValue);
            resetVotes();
	    return;
        }

        // Record the user's vote
        currentVoteValue = _data;
        userVotes[proposalCount][msg.sender] = true;
        ++voteCount;
	emit VoteCast(msg.sender, proposalCount, voteCount, currentVoteValue);

        // If threshold not met, return
        if (voteCount < threshold) {
	    return;
        }

        // Update current data
        lastData = TimestampedData({
            timestamp: block.timestamp,
            data: _data
        });
        // Store current data as historical record
        historicalData[historicalCount] = lastData;
        ++historicalCount;

        // Emit event when data is updated
        emit DataUpdated(block.timestamp, _data, historicalCount);

        // Reset votes
        resetVotes();
    }

    /**
     * @notice Resets the votes
     */
    function resetVotes() internal {
        // Reset votes for the current value
        ++proposalCount;
        voteCount = 0;

    }

    /**
     * @notice Returns the last updated data.
     * @return timestamp The timestamp of the last update.
     * @return data The data value of the last update.
     */
    function getLastUpdate() public view returns (uint256, uint256) {
        return (lastData.timestamp, lastData.data);
    }
}
