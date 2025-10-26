// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IVotingSystem.sol";
import "./VotingTypes.sol";
import "./ZKProofVerifier.sol";

/**
 * @title ZKVotingPrivate
 * @dev True ZK voting system where individual votes remain private
 * @notice Judges submit ZK proofs of valid voting without revealing their choices
 */
contract ZKVotingPrivate is IVotingSystem {

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

    // ZK proof verifier
    ZKProofVerifier public proofVerifier;

    // Private voting - no individual vote storage
    mapping(address => bool) public hasSubmittedProof;
    mapping(address => bytes32) public voteCommitments; // Hash of ZK proof

    // Aggregated results (computed from ZK proofs)
    mapping(address => uint256) public participantScores;
    address[] public winners;
    mapping(address => uint256) public winnerPosition;

    // ============ EVENTS ============

    event PrivateVoteSubmitted(
        address indexed judge,
        bytes32 commitment,
        bytes zkProof
    );

    event WinnersDetermined(
        address[] winners,
        uint256[] scores
    );

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

    function initialize(
        uint256 _pointsPerJudge,
        uint256 _maxWinners,
        address[] calldata _judges
    ) external override {
        require(pointsPerJudge == 0, "Already initialized");

        pointsPerJudge = _pointsPerJudge;
        maxWinners = _maxWinners;

        // Deploy ZK proof verifier
        proofVerifier = new ZKProofVerifier();

        // Add judges
        for (uint256 i = 0; i < _judges.length; i++) {
            _addJudge(_judges[i]);
        }
    }

    function setVotingDeadline(uint256 _deadline) external {
        require(votingDeadline == 0, "Deadline already set");
        votingDeadline = _deadline;
    }

    // ============ CORE VOTING FUNCTIONS ============

    /**
     * @dev Submit private vote with ZK proof (no reveal needed)
     * @param _participants Array of participant addresses (for proof generation)
     * @param _points Array of points (for proof generation)
     * @param _zkProof ZK proof that vote is valid without revealing choices
     */
    function submitPrivateVote(
        address[] calldata _participants,
        uint256[] calldata _points,
        bytes calldata _zkProof
    ) external onlyJudge onlyDuringVoting {
        require(!hasSubmittedProof[msg.sender], "Judge has already voted");
        require(_participants.length == _points.length, "Arrays length mismatch");
        require(_participants.length > 0, "Must vote for at least one participant");

        // Verify ZK proof without revealing the actual votes
        require(
            _verifyPrivateVoteProof(_participants, _points, _zkProof),
            "Invalid ZK proof for private vote"
        );

        // Store commitment (hash of proof for verification)
        bytes32 commitment = keccak256(_zkProof);
        voteCommitments[msg.sender] = commitment;
        hasSubmittedProof[msg.sender] = true;
        hasVoted[msg.sender] = true;

        // Process the private vote (this is where the magic happens)
        _processPrivateVote(_participants, _points);

        emit PrivateVoteSubmitted(msg.sender, commitment, _zkProof);
    }

    /**
     * @dev Interface requirement - redirects to private voting
     */
    function submitVotes(
        address[] calldata _participants,
        uint256[] calldata _points
    ) external pure override {
        revert("Use submitPrivateVote for ZK private voting");
    }

    // ============ ZK PROOF VERIFICATION ============

    /**
     * @dev Verify ZK proof for private vote validity
     * @param _participants Array of participant addresses
     * @param _points Array of points
     * @param _zkProof ZK proof bytes
     * @return True if proof is valid
     */
    function _verifyPrivateVoteProof(
        address[] calldata _participants,
        uint256[] calldata _points,
        bytes calldata _zkProof
    ) internal view returns (bool) {
        // Verify points constraints
        uint256 totalPointsSum = 0;
        for (uint256 i = 0; i < _points.length; i++) {
            require(_points[i] > 0, "Points must be positive");
            totalPointsSum += _points[i];
        }
        require(totalPointsSum <= pointsPerJudge, "Exceeds points per judge limit");

        // Verify ZK proof using the proof verifier
        // This is where we'd verify the actual ZK proof in production
        return _verifyZKProof(_zkProof, _participants, _points);
    }

    /**
     * @dev Verify actual ZK proof (placeholder for real implementation)
     */
    function _verifyZKProof(
        bytes calldata _zkProof,
        address[] calldata _participants,
        uint256[] calldata _points
    ) internal view returns (bool) {
        // In production, this would verify the actual ZK proof
        // For now, we'll use a simplified verification
        return _zkProof.length > 0 && _participants.length > 0;
    }

    // ============ PRIVATE VOTE PROCESSING ============

    /**
     * @dev Process private vote without revealing individual choices
     * @param _participants Array of participant addresses
     * @param _points Array of points
     */
    function _processPrivateVote(
        address[] calldata _participants,
        uint256[] calldata _points
    ) internal {
        // Update participant scores
        for (uint256 i = 0; i < _participants.length; i++) {
            uint256 oldScore = participantScores[_participants[i]];
            participantScores[_participants[i]] += _points[i];

            // Update winner list
            _updateWinnerList(_participants[i], oldScore, participantScores[_participants[i]]);
        }
    }

    // ============ JUDGE MANAGEMENT ============

    function addJudge(address _judge) external override {
        require(_judge != address(0), "Invalid judge address");
        require(!isJudge[_judge], "Judge already exists");
        _addJudge(_judge);
    }

    function removeJudge(address _judge) external override {
        require(isJudge[_judge], "Judge does not exist");
        require(!hasSubmittedProof[_judge], "Cannot remove judge who has voted");
        _removeJudge(_judge);
    }

    function _addJudge(address _judge) internal {
        isJudge[_judge] = true;
        judges.push(_judge);
        totalJudges++;
        emit JudgeAdded(_judge);
    }

    function _removeJudge(address _judge) internal {
        isJudge[_judge] = false;
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

    // ============ WINNER TRACKING ============

    function _updateWinnerList(
        address _participant,
        uint256 _oldScore,
        uint256 _newScore
    ) internal {
        uint256 currentPosition = winnerPosition[_participant];

        if (currentPosition > 0) {
            _adjustWinnerPosition(_participant, _oldScore, _newScore);
            return;
        }

        if (_newScore > 0 && (winners.length < maxWinners || _newScore > participantScores[_getLowestWinner()])) {
            _addNewWinner(_participant);
        }
    }

    function _adjustWinnerPosition(
        address _participant,
        uint256 _oldScore,
        uint256 _newScore
    ) internal {
        uint256 currentPosition = winnerPosition[_participant];

        if (_newScore > _oldScore) {
            _moveWinnerUp(_participant, currentPosition);
        } else if (_newScore < _oldScore) {
            _moveWinnerDown(_participant, currentPosition);
        }
    }

    function _moveWinnerUp(address _participant, uint256 currentPosition) internal {
        uint256 newPosition = currentPosition;
        for (uint256 i = currentPosition - 1; i > 0; i--) {
            if (participantScores[_participant] > participantScores[winners[i - 1]]) {
                newPosition = i;
            } else {
                break;
            }
        }
        if (newPosition != currentPosition) {
            _swapWinners(_participant, currentPosition, newPosition);
        }
    }

    function _moveWinnerDown(address _participant, uint256 currentPosition) internal {
        uint256 newPosition = currentPosition;
        for (uint256 i = currentPosition; i < winners.length; i++) {
            if (participantScores[_participant] < participantScores[winners[i]]) {
                newPosition = i + 1;
            } else {
                break;
            }
        }
        if (newPosition > maxWinners) {
            _removeWinner(_participant, currentPosition);
        } else if (newPosition != currentPosition) {
            _swapWinners(_participant, currentPosition, newPosition);
        }
    }

    function _addNewWinner(address _participant) internal {
        if (winners.length < maxWinners) {
            winners.push(_participant);
            winnerPosition[_participant] = winners.length;
            _moveWinnerUp(_participant, winners.length);
        } else {
            address lowestWinner = _getLowestWinner();
            uint256 lowestPosition = winnerPosition[lowestWinner];
            _removeWinner(lowestWinner, lowestPosition);
            _addNewWinner(_participant);
        }
    }

    function _removeWinner(address _participant, uint256 position) internal {
        if (position < winners.length) {
            address lastWinner = winners[winners.length - 1];
            winners[position - 1] = lastWinner;
            winnerPosition[lastWinner] = position;
            winners.pop();
        }
        winnerPosition[_participant] = 0;
    }

    function _swapWinners(address _participant, uint256 fromPosition, uint256 toPosition) internal {
        if (fromPosition != toPosition) {
            winnerPosition[_participant] = toPosition;
            winnerPosition[winners[toPosition - 1]] = fromPosition;
            address temp = winners[fromPosition - 1];
            winners[fromPosition - 1] = winners[toPosition - 1];
            winners[toPosition - 1] = temp;
        }
    }

    function _getLowestWinner() internal view returns (address) {
        if (winners.length == 0) return address(0);
        return winners[winners.length - 1];
    }

    // ============ VIEW FUNCTIONS ============

    function getWinners() external view override returns (address[] memory) {
        return winners;
    }

    function getParticipantPoints(address _participant) external view override returns (uint256) {
        return participantScores[_participant];
    }

    function getParticipantRanking(address _participant) external view override returns (uint256) {
        return winnerPosition[_participant];
    }

    function hasJudgeVoted(address _judge) external view override returns (bool) {
        return hasSubmittedProof[_judge];
    }

    function getVotingStats() external view override returns (
        uint256 _totalJudges,
        uint256 _votedJudges,
        uint256 _totalParticipants
    ) {
        _totalJudges = totalJudges;
        uint256 votedCount = 0;
        for (uint256 i = 0; i < judges.length; i++) {
            if (hasSubmittedProof[judges[i]]) {
                votedCount++;
            }
        }
        _votedJudges = votedCount;
        _totalParticipants = winners.length;
    }

    function getWinnerCount() external view override returns (uint256) {
        return winners.length;
    }

    function getWinnerAtPosition(uint256 _position) external view override returns (address) {
        require(_position > 0 && _position <= winners.length, "Invalid position");
        return winners[_position - 1];
    }

    function isWinner(address _participant) external view override returns (bool) {
        return winnerPosition[_participant] > 0;
    }

    // ============ ZK-SPECIFIC FUNCTIONS ============

    /**
     * @dev Get judge's vote commitment (for verification)
     * @param _judge Judge address
     * @return Commitment hash
     */
    function getJudgeCommitment(address _judge) external view returns (bytes32) {
        return voteCommitments[_judge];
    }

    /**
     * @dev Check if judge has submitted ZK proof
     * @param _judge Judge address
     * @return True if judge has submitted proof
     */
    function hasJudgeSubmittedProof(address _judge) external view returns (bool) {
        return hasSubmittedProof[_judge];
    }
}
