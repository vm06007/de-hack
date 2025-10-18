// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title VotingTypes
 * @dev Common types and enums for all voting systems
 */

// ============ ENUMS ============

/**
 * @dev Available voting system types
 */
enum VotingSystemType {
    OPEN,           // Transparent voting (current system)
    COMMIT_REVEAL,  // Hidden until reveal phase
    ZK_SNARK,       // Zero-knowledge proofs
    QUADRATIC       // Quadratic voting
}

// ============ STRUCTS ============

/**
 * @dev Voting configuration for hackathon creation
 */
struct VotingConfig {
    VotingSystemType systemType;
    bool useQuadraticVoting;
    uint256 creditsPerJudge;  // For quadratic voting
    uint256 pointsPerJudge;   // For normal voting
    uint256 maxWinners;       // Number of winners to track
}

/**
 * @dev Judge voting data for batch submissions
 */
struct JudgeVote {
    address[] participants;
    uint256[] points;
    uint256 nonce;           // For commit-reveal
    bytes32 commitment;      // For commit-reveal
    bytes zkProof;           // For ZK-SNARK
    uint256[] quadraticCredits; // For quadratic voting
}

/**
 * @dev Winner information
 */
struct WinnerInfo {
    address participant;
    uint256 totalPoints;
    uint256 position;        // 1-indexed position
    bool isWinner;          // True if in top N
}

/**
 * @dev Voting statistics
 */
struct VotingStats {
    uint256 totalJudges;
    uint256 votedJudges;
    uint256 totalParticipants;
    uint256 totalPointsAllocated;
    bool votingOpen;
    uint256 votingDeadline;
}
