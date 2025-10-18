// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IVotingSystem.sol";

/**
 * @title QuadraticVoting
 * @dev Library for quadratic voting calculations and validation
 * @notice Implements quadratic voting where cost = votes²
 */
library QuadraticVoting {

    // ============ ERRORS ============

    error InvalidVoteAllocation();
    error ExceedsCreditLimit();
    error InvalidVoteValue();

    // ============ FUNCTIONS ============

    /**
     * @dev Calculate the cost of a vote allocation
     * @param _votes Array of votes for each participant
     * @return Total cost in credits
     */
    function calculateCost(uint256[] memory _votes) internal pure returns (uint256) {
        uint256 totalCost = 0;

        for (uint256 i = 0; i < _votes.length; i++) {
            totalCost += _votes[i] * _votes[i];
        }

        return totalCost;
    }

    /**
     * @dev Validate quadratic voting allocation
     * @param _votes Array of votes for each participant
     * @param _totalCredits Total credits available to judge
     * @return True if allocation is valid
     */
    function validateAllocation(
        uint256[] memory _votes,
        uint256 _totalCredits
    ) internal pure returns (bool) {
        uint256 totalCost = calculateCost(_votes);
        return totalCost <= _totalCredits;
    }

    /**
     * @dev Calculate square root using Babylonian method
     * @param _x Number to calculate square root of
     * @return Square root of _x
     */
    function sqrt(uint256 _x) internal pure returns (uint256) {
        if (_x == 0) return 0;

        uint256 z = (_x + 1) / 2;
        uint256 y = _x;

        while (z < y) {
            y = z;
            z = (_x / z + z) / 2;
        }

        return y;
    }

    /**
     * @dev Convert credits to votes (sqrt function)
     * @param _credits Number of credits
     * @return Number of votes
     */
    function creditsToVotes(uint256 _credits) internal pure returns (uint256) {
        return sqrt(_credits);
    }

    /**
     * @dev Convert votes to credits (squared function)
     * @param _votes Number of votes
     * @return Number of credits required
     */
    function votesToCredits(uint256 _votes) internal pure returns (uint256) {
        return _votes * _votes;
    }

    /**
     * @dev Validate that all votes are non-negative
     * @param _votes Array of votes
     * @return True if all votes are valid
     */
    function validateVotes(uint256[] memory _votes) internal pure returns (bool) {
        for (uint256 i = 0; i < _votes.length; i++) {
            if (_votes[i] < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Calculate optimal vote distribution for given credits
     * @param _participants Number of participants
     * @param _totalCredits Total credits available
     * @param _preferences Array of preference weights (0-100)
     * @return Array of optimal votes for each participant
     */
    function calculateOptimalDistribution(
        uint256 _participants,
        uint256 _totalCredits,
        uint256[] memory _preferences
    ) internal pure returns (uint256[] memory) {
        require(_participants == _preferences.length, "Preferences length mismatch");
        require(_participants > 0, "Must have at least one participant");

        uint256[] memory votes = new uint256[](_participants);

        // Calculate total preference weight
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _participants; i++) {
            totalWeight += _preferences[i];
        }

        if (totalWeight == 0) {
            // If no preferences, distribute equally
            uint256 equalVotes = sqrt(_totalCredits / _participants);
            for (uint256 i = 0; i < _participants; i++) {
                votes[i] = equalVotes;
            }
        } else {
            // Distribute based on preferences
            for (uint256 i = 0; i < _participants; i++) {
                uint256 proportionalCredits = (_totalCredits * _preferences[i]) / totalWeight;
                votes[i] = sqrt(proportionalCredits);
            }
        }

        return votes;
    }
}

/**
 * @title QVWrapper
 * @dev Wrapper contract that adds quadratic voting to any voting system
 * @notice Converts quadratic votes to linear points for the base voting system
 */
contract QVWrapper is IVotingSystem {

    // ============ STATE VARIABLES ============

    IVotingSystem public immutable baseVotingSystem;
    uint256 public immutable creditsPerJudge;

    // ============ EVENTS ============

    event QVVotesSubmitted(
        address indexed judge,
        address[] participants,
        uint256[] votes,
        uint256 totalCreditsUsed
    );

    // ============ CONSTRUCTOR ============

    constructor(address _baseVotingSystem, uint256 _creditsPerJudge) {
        baseVotingSystem = IVotingSystem(_baseVotingSystem);
        creditsPerJudge = _creditsPerJudge;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Submit quadratic votes for multiple participants
     * @param _participants Array of participant addresses
     * @param _votes Array of votes (not credits) for each participant
     */
    function submitVotes(
        address[] calldata _participants,
        uint256[] calldata _votes
    ) external override {
        require(_participants.length == _votes.length, "Arrays length mismatch");
        require(_participants.length > 0, "Must vote for at least one participant");

        // Validate quadratic voting allocation
        require(
            QuadraticVoting.validateAllocation(_votes, creditsPerJudge),
            "Invalid quadratic vote allocation"
        );

        // Calculate total credits used
        uint256 totalCreditsUsed = QuadraticVoting.calculateCost(_votes);

        // Convert votes to points for base system
        // In QV, votes are the actual points (not credits)
        uint256[] memory points = new uint256[](_votes.length);
        for (uint256 i = 0; i < _votes.length; i++) {
            points[i] = _votes[i];
        }

        // Submit to base voting system
        baseVotingSystem.submitVotes(_participants, points);

        emit QVVotesSubmitted(msg.sender, _participants, _votes, totalCreditsUsed);
    }

    // ============ DELEGATION TO BASE SYSTEM ============

    function getWinners() external view override returns (address[] memory) {
        return baseVotingSystem.getWinners();
    }

    function getParticipantPoints(address _participant) external view override returns (uint256) {
        return baseVotingSystem.getParticipantPoints(_participant);
    }

    function getParticipantRanking(address _participant) external view override returns (uint256) {
        return baseVotingSystem.getParticipantRanking(_participant);
    }

    function hasJudgeVoted(address _judge) external view override returns (bool) {
        return baseVotingSystem.hasJudgeVoted(_judge);
    }

    function getVotingStats() external view override returns (
        uint256 _totalJudges,
        uint256 _votedJudges,
        uint256 _totalParticipants
    ) {
        return baseVotingSystem.getVotingStats();
    }

    function initialize(
        uint256 _pointsPerJudge,
        uint256 _maxWinners,
        address[] calldata _judges
    ) external override {
        // QV wrapper doesn't need initialization
        // Base system should be initialized separately
    }

    function addJudge(address _judge) external override {
        // QV wrapper doesn't manage judges directly
        // Judges are managed by the base voting system
        // This function is here for interface compliance
    }

    function removeJudge(address _judge) external override {
        baseVotingSystem.removeJudge(_judge);
    }

    function getWinnerCount() external view override returns (uint256) {
        return baseVotingSystem.getWinnerCount();
    }

    function getWinnerAtPosition(uint256 _position) external view override returns (address) {
        return baseVotingSystem.getWinnerAtPosition(_position);
    }

    function isWinner(address _participant) external view override returns (bool) {
        return baseVotingSystem.isWinner(_participant);
    }

    // ============ QV-SPECIFIC FUNCTIONS ============

    /**
     * @dev Calculate optimal vote distribution for a judge
     * @param _participants Array of participant addresses
     * @param _preferences Array of preference weights (0-100)
     * @return Array of optimal votes for each participant
     */
    function calculateOptimalVotes(
        address[] calldata _participants,
        uint256[] calldata _preferences
    ) external view returns (uint256[] memory) {
        require(_participants.length == _preferences.length, "Arrays length mismatch");

        return QuadraticVoting.calculateOptimalDistribution(
            _participants.length,
            creditsPerJudge,
            _preferences
        );
    }

    /**
     * @dev Calculate cost of a vote allocation
     * @param _votes Array of votes
     * @return Total cost in credits
     */
    function calculateVoteCost(uint256[] calldata _votes) external pure returns (uint256) {
        return QuadraticVoting.calculateCost(_votes);
    }

    /**
     * @dev Validate a vote allocation
     * @param _votes Array of votes
     * @return True if allocation is valid
     */
    function validateVoteAllocation(uint256[] calldata _votes) external view returns (bool) {
        return QuadraticVoting.validateAllocation(_votes, creditsPerJudge);
    }
}
