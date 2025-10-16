// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract VotingSystem {

    uint256[] public prizeDistribution;
    uint256 public pointsPerJudge;

    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public totalPoints;
    mapping(address => mapping(address => uint256)) public judgeVotes;

    uint256 public votingDeadline;

    bool public votingOpen;
    uint256 public votingEndTime;

    uint256 public prizeClaimCooldown;
    mapping(address => bool) public hasClaimedPrize;

    // Dynamic winner tracking - updated on each vote
    mapping(address => uint256) public winnerPosition; // 0 = not a winner, 1+ = position (1-indexed)
    address[] public winners; // Array of winners in order (1st, 2nd, 3rd, etc.)
    uint256 public maxWinners; // Maximum number of winners (from prize distribution length)

    event JudgeVoted(
        address indexed judge,
        address indexed participant,
        uint256 points
    );

    event VotingOpened(
        uint256 deadline
    );


    event PrizeClaimed(
        address indexed winner,
        uint256 amount
    );

    event WinnerAdded(
        address indexed participant,
        uint256 position
    );

    event WinnerRemoved(
        address indexed participant
    );


    /**
     * @notice Vote for a participant's submission
     * @dev Internal function for judges to allocate points to participants and update winner list
     * @param _participant Address of the participant to vote for
     * @param _points Number of points to allocate (max 100 per judge)
     */
    function _voteForSubmission(
        address _participant,
        uint256 _points
    )
        internal
    {
        require(
            votingOpen,
            "Voting is not open"
        );

        require(
            block.timestamp <= votingDeadline,
            "Voting deadline has passed"
        );

        require(
            _points <= pointsPerJudge,
            "Cannot allocate more than 100 points"
        );

        require(
            hasVoted[msg.sender] == false,
            "Judge has already voted"
        );

        // Store old points for comparison
        uint256 oldPoints = totalPoints[_participant];

        // Add points to participant's total
        totalPoints[_participant] += _points;
        judgeVotes[msg.sender][_participant] = _points;
        hasVoted[msg.sender] = true;

        // Update winner list based on new points
        _updateWinnerList(
            _participant,
            oldPoints,
            totalPoints[_participant]
        );

        emit JudgeVoted(
            msg.sender,
            _participant,
            _points
        );
    }


    /**
     * @notice Update winner list dynamically based on participant's new points
     * @dev Maintains a sorted list of top performers without sorting all participants
     * @param _participant Address of the participant whose points changed
     * @param _oldPoints Previous total points
     * @param _newPoints New total points
     */
    function _updateWinnerList(
        address _participant,
        uint256 _oldPoints,
        uint256 _newPoints
    )
        internal
    {
        uint256 currentPosition = winnerPosition[
            _participant
        ];

        // If participant was already a winner
        if (currentPosition > 0) {

            // Check if they should be moved up or down in rankings
            _adjustWinnerPosition(
                _participant,
                _oldPoints,
                _newPoints
            );

            return;
        }

        if (_newPoints > 0 && (winners.length < maxWinners || _newPoints > totalPoints[_getLowestWinner()])) {
            _addNewWinner(
                _participant
            );
        }
    }

    /**
     * @notice Adjust position of existing winner based on new points
     * @dev Moves winner up or down in the rankings as needed
     */
    function _adjustWinnerPosition(
        address _participant,
        uint256 _oldPoints,
        uint256 _newPoints
    )
        internal
    {
        uint256 currentPosition = winnerPosition[
            _participant
        ];

        // If points increased, try to move up
        if (_newPoints > _oldPoints) {
            _moveWinnerUp(
                _participant,
                currentPosition
            );

            return;
        }

        if (_newPoints < _oldPoints) {
            _moveWinnerDown(
                _participant,
                currentPosition
            );
        }
    }

    /**
     * @notice Move winner up in rankings
     */
    function _moveWinnerUp(
        address _participant,
        uint256 currentPosition
    )
        internal
    {
        uint256 newPosition = currentPosition;

        // Find the correct position by comparing with winners above
        for (uint256 i = currentPosition - 1; i > 0; i--) {
            if (totalPoints[_participant] > totalPoints[winners[i - 1]]) {
                newPosition = i;
            } else {
                break;
            }
        }

        if (newPosition != currentPosition) {
            _swapWinners(
                _participant,
                currentPosition,
                newPosition
            );
        }
    }

    /**
     * @notice Move winner down in rankings or remove if no longer in top
     */
    function _moveWinnerDown(address _participant, uint256 currentPosition) internal {
        uint256 newPosition = currentPosition;

        // Find the correct position by comparing with winners below
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
     * @notice Add new winner to the list
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
     * @notice Remove winner from the list
     */
    function _removeWinner(address _participant, uint256 position) internal {
        // Move last winner to this position
        if (winners.length > 1) {
            address lastWinner = winners[winners.length - 1];
            winners[position - 1] = lastWinner;
            winnerPosition[lastWinner] = position;
        }

        // Remove from array
        winners.pop();
        winnerPosition[_participant] = 0;

        emit WinnerRemoved(
            _participant
        );
    }

    /**
     * @notice Swap two winners in the list
     */
    function _swapWinners(address _participant, uint256 fromPosition, uint256 toPosition) internal {
        address otherParticipant = winners[toPosition - 1];

        // Swap in array
        winners[fromPosition - 1] = otherParticipant;
        winners[toPosition - 1] = _participant;

        // Update positions
        winnerPosition[_participant] = toPosition;
        winnerPosition[otherParticipant] = fromPosition;

        emit WinnerAdded(_participant, toPosition);
    }

    /**
     * @notice Get the winner with the lowest points
     */
    function _getLowestWinner()
        internal
        view
        returns (address)
    {
        require(
            winners.length > 0,
            "No winners"
        );

        return winners[
            winners.length - 1
        ];
    }

    /**
     * @notice Check if voting has ended (either manually closed or deadline passed)
     * @dev Automatically determines if voting should be considered ended
     * @return True if voting has ended, false otherwise
     */
    function _isVotingEnded()
    internal
    view
    returns (bool)
    {
        // If manually closed, voting has ended
        if (!votingOpen) {
            return true;
        }
        // If deadline has passed, voting has ended
        if (block.timestamp > votingDeadline) {
            return true;
        }
        return false;
    }

    /**
     * @notice Get the actual voting end time
     * @dev Returns the time when voting actually ended (manual close or deadline)
     * @return Timestamp when voting ended
     */
    function _getVotingEndTime() internal view returns (uint256) {
        // If manually closed, return the recorded end time
        if (!votingOpen && votingEndTime > 0) {
            return votingEndTime;
        }
        // If deadline passed but not manually closed, return deadline
        if (block.timestamp > votingDeadline) {
            return votingDeadline;
        }
        // Voting is still active
        return 0;
    }



    /**
     * @notice Check if a participant is a winner
     * @dev Uses pre-determined winners for O(1) lookup
     * @param _participant Address of the participant to check
     * @return True if the participant is a winner, false otherwise
     */
    function _isWinner(
        address _participant
    )
        internal
        view
        returns (bool)
    {
        return winnerPosition[_participant] > 0;
    }


    /**
     * @notice Get prize amount for a participant based on their ranking
     * @dev Determines the participant's position and returns the exact prize amount from the distribution array
     * @param _participant Address of the participant
     * @return Prize amount for the participant
     */
    function _getPrizeAmount(
        address _participant
    )
        internal
        view
        returns (uint256)
    {
        uint256 position = winnerPosition[
            _participant
        ];

        if (position == 0) {
            return 0; // Not a winner
        }

        // Convert to 0-indexed for array access
        uint256 arrayIndex = position - 1;

        // Check if position is within prize distribution range
        if (arrayIndex >= prizeDistribution.length) {
            return 0;
        }

        // Return exact prize amount from the distribution array
        return prizeDistribution[
            arrayIndex
        ];
    }

    /**
     * @notice Claim prize for a winner
     * @dev Internal function to handle prize claiming with cooldown and winner validation
     * @param _participant Address of the participant claiming the prize
     */
    function _claimPrize(
        address _participant,
        uint256 /* _totalPrizePool */
    )
        internal
    {
        require(!hasClaimedPrize[_participant], "Prize already claimed");
        require(_isWinner(_participant), "Not a winner");

        uint256 prizeAmount = _getPrizeAmount(_participant);
        hasClaimedPrize[_participant] = true;
        payable(_participant).transfer(prizeAmount);

        emit PrizeClaimed(_participant, prizeAmount);
    }

    // Getter functions

    /**
     * @notice Get the maximum number of winners based on prize distribution
     * @return Maximum number of winners that can be selected
     */
    function getMaxWinners()
        external
        view
        returns (uint256)
    {
        return maxWinners;
    }

    /**
     * @notice Get the prize distribution array
     * @return Array defining how the prize pool is distributed among winners
     */
    function getPrizeDistribution()
        external
        view
        returns (uint256[] memory)
    {
        return prizeDistribution;
    }

    /**
     * @notice Get the points each judge can distribute
     * @return Maximum points each judge can allocate
     */
    function getPointsPerJudge()
        external
        view
        returns (uint256)
    {
        return pointsPerJudge;
    }

    /**
     * @notice Get total points received by a participant
     * @param _participant Address of the participant
     * @return Total points received by the participant
     */
    function getTotalPoints(
        address _participant
    )
        external
        view
        returns (uint256)
    {
        return totalPoints[
            _participant
        ];
    }

    /**
     * @notice Get all winners in order
     * @return Array of winner addresses in ranking order
     */
    function getWinners()
        external
        view
        returns (address[] memory)
    {
        return winners;
    }

    /**
     * @notice Get winner position for a participant
     * @param _participant Address of the participant
     * @return Position (1-indexed, 0 if not a winner)
     */
    function getWinnerPosition(
        address _participant
    )
        external
        view
        returns (uint256)
    {
        return winnerPosition[
            _participant
        ];
    }

    /**
     * @notice Get the voting deadline timestamp
     * @return Timestamp when voting period ends
     */
    function getVotingDeadline()
        external
        view
        returns (uint256)
    {
        return votingDeadline;
    }

    /**
     * @notice Get the voting end time timestamp
     * @return Timestamp when voting actually ended (manual close or deadline)
     */
    function getVotingEndTime()
        external
        view
        returns (uint256)
    {
        return _getVotingEndTime();
    }

    /**
     * @notice Check if voting is currently open
     * @return True if voting is open and deadline not passed, false otherwise
     */
    function isVotingOpen()
        external
        view
        returns (bool)
    {
        return votingOpen && block.timestamp <= votingDeadline;
    }

    /**
     * @notice Get the prize claim cooldown period
     * @return Cooldown period in seconds
     */
    function getPrizeClaimCooldown()
        external
        view
        returns (uint256)
    {
        return prizeClaimCooldown;
    }

    /**
     * @notice Check if a participant has claimed their prize
     * @param _participant Address of the participant
     * @return True if prize has been claimed, false otherwise
     */
    function hasParticipantClaimedPrize(
        address _participant
    )
        external
        view
        returns (bool)
    {
        return hasClaimedPrize[_participant];
    }
}
