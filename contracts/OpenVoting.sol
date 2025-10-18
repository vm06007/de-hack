// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IVotingSystem.sol";
import "./VotingTypes.sol";

/**
 * @title OpenVoting
 * @dev Transparent voting system with batch voting support
 * @notice Judges can vote for multiple participants in one transaction
 */
contract OpenVoting is IVotingSystem {

    // ============ STATE VARIABLES ============

    // Voting configuration
    uint256 public pointsPerJudge;
    uint256 public maxWinners;
    uint256 public votingDeadline;

    // Judge management
    mapping(address => bool) public isJudge;
    mapping(address => bool) public hasVoted;
    address[] public judges;
    uint256 public totalJudges;

    // Participant scoring
    mapping(address => uint256) public totalPoints;
    mapping(address => mapping(address => uint256)) public judgeVotes;

    // Dynamic winner tracking - updated on each vote
    mapping(address => uint256) public winnerPosition; // 0 = not a winner, 1+ = position (1-indexed)
    address[] public winners; // Array of winners in order (1st, 2nd, 3rd, etc.)

    // ============ EVENTS ============

    event JudgeAdded(address indexed judge);
    event JudgeRemoved(address indexed judge);

    // ============ MODIFIERS ============

    modifier onlyJudge() {
        require(isJudge[msg.sender], "Only judges can perform this action");
        _;
    }

    modifier onlyDuringVoting() {
        require(block.timestamp <= votingDeadline, "Voting deadline has passed");
        _;
    }

    // ============ INITIALIZATION ============

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
    ) external override {
        require(pointsPerJudge == 0, "Already initialized");

        pointsPerJudge = _pointsPerJudge;
        maxWinners = _maxWinners;

        // Add judges
        for (uint256 i = 0; i < _judges.length; i++) {
            _addJudge(_judges[i]);
        }
    }

    // ============ CORE VOTING FUNCTIONS ============

    /**
     * @dev Submit votes for multiple participants in one transaction
     * @param _participants Array of participant addresses
     * @param _points Array of points allocated to each participant
     */
    function submitVotes(
        address[] calldata _participants,
        uint256[] calldata _points
    ) external override onlyJudge onlyDuringVoting {
        require(_participants.length == _points.length, "Arrays length mismatch");
        require(_participants.length > 0, "Must vote for at least one participant");
        require(!hasVoted[msg.sender], "Judge has already voted");

        uint256 totalPointsUsed = 0;

        // Process each vote
        for (uint256 i = 0; i < _participants.length; i++) {
            require(_points[i] > 0, "Points must be greater than 0");
            totalPointsUsed += _points[i];

            // Update participant's total points
            uint256 oldPoints = totalPoints[_participants[i]];
            totalPoints[_participants[i]] += _points[i];

            // Store judge's vote
            judgeVotes[msg.sender][_participants[i]] = _points[i];

            // Update winner list (O(1) operation per participant)
            _updateWinnerList(_participants[i], oldPoints, totalPoints[_participants[i]]);
        }

        require(totalPointsUsed <= pointsPerJudge, "Exceeds points per judge limit");

        hasVoted[msg.sender] = true;

        emit VotesSubmitted(msg.sender, _participants, _points);
    }

    // ============ JUDGE MANAGEMENT ============

    /**
     * @dev Add a judge to the voting system
     * @param _judge Address of the judge to add
     */
    function addJudge(address _judge) external override {
        require(_judge != address(0), "Invalid judge address");
        require(!isJudge[_judge], "Judge already exists");

        _addJudge(_judge);
    }

    /**
     * @dev Remove a judge from the voting system
     * @param _judge Address of the judge to remove
     */
    function removeJudge(address _judge) external override {
        require(isJudge[_judge], "Judge does not exist");
        require(!hasVoted[_judge], "Cannot remove judge who has voted");

        _removeJudge(_judge);
    }

    /**
     * @dev Internal function to add a judge
     */
    function _addJudge(address _judge) internal {
        isJudge[_judge] = true;
        judges.push(_judge);
        totalJudges++;

        emit JudgeAdded(_judge);
    }

    /**
     * @dev Internal function to remove a judge
     */
    function _removeJudge(address _judge) internal {
        isJudge[_judge] = false;

        // Remove from judges array
        for (uint256 i = 0; i < judges.length; i++) {
            if (judges[i] == _judge) {
                judges[i] = judges[judges.length - 1];
                judges.pop();
                break;
            }
        }

        totalJudges--;

        emit JudgeRemoved(_judge);
    }

    // ============ WINNER TRACKING (O(1) Operations) ============

    /**
     * @dev Update winner list dynamically based on participant's new points
     * @param _participant Address of the participant whose points changed
     * @param _oldPoints Previous total points
     * @param _newPoints New total points
     */
    function _updateWinnerList(
        address _participant,
        uint256 _oldPoints,
        uint256 _newPoints
    ) internal {
        uint256 currentPosition = winnerPosition[_participant];

        // If participant was already a winner
        if (currentPosition > 0) {
            _adjustWinnerPosition(_participant, _oldPoints, _newPoints);
            return;
        }

        // Check if participant should be added to winners
        if (_newPoints > 0 && (winners.length < maxWinners || _newPoints > totalPoints[_getLowestWinner()])) {
            _addNewWinner(_participant);
        }
    }

    /**
     * @dev Adjust position of existing winner based on new points
     */
    function _adjustWinnerPosition(
        address _participant,
        uint256 _oldPoints,
        uint256 _newPoints
    ) internal {
        uint256 currentPosition = winnerPosition[_participant];

        if (_newPoints > _oldPoints) {
            _moveWinnerUp(_participant, currentPosition);
        } else if (_newPoints < _oldPoints) {
            _moveWinnerDown(_participant, currentPosition);
        }
    }

    /**
     * @dev Move winner up in rankings
     */
    function _moveWinnerUp(address _participant, uint256 currentPosition) internal {
        uint256 newPosition = currentPosition;

        // Find correct position by comparing with winners above
        for (uint256 i = currentPosition - 1; i > 0; i--) {
            if (totalPoints[_participant] > totalPoints[winners[i - 1]]) {
                newPosition = i;
            } else {
                break;
            }
        }

        if (newPosition != currentPosition) {
            _swapWinners(_participant, currentPosition, newPosition);
        }
    }

    /**
     * @dev Move winner down in rankings or remove if no longer in top
     */
    function _moveWinnerDown(address _participant, uint256 currentPosition) internal {
        uint256 newPosition = currentPosition;

        // Find correct position by comparing with winners below
        for (uint256 i = currentPosition; i < winners.length; i++) {
            if (totalPoints[_participant] < totalPoints[winners[i]]) {
                newPosition = i + 1;
            } else {
                break;
            }
        }

        // If moved beyond max winners, remove from winners
        if (newPosition > maxWinners) {
            _removeWinner(_participant, currentPosition);
        } else if (newPosition != currentPosition) {
            _swapWinners(_participant, currentPosition, newPosition);
        }
    }

    /**
     * @dev Add new winner to the list
     */
    function _addNewWinner(address _participant) internal {
        if (winners.length < maxWinners) {
            // Add to end if we have space
            winners.push(_participant);
            winnerPosition[_participant] = winners.length;
            _moveWinnerUp(_participant, winners.length);
        } else {
            // Replace the lowest winner
            address lowestWinner = _getLowestWinner();
            uint256 lowestPosition = winnerPosition[lowestWinner];
            _removeWinner(lowestWinner, lowestPosition);
            _addNewWinner(_participant);
        }
    }

    /**
     * @dev Remove winner from the list
     */
    function _removeWinner(address _participant, uint256 position) internal {
        // Move last winner to this position
        if (position < winners.length) {
            address lastWinner = winners[winners.length - 1];
            winners[position - 1] = lastWinner;
            winnerPosition[lastWinner] = position;
            winners.pop();
        }

        winnerPosition[_participant] = 0;

        emit WinnerUpdated(_participant, position, 0);
    }

    /**
     * @dev Swap two winners in the rankings
     */
    function _swapWinners(address _participant, uint256 fromPosition, uint256 toPosition) internal {
        if (fromPosition != toPosition) {
            // Update positions
            winnerPosition[_participant] = toPosition;
            winnerPosition[winners[toPosition - 1]] = fromPosition;

            // Swap in array
            address temp = winners[fromPosition - 1];
            winners[fromPosition - 1] = winners[toPosition - 1];
            winners[toPosition - 1] = temp;

            emit WinnerUpdated(_participant, fromPosition, toPosition);
        }
    }

    /**
     * @dev Get the lowest winner (last in winners array)
     */
    function _getLowestWinner() internal view returns (address) {
        if (winners.length == 0) return address(0);
        return winners[winners.length - 1];
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get current winners in order
     */
    function getWinners() external view override returns (address[] memory) {
        return winners;
    }

    /**
     * @dev Get participant's current total points
     */
    function getParticipantPoints(address _participant) external view override returns (uint256) {
        return totalPoints[_participant];
    }

    /**
     * @dev Get participant's current ranking position
     */
    function getParticipantRanking(address _participant) external view override returns (uint256) {
        return winnerPosition[_participant];
    }

    /**
     * @dev Check if a judge has voted
     */
    function hasJudgeVoted(address _judge) external view override returns (bool) {
        return hasVoted[_judge];
    }

    /**
     * @dev Get voting statistics
     */
    function getVotingStats() external view override returns (
        uint256 _totalJudges,
        uint256 _votedJudges,
        uint256 _totalParticipants
    ) {
        _totalJudges = totalJudges;

        uint256 votedCount = 0;
        uint256 participantsCount = 0;

        for (uint256 i = 0; i < judges.length; i++) {
            if (hasVoted[judges[i]]) {
                votedCount++;
            }
        }

        _votedJudges = votedCount;

        // Count participants with points
        for (uint256 i = 0; i < judges.length; i++) {
            for (uint256 j = 0; j < judges.length; j++) {
                if (judgeVotes[judges[i]][judges[j]] > 0) {
                    participantsCount++;
                }
            }
        }

        _totalParticipants = participantsCount;
    }

    /**
     * @dev Get the number of current winners
     */
    function getWinnerCount() external view override returns (uint256) {
        return winners.length;
    }

    /**
     * @dev Get winner at specific position
     */
    function getWinnerAtPosition(uint256 _position) external view override returns (address) {
        require(_position > 0 && _position <= winners.length, "Invalid position");
        return winners[_position - 1];
    }

    /**
     * @dev Check if participant is currently a winner
     */
    function isWinner(address _participant) external view override returns (bool) {
        return winnerPosition[_participant] > 0;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Set voting deadline (called by hackathon contract)
     */
    function setVotingDeadline(uint256 _deadline) external {
        require(votingDeadline == 0, "Deadline already set");
        votingDeadline = _deadline;
    }
}
