// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

/**
 * @title JudgingSystem
 * @dev Handles all judge-related functionality for hackathons
 * @notice This contract manages judges, their delegation, scoring, and rewards
 */
contract JudgingSystem {

    // Judge management
    mapping(address => bool) public isJudge;
    address[] public judgeList;

    // Judge delegation
    mapping(address => address) public judgeDelegates;
    mapping(address => address) public delegateToJudge;

    // Judge rewards
    uint256 public judgeRewardPercentage;
    uint256 public judgeRewardPool;
    mapping(address => bool) public hasReceivedJudgeReward;


    // Events
    event JudgeAdded(address indexed judge);
    event JudgeRemoved(address indexed judge);
    event JudgeDelegated(address indexed judge, address indexed delegate);
    event JudgeRewardDistributed(address indexed judge, uint256 amount);

    modifier onlyJudge() {
        require(
            isJudge[msg.sender],
            "Only judges can call this function"
        );
        _;
    }


    /**
     * @dev Add a judge to the system
     * @param _judge Address of the judge to add
     */
    function addJudge(address _judge) public virtual {
        require(_judge != address(0), "Invalid judge address");
        require(!isJudge[_judge], "Judge already added");

        isJudge[_judge] = true;
        judgeList.push(_judge);

        emit JudgeAdded(_judge);
    }

    /**
     * @dev Remove a judge from the system
     * @param _judge Address of the judge to remove
     */
    function removeJudge(address _judge) public {
        require(isJudge[_judge], "Old judge not found");

        isJudge[_judge] = false;

        // Remove from array
        for (uint256 i = 0; i < judgeList.length; i++) {
            if (judgeList[i] == _judge) {
                judgeList[i] = judgeList[judgeList.length - 1];
                judgeList.pop();
                break;
            }
        }

        emit JudgeRemoved(_judge);
    }

    /**
     * @dev Delegate judge responsibilities to another address
     * @param _delegate Address to delegate to
     */
    function delegateToAgent(address _delegate) external {
        require(isJudge[msg.sender], "Only judges can delegate");
        require(_delegate != address(0), "Invalid delegate address");
        require(_delegate != msg.sender, "Cannot delegate to yourself");
        require(judgeDelegates[msg.sender] == address(0), "Already has a delegate");

        judgeDelegates[msg.sender] = _delegate;
        delegateToJudge[_delegate] = msg.sender;

        emit JudgeDelegated(msg.sender, _delegate);
    }

    /**
     * @dev Revoke delegation
     */
    function revokeDelegation() external {
        require(isJudge[msg.sender], "Only judges can revoke delegation");
        require(judgeDelegates[msg.sender] != address(0), "No delegation to revoke");

        address delegate = judgeDelegates[msg.sender];
        judgeDelegates[msg.sender] = address(0);
        delegateToJudge[delegate] = address(0);

        emit JudgeDelegated(msg.sender, address(0));
    }

    /**
     * @dev Add funds to judge reward pool
     */
    function addJudgeRewards() public payable {
        require(msg.value > 0, "Must send ETH");
        judgeRewardPool += msg.value;
    }

    /**
     * @dev Distribute judge rewards
     */
    function distributeJudgeRewards() external {
        require(judgeRewardPool > 0, "No judge rewards available");
        require(judgeList.length > 0, "No judges to reward");

        uint256 rewardPerJudge = judgeRewardPool / judgeList.length;
        require(rewardPerJudge > 0, "Insufficient reward per judge");

        for (uint256 i = 0; i < judgeList.length; i++) {
            address judge = judgeList[i];
            if (!hasReceivedJudgeReward[judge]) {
                hasReceivedJudgeReward[judge] = true;
                payable(judge).transfer(rewardPerJudge);
                emit JudgeRewardDistributed(judge, rewardPerJudge);
            }
        }

        judgeRewardPool = 0;
    }

    /**
     * @dev Check if an address is a judge or delegate
     * @param _address Address to check
     * @return True if the address is a judge or delegate
     */
    function isJudgeOrDelegate(address _address) public view returns (bool) {
        return isJudge[_address] || delegateToJudge[_address] != address(0);
    }

    /**
     * @dev Get all judges
     * @return Array of judge addresses
     */
    function getJudges() external view returns (address[] memory) {
        return judgeList;
    }


    /**
     * @dev Get judge reward pool amount
     * @return Amount in the reward pool
     */
    function getJudgeRewardPool() external view returns (uint256) {
        return judgeRewardPool;
    }

    /**
     * @dev Get reward per judge
     * @return Amount each judge would receive
     */
    function getRewardPerJudge() external view returns (uint256) {
        if (judgeList.length == 0) return 0;
        return judgeRewardPool / judgeList.length;
    }

    /**
     * @dev Get judge reward percentage
     * @return Percentage of prize pool for judges
     */
    function getJudgeRewardPercentage() public view returns (uint256) {
        return judgeRewardPercentage;
    }

    /**
     * @dev Get delegate for a judge
     * @param _judge Address of the judge
     * @return Address of the delegate
     */
    function getJudgeDelegate(address _judge) external view returns (address) {
        return judgeDelegates[_judge];
    }

    /**
     * @dev Get judge for a delegate
     * @param _delegate Address of the delegate
     * @return Address of the judge
     */
    function getDelegateJudge(address _delegate) external view returns (address) {
        return delegateToJudge[_delegate];
    }
}
