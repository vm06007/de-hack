// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IVotingSystem.sol";
import "./VotingTypes.sol";
import "./ZKProofVerifier.sol";

/**
 * @title ZKVotingSystem
 * @dev ZK voting system with batch voting support
 * @notice Judges can vote for multiple participants in one transaction with ZK proofs
 */
contract ZKVotingSystem is IVotingSystem {

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

    // Batch vote commitments
    mapping(address => bytes32) public batchCommitments;
    mapping(address => bool) public hasCommitted;

    // Batch vote reveals
    mapping(address => address[]) public revealedParticipants;
    mapping(address => uint256[]) public revealedPoints;
    mapping(address => uint256) public revealedNonces;
    mapping(address => bool) public hasRevealed;

    // Participant scoring (only after reveal)
    mapping(address => uint256) public totalPoints;
    mapping(address => mapping(address => uint256)) public judgeVotes;

    // Dynamic winner tracking
    mapping(address => uint256) public winnerPosition;
    address[] public winners;

    // ============ EVENTS ============

    event BatchVotesCommitted(
        address indexed judge,
        bytes32 commitment
    );

    event BatchVotesRevealed(
        address indexed judge,
        address[] participants,
        uint256[] points,
        bytes zkProof
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

    /**
     * @dev Initialize the voting system
     */
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

    /**
     * @dev Set voting deadline (called by Hackathon contract)
     */
    function setVotingDeadline(uint256 _deadline) external {
        require(votingDeadline == 0, "Deadline already set");
        votingDeadline = _deadline;
    }

    // ============ CORE VOTING FUNCTIONS ============

    /**
     * @dev Submit votes for multiple participants (interface requirement)
     */
    function submitVotes(
        address[] calldata /* _participants */,
        uint256[] calldata /* _points */
    ) external pure override {
        // This function signature is required by interface but ZK uses commit-reveal
        revert("Use commitBatchVotes and revealBatchVotes for ZK voting");
    }

    /**
     * @dev Commit batch votes for multiple participants
     * @param _participants Array of participant addresses
     * @param _points Array of points for each participant
     * @param _nonce Random nonce for commitment
     */
    function commitBatchVotes(
        address[] calldata _participants,
        uint256[] calldata _points,
        uint256 _nonce
    ) external onlyJudge onlyDuringVoting {
        require(_participants.length == _points.length, "Arrays length mismatch");
        require(_participants.length > 0, "Must vote for at least one participant");
        require(!hasCommitted[msg.sender], "Judge has already committed");

        // Validate points
        uint256 totalPointsUsed = 0;
        for (uint256 i = 0; i < _participants.length; i++) {
            require(_points[i] > 0, "Points must be greater than 0");
            totalPointsUsed += _points[i];
        }
        require(totalPointsUsed <= pointsPerJudge, "Exceeds points per judge limit");

        // Create batch commitment
        bytes32 commitment = keccak256(abi.encodePacked(
            msg.sender,
            _participants,
            _points,
            _nonce
        ));

        batchCommitments[msg.sender] = commitment;
        hasCommitted[msg.sender] = true;

        emit BatchVotesCommitted(msg.sender, commitment);
    }

    /**
     * @dev Reveal batch votes with ZK proof
     * @param _participants Array of participant addresses
     * @param _points Array of points for each participant
     * @param _nonce Nonce used in commitment
     * @param _zkProof ZK proof for batch vote validity
     */
    function revealBatchVotes(
        address[] calldata _participants,
        uint256[] calldata _points,
        uint256 _nonce,
        bytes calldata _zkProof
    ) external onlyJudge {
        require(hasCommitted[msg.sender], "Must commit votes first");
        require(!hasRevealed[msg.sender], "Judge has already revealed");
        require(_participants.length == _points.length, "Arrays length mismatch");

        // Verify commitment
        bytes32 expectedCommitment = keccak256(abi.encodePacked(
            msg.sender,
            _participants,
            _points,
            _nonce
        ));
        require(batchCommitments[msg.sender] == expectedCommitment, "Commitment mismatch");

        // Verify ZK proof for batch vote validity
        require(
            verifyBatchVoteProof(_zkProof, _participants, _points),
            "Invalid ZK proof for batch vote"
        );

        // Process revealed votes
        uint256 totalPointsUsed = 0;

        for (uint256 i = 0; i < _participants.length; i++) {
            require(_points[i] > 0, "Points must be greater than 0");
            totalPointsUsed += _points[i];

            // Update participant's total points
            uint256 oldPoints = totalPoints[_participants[i]];
            totalPoints[_participants[i]] += _points[i];

            // Store judge's vote
            judgeVotes[msg.sender][_participants[i]] = _points[i];

            // Update winner list
            _updateWinnerList(_participants[i], oldPoints, totalPoints[_participants[i]]);
        }

        require(totalPointsUsed <= pointsPerJudge, "Exceeds points per judge limit");

        // Store revealed data
        revealedParticipants[msg.sender] = _participants;
        revealedPoints[msg.sender] = _points;
        revealedNonces[msg.sender] = _nonce;
        hasRevealed[msg.sender] = true;

        emit BatchVotesRevealed(msg.sender, _participants, _points, _zkProof);
    }

    // ============ ZK PROOF VERIFICATION ============

    /**
     * @dev Verify ZK proof for batch vote validity
     * @param _zkProof ZK proof bytes
     * @param _points Array of points for each participant
     * @return True if proof is valid
     */
    function verifyBatchVoteProof(
        bytes calldata _zkProof,
        address[] calldata /* _participants */,
        uint256[] calldata _points
    ) internal view returns (bool) {
        // Verify that sum of points doesn't exceed limit
        uint256 totalPointsSum = 0;
        for (uint256 i = 0; i < _points.length; i++) {
            totalPointsSum += _points[i];
        }

        if (totalPointsSum > pointsPerJudge) {
            return false;
        }

        // Verify all points are positive
        for (uint256 i = 0; i < _points.length; i++) {
            if (_points[i] == 0) {
                return false;
            }
        }

        // Verify ZK proof using the proof verifier
        // In a real implementation, this would verify the actual ZK proof
        // For now, we'll use a simplified verification
        return _verifySimplifiedBatchProof(_zkProof, _points);
    }

    /**
     * @dev Simplified batch proof verification (for demonstration)
     */
    function _verifySimplifiedBatchProof(
        bytes calldata _zkProof,
        uint256[] calldata /* _points */
    ) internal pure returns (bool) {
        // Simplified verification - in production, this would verify actual ZK proof
        // For now, just check that proof is not empty
        return _zkProof.length > 0;
    }

    // ============ JUDGE MANAGEMENT ============

    function addJudge(address _judge) external override {
        require(_judge != address(0), "Invalid judge address");
        require(!isJudge[_judge], "Judge already exists");

        _addJudge(_judge);
    }

    function removeJudge(address _judge) external override {
        require(isJudge[_judge], "Judge does not exist");
        require(!hasCommitted[_judge], "Cannot remove judge who has committed");

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

    // ============ WINNER TRACKING (Same as OpenVoting) ============

    function _updateWinnerList(
        address _participant,
        uint256 _oldPoints,
        uint256 _newPoints
    ) internal {
        uint256 currentPosition = winnerPosition[_participant];

        if (currentPosition > 0) {
            _adjustWinnerPosition(_participant, _oldPoints, _newPoints);
            return;
        }

        if (_newPoints > 0 && (winners.length < maxWinners || _newPoints > totalPoints[_getLowestWinner()])) {
            _addNewWinner(_participant);
        }
    }

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

    function _moveWinnerUp(address _participant, uint256 currentPosition) internal {
        uint256 newPosition = currentPosition;

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

    function _moveWinnerDown(address _participant, uint256 currentPosition) internal {
        uint256 newPosition = currentPosition;

        for (uint256 i = currentPosition; i < winners.length; i++) {
            if (totalPoints[_participant] < totalPoints[winners[i]]) {
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
        return totalPoints[_participant];
    }

    function getParticipantRanking(address _participant) external view override returns (uint256) {
        return winnerPosition[_participant];
    }

    function hasJudgeVoted(address _judge) external view override returns (bool) {
        return hasRevealed[_judge];
    }

    function getVotingStats() external view override returns (
        uint256 _totalJudges,
        uint256 _votedJudges,
        uint256 _totalParticipants
    ) {
        _totalJudges = totalJudges;

        uint256 votedCount = 0;
        for (uint256 i = 0; i < judges.length; i++) {
            if (hasRevealed[judges[i]]) {
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

    // ============ ADMIN FUNCTIONS ============


    // ============ ZK-SPECIFIC FUNCTIONS ============

    /**
     * @dev Generate commitment hash for batch votes
     * @param _judge Judge address
     * @param _participants Array of participant addresses
     * @param _points Array of points
     * @param _nonce Random nonce
     * @return Commitment hash
     */
    function generateBatchCommitment(
        address _judge,
        address[] calldata _participants,
        uint256[] calldata _points,
        uint256 _nonce
    )
        external
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                _judge,
                _participants,
                _points,
                _nonce
            )
        );
    }

    /**
     * @dev Get judge's revealed votes
     * @param _judge Judge address
     * @return participants Array of participant addresses
     * @return points Array of points
     */
    function getJudgeRevealedVotes(
        address _judge
    )
        external
        view
        returns (
            address[] memory participants,
            uint256[] memory points
    ) {
        require(
            hasRevealed[_judge],
            "Judge has not revealed votes"
        );

        return (
            revealedParticipants[_judge],
            revealedPoints[_judge]
        );
    }

    /**
     * @dev Check if judge has committed votes
     * @param _judge Judge address
     * @return True if judge has committed
     */
    function hasJudgeCommitted(
        address _judge
    )
        external
        view
        returns (bool)
    {
        return hasCommitted[_judge];
    }

    /**
     * @dev Get judge's commitment
     * @param _judge Judge address
     * @return Commitment hash
     */
    function getJudgeCommitment(
        address _judge
    )
        external
        view
        returns (bytes32)
    {
        return batchCommitments[_judge];
    }
}
