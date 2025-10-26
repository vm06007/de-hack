// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IVotingSystem.sol";
import "./VotingTypes.sol";
import "./ZKProofVerifier.sol";

/**
 * @title MACIVoting
 * @dev MACI-based voting system for true privacy
 * @notice Judges submit encrypted votes anonymously, results computed without revealing individual choices
 */
contract MACIVoting is IVotingSystem {

    // ============ STATE VARIABLES ============

    // Voting configuration
    uint256 public pointsPerJudge;
    uint256 public maxWinners;
    uint256 public votingDeadline;
    uint256 public submissionDeadline;

    // Judge management
    mapping(address => bool) public isJudge;
    address[] public judges;
    uint256 public totalJudges;

    // MACI-specific state
    mapping(address => bool) public hasSubmittedEncryptedVote;
    mapping(address => bytes32) public voteCommitments; // Hash of encrypted vote
    mapping(address => bytes) public encryptedVotes; // Encrypted vote data

    // Aggregated results (computed from encrypted votes)
    mapping(address => uint256) public participantScores;
    address[] public winners;
    mapping(address => uint256) public winnerPosition;

    // ZK proof verifier
    ZKProofVerifier public proofVerifier;

    // ============ EVENTS ============

    event EncryptedVoteSubmitted(
        address indexed submitter,
        bytes32 commitment,
        bytes encryptedVote,
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

    modifier onlyDuringSubmission() {
        require(block.timestamp <= submissionDeadline, "Submission deadline has passed");
        _;
    }

    modifier onlyAfterSubmission() {
        require(block.timestamp > submissionDeadline, "Submission phase not ended");
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

    function setVotingDeadlines(uint256 _submissionDeadline, uint256 _votingDeadline) external {
        require(submissionDeadline == 0, "Deadlines already set");
        require(_submissionDeadline < _votingDeadline, "Invalid deadline order");

        submissionDeadline = _submissionDeadline;
        votingDeadline = _votingDeadline;
    }

    // ============ MACI VOTING FUNCTIONS ============

    /**
     * @dev Submit encrypted vote anonymously (MACI style)
     * @param _encryptedVote Encrypted vote data
     * @param _zkProof ZK proof that encrypted vote is valid
     * @param _commitment Hash of the encrypted vote for verification
     */
    function submitEncryptedVote(
        bytes calldata _encryptedVote,
        bytes calldata _zkProof,
        bytes32 _commitment
    ) external onlyDuringSubmission {
        require(_encryptedVote.length > 0, "Empty encrypted vote");
        require(_zkProof.length > 0, "Empty ZK proof");
        require(_commitment != bytes32(0), "Invalid commitment");
        require(!hasSubmittedEncryptedVote[msg.sender], "Already submitted encrypted vote");

        // Verify ZK proof without revealing vote content
        require(
            _verifyEncryptedVoteProof(_encryptedVote, _zkProof),
            "Invalid ZK proof for encrypted vote"
        );

        // Store encrypted vote and commitment
        encryptedVotes[msg.sender] = _encryptedVote;
        voteCommitments[msg.sender] = _commitment;
        hasSubmittedEncryptedVote[msg.sender] = true;

        emit EncryptedVoteSubmitted(msg.sender, _commitment, _encryptedVote, _zkProof);
    }

    /**
     * @dev Interface requirement - redirects to encrypted voting
     */
    function submitVotes(
        address[] calldata _participants,
        uint256[] calldata _points
    ) external pure override {
        revert("Use submitEncryptedVote for MACI voting");
    }

    /**
     * @dev Process all encrypted votes and determine winners (MACI decryption)
     * @notice This function processes all encrypted votes without revealing individual choices
     */
    function processEncryptedVotes() external onlyAfterSubmission {
        require(winners.length == 0, "Votes already processed");

        // Process all encrypted votes
        for (uint256 i = 0; i < judges.length; i++) {
            address judge = judges[i];
            if (hasSubmittedEncryptedVote[judge]) {
                _processEncryptedVote(judge);
            }
        }

        // Determine winners from aggregated scores
        _determineWinners();

        emit WinnersDetermined(winners, _getWinnerScores());
    }

    /**
     * @dev Process a single encrypted vote (internal)
     * @param _judge Judge who submitted the encrypted vote
     */
    function _processEncryptedVote(address _judge) internal {
        // In a real MACI implementation, this would:
        // 1. Decrypt the vote using the MACI decryption key
        // 2. Verify the vote is valid
        // 3. Add the decrypted points to participant scores

        // For demonstration, we'll simulate the decryption process
        // In production, this would use actual MACI decryption
        (address[] memory participants, uint256[] memory points) = _simulateDecryption(encryptedVotes[_judge]);

        // Verify the decrypted vote is valid
        require(_isValidDecryptedVote(participants, points), "Invalid decrypted vote");

        // Update participant scores
        for (uint256 i = 0; i < participants.length; i++) {
            uint256 oldScore = participantScores[participants[i]];
            participantScores[participants[i]] += points[i];
            _updateWinnerList(participants[i], oldScore, participantScores[participants[i]]);
        }
    }

    /**
     * @dev Simulate MACI decryption (placeholder for real implementation)
     * @param _encryptedVote Encrypted vote data
     * @return participants Decrypted participant addresses
     * @return points Decrypted points
     */
    function _simulateDecryption(bytes memory _encryptedVote) internal pure returns (
        address[] memory participants,
        uint256[] memory points
    ) {
        // In production, this would use actual MACI decryption
        // For now, we'll simulate by extracting data from the encrypted vote
        // This is a placeholder - real MACI would decrypt using the decryption key

        // Simulate decryption by parsing the encrypted vote
        // In reality, this would be done by the MACI coordinator
        if (_encryptedVote.length >= 64) {
            // Simulate 2 participants
            participants = new address[](2);
            participants[0] = address(uint160(uint256(keccak256(abi.encodePacked(_encryptedVote, "participant1")))));
            participants[1] = address(uint160(uint256(keccak256(abi.encodePacked(_encryptedVote, "participant2")))));

            points = new uint256[](2);
            points[0] = 60; // Simulate 60 points
            points[1] = 40; // Simulate 40 points
        } else {
            // Single participant
            participants = new address[](1);
            participants[0] = address(uint160(uint256(keccak256(abi.encodePacked(_encryptedVote, "participant")))));

            points = new uint256[](1);
            points[0] = 100; // Simulate 100 points
        }
    }

    /**
     * @dev Verify decrypted vote is valid
     * @param _participants Decrypted participant addresses
     * @param _points Decrypted points
     * @return True if vote is valid
     */
    function _isValidDecryptedVote(
        address[] memory _participants,
        uint256[] memory _points
    ) internal view returns (bool) {
        require(_participants.length == _points.length, "Arrays length mismatch");
        require(_participants.length > 0, "Must vote for at least one participant");

        // Verify points constraints
        uint256 totalPointsSum = 0;
        for (uint256 i = 0; i < _points.length; i++) {
            require(_points[i] > 0, "Points must be positive");
            totalPointsSum += _points[i];
        }
        require(totalPointsSum <= pointsPerJudge, "Exceeds points per judge limit");

        return true;
    }

    // ============ ZK PROOF VERIFICATION ============

    /**
     * @dev Verify ZK proof for encrypted vote
     * @param _encryptedVote Encrypted vote data
     * @param _zkProof ZK proof bytes
     * @return True if proof is valid
     */
    function _verifyEncryptedVoteProof(
        bytes calldata _encryptedVote,
        bytes calldata _zkProof
    ) internal view returns (bool) {
        // In production, this would verify the actual ZK proof
        // For now, we'll use a simplified verification
        return _zkProof.length > 0 && _encryptedVote.length > 0;
    }

    // ============ JUDGE MANAGEMENT ============

    function addJudge(address _judge) external override {
        require(_judge != address(0), "Invalid judge address");
        require(!isJudge[_judge], "Judge already exists");
        _addJudge(_judge);
    }

    function removeJudge(address _judge) external override {
        require(isJudge[_judge], "Judge does not exist");
        require(!hasSubmittedEncryptedVote[_judge], "Cannot remove judge who has voted");
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

    function _determineWinners() internal {
        // Winners are already determined during vote processing
        // This function is called after all votes are processed
    }

    function _getWinnerScores() internal view returns (uint256[] memory) {
        uint256[] memory scores = new uint256[](winners.length);
        for (uint256 i = 0; i < winners.length; i++) {
            scores[i] = participantScores[winners[i]];
        }
        return scores;
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
        return hasSubmittedEncryptedVote[_judge];
    }

    function getVotingStats() external view override returns (
        uint256 _totalJudges,
        uint256 _votedJudges,
        uint256 _totalParticipants
    ) {
        _totalJudges = totalJudges;
        uint256 votedCount = 0;
        for (uint256 i = 0; i < judges.length; i++) {
            if (hasSubmittedEncryptedVote[judges[i]]) {
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

    // ============ MACI-SPECIFIC FUNCTIONS ============

    /**
     * @dev Get judge's encrypted vote commitment
     * @param _judge Judge address
     * @return Commitment hash
     */
    function getJudgeCommitment(address _judge) external view returns (bytes32) {
        return voteCommitments[_judge];
    }

    /**
     * @dev Check if judge has submitted encrypted vote
     * @param _judge Judge address
     * @return True if judge has submitted encrypted vote
     */
    function hasJudgeSubmittedEncryptedVote(address _judge) external view returns (bool) {
        return hasSubmittedEncryptedVote[_judge];
    }

    /**
     * @dev Get encrypted vote data (for verification)
     * @param _judge Judge address
     * @return Encrypted vote data
     */
    function getEncryptedVote(address _judge) external view returns (bytes memory) {
        return encryptedVotes[_judge];
    }
}
