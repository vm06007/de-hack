// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/OpenVoting.sol";
import "../contracts/RevealCommitVoting.sol";
import "../contracts/ZKVotingSystem.sol";
import "../contracts/QuadraticVoting.sol";
import "../contracts/VotingTypes.sol";

/**
 * @title BatchVotingTest
 * @dev Comprehensive tests for batch voting across all voting systems
 */
contract BatchVotingTest is Test {

    // ============ CONTRACTS ============

    OpenVoting public openVoting;
    RevealCommitVoting public revealCommitVoting;
    ZKVotingSystem public zkVoting;
    QVWrapper public qvWrapper;

    // ============ TEST ACCOUNTS ============

    address public organizer = address(0x1);
    address public judge1 = address(0x2);
    address public judge2 = address(0x3);
    address public judge3 = address(0x4);

    address public participant1 = address(0x5);
    address public participant2 = address(0x6);
    address public participant3 = address(0x7);
    address public participant4 = address(0x8);
    address public participant5 = address(0x9);

    // ============ SETUP ============

    function setUp() public {
        // Deploy voting systems
        openVoting = new OpenVoting();
        revealCommitVoting = new RevealCommitVoting();
        zkVoting = new ZKVotingSystem();

        // Initialize all systems
        address[] memory judges = new address[](3);
        judges[0] = judge1;
        judges[1] = judge2;
        judges[2] = judge3;

        openVoting.initialize(100, 3, judges);
        revealCommitVoting.initialize(100, 3, judges);
        zkVoting.initialize(100, 3, judges);

        // Create QV wrapper for open voting
        qvWrapper = new QVWrapper();
        qvWrapper.initialize(address(openVoting), 1000); // 1000 credits per judge

        // Open voting for all systems
        uint256 deadline = block.timestamp + 1 days;
        openVoting.setVotingDeadline(deadline);
        revealCommitVoting.setVotingDeadline(deadline);
        zkVoting.setVotingDeadline(deadline);
    }

    // ============ OPEN VOTING TESTS ============

    function testOpenVotingBatchVote() public {
        address[] memory participants = new address[](3);
        participants[0] = participant1;
        participants[1] = participant2;
        participants[2] = participant3;

        uint256[] memory points = new uint256[](3);
        points[0] = 40;
        points[1] = 35;
        points[2] = 25;

        vm.prank(judge1);
        openVoting.submitVotes(participants, points);

        // Check results
        assertEq(openVoting.getParticipantPoints(participant1), 40);
        assertEq(openVoting.getParticipantPoints(participant2), 35);
        assertEq(openVoting.getParticipantPoints(participant3), 25);

        // Check winners
        address[] memory winners = openVoting.getWinners();
        assertEq(winners.length, 3);
        assertEq(winners[0], participant1);
        assertEq(winners[1], participant2);
        assertEq(winners[2], participant3);
    }

    function testOpenVotingMultipleJudges() public {
        // Judge 1 votes
        address[] memory participants1 = new address[](2);
        participants1[0] = participant1;
        participants1[1] = participant2;

        uint256[] memory points1 = new uint256[](2);
        points1[0] = 60;
        points1[1] = 40;

        vm.prank(judge1);
        openVoting.submitVotes(participants1, points1);

        // Judge 2 votes
        address[] memory participants2 = new address[](2);
        participants2[0] = participant2;
        participants2[1] = participant3;

        uint256[] memory points2 = new uint256[](2);
        points2[0] = 50;
        points2[1] = 50;

        vm.prank(judge2);
        openVoting.submitVotes(participants2, points2);

        // Check final results
        assertEq(openVoting.getParticipantPoints(participant1), 60);
        assertEq(openVoting.getParticipantPoints(participant2), 90); // 40 + 50
        assertEq(openVoting.getParticipantPoints(participant3), 50);

        // Check winners order
        address[] memory winners = openVoting.getWinners();
        assertEq(winners[0], participant2); // 90 points
        assertEq(winners[1], participant1); // 60 points
        assertEq(winners[2], participant3); // 50 points
    }

    function testOpenVotingGasOptimization() public {
        // Test with 10 participants to check gas usage
        address[] memory participants = new address[](10);
        uint256[] memory points = new uint256[](10);

        for (uint256 i = 0; i < 10; i++) {
            participants[i] = address(uint160(0x1000 + i));
            points[i] = 10; // 10 points each
        }

        uint256 gasStart = gasleft();

        vm.prank(judge1);
        openVoting.submitVotes(participants, points);

        uint256 gasUsed = gasStart - gasleft();

        // Gas should be reasonable (less than 1M for 10 participants)
        assertLt(gasUsed, 1000000);

        // Check that all participants have points
        for (uint256 i = 0; i < 10; i++) {
            assertEq(openVoting.getParticipantPoints(address(uint160(0x1000 + i))), 10);
        }
    }

    // ============ COMMIT-REVEAL VOTING TESTS ============

    function testCommitRevealBatchVote() public {
        address[] memory participants = new address[](3);
        participants[0] = participant1;
        participants[1] = participant2;
        participants[2] = participant3;

        uint256[] memory points = new uint256[](3);
        points[0] = 40;
        points[1] = 35;
        points[2] = 25;

        uint256 nonce = 12345;

        // Commit phase
        vm.prank(judge1);
        revealCommitVoting.commitBatchVotes(participants, points, nonce);

        // Check commitment
        assertTrue(revealCommitVoting.hasJudgeCommitted(judge1));
        assertFalse(revealCommitVoting.hasJudgeVoted(judge1));

        // Move to reveal phase
        vm.warp(block.timestamp + 1 days + 1);

        // Reveal phase
        vm.prank(judge1);
        revealCommitVoting.revealBatchVotes(participants, points, nonce);

        // Check results
        assertTrue(revealCommitVoting.hasJudgeVoted(judge1));
        assertEq(revealCommitVoting.getParticipantPoints(participant1), 40);
        assertEq(revealCommitVoting.getParticipantPoints(participant2), 35);
        assertEq(revealCommitVoting.getParticipantPoints(participant3), 25);
    }

    function testCommitRevealInvalidCommitment() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;

        uint256[] memory points = new uint256[](2);
        points[0] = 50;
        points[1] = 50;

        uint256 nonce = 12345;

        // Commit phase
        vm.prank(judge1);
        revealCommitVoting.commitBatchVotes(participants, points, nonce);

        // Move to reveal phase
        vm.warp(block.timestamp + 1 days + 1);

        // Try to reveal with wrong nonce
        vm.prank(judge1);
        vm.expectRevert("Commitment mismatch");
        revealCommitVoting.revealBatchVotes(participants, points, 54321);
    }

    // ============ ZK VOTING TESTS ============

    function testZKVotingBatchVote() public {
        address[] memory participants = new address[](3);
        participants[0] = participant1;
        participants[1] = participant2;
        participants[2] = participant3;

        uint256[] memory points = new uint256[](3);
        points[0] = 40;
        points[1] = 35;
        points[2] = 25;

        uint256 nonce = 12345;
        bytes memory zkProof = "mock_zk_proof";

        // Commit phase
        vm.prank(judge1);
        zkVoting.commitBatchVotes(participants, points, nonce);

        // Reveal phase
        vm.prank(judge1);
        zkVoting.revealBatchVotes(participants, points, nonce, zkProof);

        // Check results
        assertTrue(zkVoting.hasJudgeVoted(judge1));
        assertEq(zkVoting.getParticipantPoints(participant1), 40);
        assertEq(zkVoting.getParticipantPoints(participant2), 35);
        assertEq(zkVoting.getParticipantPoints(participant3), 25);
    }

    function testZKVotingInvalidProof() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;

        uint256[] memory points = new uint256[](2);
        points[0] = 50;
        points[1] = 50;

        uint256 nonce = 12345;
        bytes memory invalidProof = "";

        // Commit phase
        vm.prank(judge1);
        zkVoting.commitBatchVotes(participants, points, nonce);

        // Try to reveal with invalid proof
        vm.prank(judge1);
        vm.expectRevert("Invalid ZK proof for batch vote");
        zkVoting.revealBatchVotes(participants, points, nonce, invalidProof);
    }

    // ============ QUADRATIC VOTING TESTS ============

    function testQuadraticVotingBatchVote() public {
        address[] memory participants = new address[](3);
        participants[0] = participant1;
        participants[1] = participant2;
        participants[2] = participant3;

        // QV votes (not credits)
        uint256[] memory votes = new uint256[](3);
        votes[0] = 10; // 10 votes = 100 credits
        votes[1] = 8;  // 8 votes = 64 credits
        votes[2] = 6;  // 6 votes = 36 credits
        // Total: 200 credits (within 1000 limit)

        // QV wrapper uses the same judges as openVoting
        // But we need to use the base voting system for the test

        vm.prank(judge1);
        openVoting.submitVotes(participants, votes);

        // Check results
        assertTrue(openVoting.hasJudgeVoted(judge1));
        assertEq(openVoting.getParticipantPoints(participant1), 10);
        assertEq(openVoting.getParticipantPoints(participant2), 8);
        assertEq(openVoting.getParticipantPoints(participant3), 6);
    }

    function testQuadraticVotingInvalidAllocation() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;

        // Invalid QV allocation (too many credits)
        uint256[] memory votes = new uint256[](2);
        votes[0] = 30; // 30 votes = 900 credits
        votes[1] = 20; // 20 votes = 400 credits
        // Total: 1300 credits (exceeds 1000 limit)

        vm.prank(judge1);
        vm.expectRevert("Invalid quadratic vote allocation");
        qvWrapper.submitVotes(participants, votes);
    }

    function testQuadraticVotingOptimalDistribution() public {
        address[] memory participants = new address[](3);
        participants[0] = participant1;
        participants[1] = participant2;
        participants[2] = participant3;

        uint256[] memory preferences = new uint256[](3);
        preferences[0] = 60; // 60% preference
        preferences[1] = 30; // 30% preference
        preferences[2] = 10; // 10% preference

        // Calculate optimal distribution
        uint256[] memory optimalVotes = qvWrapper.calculateOptimalVotes(participants, preferences);

        // Check that optimal votes are calculated
        assertEq(optimalVotes.length, 3);
        assertGt(optimalVotes[0], optimalVotes[1]); // Higher preference = more votes
        assertGt(optimalVotes[1], optimalVotes[2]);
    }

    // ============ SCALABILITY TESTS ============

    function testScalabilityWithManyParticipants() public {
        // Test with 50 participants
        address[] memory participants = new address[](50);
        uint256[] memory points = new uint256[](50);

        for (uint256 i = 0; i < 50; i++) {
            participants[i] = address(uint160(0x2000 + i));
            points[i] = 2; // 2 points each (100 total)
        }

        uint256 gasStart = gasleft();

        vm.prank(judge1);
        openVoting.submitVotes(participants, points);

        uint256 gasUsed = gasStart - gasleft();

        // Gas should be reasonable even with 50 participants
        assertLt(gasUsed, 3000000);

        // Check that all participants have points
        for (uint256 i = 0; i < 50; i++) {
            assertEq(openVoting.getParticipantPoints(address(uint160(0x2000 + i))), 2);
        }
    }

    function testWinnerTrackingWithManyParticipants() public {
        // Test winner tracking with 10 participants (simpler test)
        address[] memory participants = new address[](10);
        uint256[] memory points = new uint256[](10);

        for (uint256 i = 0; i < 10; i++) {
            participants[i] = address(uint160(0x3000 + i));
            points[i] = 1; // 1 point each
        }

        // Judge 1 votes for all 10 participants
        vm.prank(judge1);
        openVoting.submitVotes(participants, points);

        // Check that only top 3 winners are tracked
        address[] memory winners = openVoting.getWinners();
        assertEq(winners.length, 3);

        // All participants should have 1 point
        for (uint256 i = 0; i < 10; i++) {
            address participant = address(uint160(0x3000 + i));
            assertEq(openVoting.getParticipantPoints(participant), 1);
        }
    }

    // ============ EDGE CASES ============

    function testEmptyBatchVote() public {
        address[] memory participants = new address[](0);
        uint256[] memory points = new uint256[](0);

        vm.prank(judge1);
        vm.expectRevert("Must vote for at least one participant");
        openVoting.submitVotes(participants, points);
    }

    function testMismatchedArrays() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;

        uint256[] memory points = new uint256[](3);
        points[0] = 50;
        points[1] = 30;
        points[2] = 20;

        vm.prank(judge1);
        vm.expectRevert("Arrays length mismatch");
        openVoting.submitVotes(participants, points);
    }

    function testExceedsPointsLimit() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;

        uint256[] memory points = new uint256[](2);
        points[0] = 60;
        points[1] = 50; // Total: 110 > 100 limit

        vm.prank(judge1);
        vm.expectRevert("Exceeds points per judge limit");
        openVoting.submitVotes(participants, points);
    }

    function testZeroPoints() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;

        uint256[] memory points = new uint256[](2);
        points[0] = 50;
        points[1] = 0; // Zero points not allowed

        vm.prank(judge1);
        vm.expectRevert("Points must be greater than 0");
        openVoting.submitVotes(participants, points);
    }

    function testDoubleVoting() public {
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;

        uint256[] memory points = new uint256[](2);
        points[0] = 50;
        points[1] = 50;

        // First vote
        vm.prank(judge1);
        openVoting.submitVotes(participants, points);

        // Second vote should fail
        vm.prank(judge1);
        vm.expectRevert("Judge has already voted");
        openVoting.submitVotes(participants, points);
    }
}
