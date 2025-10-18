// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IVotingSystem
 * @dev Interface for all voting systems in DeHack platform
 * @notice Supports batch voting for multiple participants in one transaction
 */
interface IVotingSystem {

    // ============ EVENTS ============

    event VotesSubmitted(
        address indexed judge,
        address[] participants,
        uint256[] points
    );

    event WinnerUpdated(
        address indexed participant,
        uint256 oldPosition,
        uint256 newPosition
    );

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Submit votes for multiple participants in one transaction
     * @param _participants Array of participant addresses
     * @param _points Array of points allocated to each participant
     */
    function submitVotes(
        address[] calldata _participants,
        uint256[] calldata _points
    )
        external;

    /**
     * @dev Get current winners in order (1st, 2nd, 3rd, etc.)
     * @return Array of winner addresses in ranking order
     */
    function getWinners()
        external
        view
        returns (address[] memory);

    /**
     * @dev Get participant's current total points
     * @param _participant Address of the participant
     * @return Total points received
     */
    function getParticipantPoints(
        address _participant
    )
        external
        view
        returns (uint256);

    /**
     * @dev Get participant's current ranking position
     * @param _participant Address of the participant
     * @return Ranking position (0 = not in top N, 1+ = position)
     */
    function getParticipantRanking(
        address _participant
    )
        external
        view
        returns (uint256);

    /**
     * @dev Check if a judge has voted
     * @param _judge Address of the judge
     * @return True if judge has voted
     */
    function hasJudgeVoted(
        address _judge
    )
        external
        view
        returns (bool);

    /**
     * @dev Get voting statistics
     * @return _totalJudges Total number of judges
     * @return _votedJudges Number of judges who have voted
     * @return _totalParticipants Number of participants with votes
     */
    function getVotingStats()
        external
        view
        returns (
            uint256 _totalJudges,
            uint256 _votedJudges,
            uint256 _totalParticipants
        );

    // ============ CONFIGURATION ============

    /**
     * @dev Initialize the voting system
     * @param _pointsPerJudge Maximum points each judge can allocate
     * @param _maxWinners Maximum number of winners to track
     * @param _judges Array of judge addresses
     */
    function initialize(
        uint256 _pointsPerJudge,
        uint256 _maxWinners,
        address[] calldata _judges
    )
        external;

    /**
     * @dev Add a judge to the voting system
     * @param _judge Address of the judge to add
     */
    function addJudge(
        address _judge
    )
        external;

    /**
     * @dev Remove a judge from the voting system
     * @param _judge Address of the judge to remove
     */
    function removeJudge(
        address _judge
    )
        external;

    // ============ WINNER MANAGEMENT ============

    /**
     * @dev Get the number of current winners
     * @return Number of winners currently tracked
     */
    function getWinnerCount()
        external
        view
        returns (uint256);

    /**
     * @dev Get winner at specific position
     * @param _position Position in rankings (1-indexed)
     * @return Address of winner at position
     */
    function getWinnerAtPosition(
        uint256 _position
    )
        external
        view
        returns (address);

    /**
     * @dev Check if participant is currently a winner
     * @param _participant Address of the participant
     * @return True if participant is in top N winners
     */
    function isWinner(
        address _participant
    )
        external
        view
        returns (bool);
}
