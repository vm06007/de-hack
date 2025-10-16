// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Hackathon.sol";

contract HackathonTest is Test {

    Hackathon public hackathon;
    address public organizer;
    address public participant1;
    address public participant2;
    address public participant3;
    address public judge1;
    address public judge2;

    uint256 constant PRIZE_POOL = 10 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    event ParticipantRegistered(
        address indexed participant
    );

    event SubmissionMade(
        address indexed participant,
        string projectName
    );

    event PrizeDistributed(
        address indexed winner,
        uint256 amount
    );

    event HackathonEnded();

    function setUp()
        public
    {
        organizer = makeAddr("organizer");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");
        participant3 = makeAddr("participant3");
        judge1 = makeAddr("judge1");
        judge2 = makeAddr("judge2");

        // Fund accounts
        vm.deal(organizer, 100 ether);
        vm.deal(participant1, 10 ether);
        vm.deal(participant2, 10 ether);
        vm.deal(participant3, 10 ether);

        // Deploy hackathon contract
        vm.prank(organizer);
        hackathon = new Hackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            organizer,
            1 ether, // minimum sponsor contribution
            250 // 2.50% judge reward percentage
        );
    }

    function testHackathonInitialization()
        public
        view
    {
        (
            string memory name,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 prizePool,
            address storedOrganizer,
            bool isActive,
            uint256 participantCount
        ) = hackathon.getHackathonDetails();

        assertEq(
            name,
            "Web3 Hackathon"
        );

        assertEq(
            description,
            "Build the future of Web3"
        );

        assertEq(
            startTime,
            block.timestamp + START_OFFSET
        );

        assertEq(
            endTime,
            block.timestamp + START_OFFSET + DURATION
        );

        assertEq(
            prizePool,
            PRIZE_POOL
        );

        assertEq(
            storedOrganizer,
            organizer
        );

        assertTrue(
            isActive
        );

        assertEq(
            participantCount,
            0
        );
    }

    function testRegisterParticipant() public {
        vm.prank(participant1);

        vm.expectEmit(true, false, false, false);
        emit ParticipantRegistered(participant1);

        hackathon.register();

        assertTrue(
            hackathon.isRegistered(participant1)
        );

        assertEq(
            hackathon.participantCount(),
            1
        );
    }

    function testRegisterTwiceReverts() public {
        vm.startPrank(participant1);

        hackathon.register();

        vm.expectRevert("Already registered");
        hackathon.register();

        vm.stopPrank();
    }

    function testRegisterAfterStartReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Registration closed - hackathon has started");
        hackathon.register();
    }

    function testSubmitProject() public {
        // Register participant first
        vm.prank(participant1);
        hackathon.register();

        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);

        vm.expectEmit(true, false, false, true);
        emit SubmissionMade(participant1, "DeFi Protocol");

        hackathon.submitProject("DeFi Protocol", "https://github.com/example/defi");

        assertTrue(
            hackathon.hasSubmitted(participant1)
        );

        (
            address submitter,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score,
            bool isEvaluated
        ) = hackathon.getSubmission(participant1);

        assertEq(
            submitter,
            participant1
        );

        assertEq(
            projectName,
            "DeFi Protocol"
        );

        assertEq(
            projectUrl,
            "https://github.com/example/defi"
        );

        assertEq(
            submissionTime,
            block.timestamp
        );

        assertEq(
            score,
            0
        );
    }

    function testSubmitProjectNotRegisteredReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);
        vm.expectRevert("Not registered for this hackathon");
        hackathon.submitProject("DeFi Protocol", "https://github.com/example/defi");
    }

    function testSubmitProjectTwiceReverts() public {
        vm.prank(participant1);
        hackathon.register();

        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.startPrank(participant1);

        hackathon.submitProject("First Project", "https://first.com");

        vm.expectRevert("Already submitted");
        hackathon.submitProject("Second Project", "https://second.com");

        vm.stopPrank();
    }

    function testSubmitBeforeStartReverts() public {
        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant1);
        vm.expectRevert("Hackathon has not started yet");
        hackathon.submitProject("Too Early", "https://early.com");
    }

    function testSubmitAfterEndReverts() public {
        vm.prank(participant1);
        hackathon.register();

        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Hackathon has ended");
        hackathon.submitProject("Too Late", "https://late.com");
    }

    function testDistributePrize() public {
        // End the hackathon first
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        vm.prank(organizer);
        hackathon.endHackathon();

        uint256 winnerBalanceBefore = participant1.balance;
        uint256 prizeAmount = 5 ether;

        vm.prank(organizer);

        vm.expectEmit(true, false, false, true);
        emit PrizeDistributed(participant1, prizeAmount);

        hackathon.distributePrize(participant1, prizeAmount);

        // Check winner received funds
        assertEq(
            participant1.balance,
            winnerBalanceBefore + prizeAmount
        );

        // Check prize pool decreased
        assertEq(
            hackathon.prizePool(),
            PRIZE_POOL - prizeAmount
        );
    }

    function testDistributePrizeNonOrganizerReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Only organizer or sponsors can distribute prizes");
        hackathon.distributePrize(participant1, 5 ether);
    }

    function testDistributePrizeTooMuchReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);
        vm.expectRevert("Amount exceeds prize pool");
        hackathon.distributePrize(participant1, PRIZE_POOL + 1);
    }

    function testDistributePrizeZeroAmountReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);
        vm.expectRevert("Amount must be greater than 0");
        hackathon.distributePrize(participant1, 0);
    }

    function testDistributePrizeWhileActiveReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(organizer);
        vm.expectRevert("Hackathon is still active");
        hackathon.distributePrize(participant1, 5 ether);
    }

    function testEmergencyWithdraw() public {
        uint256 organizerBalanceBefore = organizer.balance;

        vm.prank(organizer);
        hackathon.emergencyWithdraw();

        // Check hackathon is inactive and prize pool is 0
        assertFalse(
            hackathon.isActive()
        );

        assertEq(
            hackathon.prizePool(),
            0
        );

        // Check organizer received funds
        assertEq(
            organizer.balance,
            organizerBalanceBefore + PRIZE_POOL
        );
    }

    function testEmergencyWithdrawNonOrganizerReverts() public {
        vm.prank(participant1);
        vm.expectRevert("Only organizer can call this function");
        hackathon.emergencyWithdraw();
    }

    function testEmergencyWithdrawInactiveHackathonReverts() public {
        vm.prank(organizer);
        hackathon.emergencyWithdraw();

        vm.prank(organizer);
        vm.expectRevert("Hackathon is not active");
        hackathon.emergencyWithdraw();
    }

    function testEndHackathon() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);

        vm.expectEmit(false, false, false, false);
        emit HackathonEnded();

        hackathon.endHackathon();

        assertFalse(
            hackathon.isActive()
        );
    }

    function testEndHackathonNonOrganizerReverts() public {
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(participant1);
        vm.expectRevert("Only organizer can call this function");
        hackathon.endHackathon();
    }

    function testEndHackathonBeforeEndTimeReverts() public {
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(organizer);
        vm.expectRevert("Hackathon has not ended yet");
        hackathon.endHackathon();
    }

    function testEndHackathonAlreadyInactiveReverts() public {
        vm.prank(organizer);
        hackathon.emergencyWithdraw();

        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);

        vm.prank(organizer);
        vm.expectRevert("Hackathon is not active");
        hackathon.endHackathon();
    }

    function testIsRegistrationOpen() public {
        // Before start time
        assertTrue(
            hackathon.isRegistrationOpen()
        );

        // After start time
        vm.warp(block.timestamp + START_OFFSET + 1);
        assertFalse(
            hackathon.isRegistrationOpen()
        );

        // After end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        assertFalse(
            hackathon.isRegistrationOpen()
        );
    }

    function testIsSubmissionOpen() public {
        // Before start time
        assertFalse(
            hackathon.isSubmissionOpen()
        );

        // During hackathon
        vm.warp(block.timestamp + START_OFFSET + 1);
        assertTrue(
            hackathon.isSubmissionOpen()
        );

        // After end time
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        assertFalse(
            hackathon.isSubmissionOpen()
        );
    }

    function testMultipleParticipants() public {
        // Register multiple participants
        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant2);
        hackathon.register();

        vm.prank(participant3);
        hackathon.register();

        assertEq(
            hackathon.participantCount(),
            3
        );

        // Check all participants are registered
        assertTrue(
            hackathon.isRegistered(participant1)
        );

        assertTrue(
            hackathon.isRegistered(participant2)
        );

        assertTrue(
            hackathon.isRegistered(participant3)
        );
    }

    function testAddMoreJudge() public {
        address newJudge = makeAddr("newJudge");
        vm.deal(newJudge, 10 ether);
        
        // First disable factory access by calling disableFactoryJudgeAccess
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add a new judge
        vm.prank(organizer);
        hackathon.addMoreJudge(newJudge);
        
        // Verify judge was added
        assertTrue(hackathon.isJudge(newJudge));
        address[] memory judges = hackathon.getJudges();
        assertEq(judges.length, 1); // Only the new judge since no initial judges
    }
    
    function testAddMoreJudgeNonOrganizerReverts() public {
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        vm.prank(participant1);
        vm.expectRevert("Only organizer can call this function");
        hackathon.addMoreJudge(newJudge);
    }
    
    function testAddMoreJudgeInvalidAddressReverts() public {
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        vm.prank(organizer);
        vm.expectRevert("Invalid judge address");
        hackathon.addMoreJudge(address(0));
    }
    
    function testAddMoreJudgeAlreadyExistsReverts() public {
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add judge first time
        vm.prank(organizer);
        hackathon.addMoreJudge(newJudge);
        
        // Try to add same judge again
        vm.prank(organizer);
        vm.expectRevert("Judge already added");
        hackathon.addMoreJudge(newJudge);
    }
    
    function testAddMoreJudgeInactiveHackathonReverts() public {
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Fast forward past end time to make hackathon inactive
        vm.warp(block.timestamp + 25 hours);
        
        // Try to add judge to inactive hackathon
        vm.prank(organizer);
        vm.expectRevert("Cannot add judges after hackathon ends");
        hackathon.addMoreJudge(newJudge);
    }
    
    function testAddMoreJudgeAfterEndTimeReverts() public {
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Fast forward past end time
        vm.warp(block.timestamp + 25 hours);
        
        // Try to add judge after hackathon ends
        vm.prank(organizer);
        vm.expectRevert("Cannot add judges after hackathon ends");
        hackathon.addMoreJudge(newJudge);
    }
    
    function testReplaceJudge() public {
        address oldJudge = makeAddr("oldJudge");
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add initial judge
        vm.prank(organizer);
        hackathon.addMoreJudge(oldJudge);
        
        // Replace judge
        vm.prank(organizer);
        hackathon.replaceJudge(oldJudge, newJudge);
        
        // Verify replacement
        assertFalse(hackathon.isJudge(oldJudge));
        assertTrue(hackathon.isJudge(newJudge));
        
        address[] memory judges = hackathon.getJudges();
        assertEq(judges.length, 1);
        assertEq(judges[0], newJudge);
    }
    
    function testReplaceJudgeNonOrganizerReverts() public {
        address oldJudge = makeAddr("oldJudge");
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add initial judge
        vm.prank(organizer);
        hackathon.addMoreJudge(oldJudge);
        
        // Try to replace as non-organizer
        vm.prank(participant1);
        vm.expectRevert("Only organizer can call this function");
        hackathon.replaceJudge(oldJudge, newJudge);
    }
    
    function testReplaceJudgeInvalidAddressesReverts() public {
        address oldJudge = makeAddr("oldJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add initial judge
        vm.prank(organizer);
        hackathon.addMoreJudge(oldJudge);
        
        // Test invalid old judge
        vm.prank(organizer);
        vm.expectRevert("Invalid old judge address");
        hackathon.replaceJudge(address(0), makeAddr("newJudge"));
        
        // Test invalid new judge
        vm.prank(organizer);
        vm.expectRevert("Invalid new judge address");
        hackathon.replaceJudge(oldJudge, address(0));
    }
    
    function testReplaceJudgeOldJudgeNotFoundReverts() public {
        address nonExistentJudge = makeAddr("nonExistentJudge");
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        vm.prank(organizer);
        vm.expectRevert("Old judge not found");
        hackathon.replaceJudge(nonExistentJudge, newJudge);
    }
    
    function testReplaceJudgeNewJudgeAlreadyExistsReverts() public {
        address oldJudge = makeAddr("oldJudge");
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add both judges
        vm.prank(organizer);
        hackathon.addMoreJudge(oldJudge);
        vm.prank(organizer);
        hackathon.addMoreJudge(newJudge);
        
        // Try to replace with existing judge
        vm.prank(organizer);
        vm.expectRevert("New judge already exists");
        hackathon.replaceJudge(oldJudge, newJudge);
    }
    
    function testReplaceJudgeInactiveHackathonReverts() public {
        address oldJudge = makeAddr("oldJudge");
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add initial judge
        vm.prank(organizer);
        hackathon.addMoreJudge(oldJudge);
        
        // Fast forward past end time to make hackathon inactive
        vm.warp(block.timestamp + 25 hours);
        
        // Try to replace judge in inactive hackathon
        vm.prank(organizer);
        vm.expectRevert("Cannot replace judges after hackathon ends");
        hackathon.replaceJudge(oldJudge, newJudge);
    }
    
    function testReplaceJudgeAfterEndTimeReverts() public {
        address oldJudge = makeAddr("oldJudge");
        address newJudge = makeAddr("newJudge");
        
        // First disable factory access
        vm.prank(organizer);
        hackathon.disableFactoryJudgeAccess();
        
        // Add initial judge
        vm.prank(organizer);
        hackathon.addMoreJudge(oldJudge);
        
        // Fast forward past end time
        vm.warp(block.timestamp + 25 hours);
        
        // Try to replace judge after hackathon ends
        vm.prank(organizer);
        vm.expectRevert("Cannot replace judges after hackathon ends");
        hackathon.replaceJudge(oldJudge, newJudge);
    }

    // ========== Judge Delegation Tests ==========

    function testDelegateToAgent() public {
        address delegate = makeAddr("delegate");
        
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // Judge delegates to agent
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate);
        
        // Verify delegation
        assertEq(hackathon.getJudgeDelegate(judge1), delegate);
        assertEq(hackathon.getDelegateJudge(delegate), judge1);
    }

    function testDelegateToAgentNonJudgeReverts() public {
        address delegate = makeAddr("delegate");
        address nonJudge = makeAddr("nonJudge");
        
        // Non-judge tries to delegate
        vm.prank(nonJudge);
        vm.expectRevert("Only judges can delegate");
        hackathon.delegateToAgent(delegate);
    }

    function testDelegateToAgentInvalidAddressReverts() public {
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // Judge tries to delegate to zero address
        vm.prank(judge1);
        vm.expectRevert("Invalid delegate address");
        hackathon.delegateToAgent(address(0));
    }

    function testDelegateToAgentSelfReverts() public {
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // Judge tries to delegate to themselves
        vm.prank(judge1);
        vm.expectRevert("Cannot delegate to yourself");
        hackathon.delegateToAgent(judge1);
    }

    function testDelegateToAgentAlreadyHasDelegateReverts() public {
        address delegate1 = makeAddr("delegate1");
        address delegate2 = makeAddr("delegate2");
        
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // First delegation
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate1);
        
        // Try to delegate again
        vm.prank(judge1);
        vm.expectRevert("Already has a delegate");
        hackathon.delegateToAgent(delegate2);
    }

    function testRevokeDelegation() public {
        address delegate = makeAddr("delegate");
        
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // Delegate first
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate);
        
        // Verify delegation exists
        assertEq(hackathon.getJudgeDelegate(judge1), delegate);
        
        // Revoke delegation
        vm.prank(judge1);
        hackathon.revokeDelegation();
        
        // Verify delegation is revoked
        assertEq(hackathon.getJudgeDelegate(judge1), address(0));
        assertEq(hackathon.getDelegateJudge(delegate), address(0));
    }

    function testRevokeDelegationNonJudgeReverts() public {
        address nonJudge = makeAddr("nonJudge");
        
        // Non-judge tries to revoke delegation
        vm.prank(nonJudge);
        vm.expectRevert("Only judges can revoke delegation");
        hackathon.revokeDelegation();
    }

    function testRevokeDelegationNoDelegateReverts() public {
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // Judge without delegate tries to revoke
        vm.prank(judge1);
        vm.expectRevert("No delegation to revoke");
        hackathon.revokeDelegation();
    }

    function testDelegateCanScoreSubmission() public {
        address delegate = makeAddr("delegate");
        address participant = makeAddr("participant");
        
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // Register participant
        hackathon.registerParticipant(participant);
        
        // Fast forward to hackathon start time
        vm.warp(block.timestamp + START_OFFSET + 1);
        
        // Create submission
        vm.prank(participant);
        hackathon.submitProject("Test Project", "https://github.com/test");
        
        // Judge delegates to agent
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate);
        
        // Delegate scores submission
        vm.prank(delegate);
        hackathon.scoreSubmission(participant, 85);
        
        // Verify score was recorded
        (address participantAddr, string memory name, string memory url, uint256 submissionTime, uint256 score, bool isEvaluated) = hackathon.getSubmission(participant);
        assertEq(score, 85);
        assertTrue(isEvaluated);
    }

    function testDelegateCanClaimJudgeReward() public {
        address delegate = makeAddr("delegate");
        
        // Add judge first
        vm.prank(organizer);
        hackathon.addMoreJudge(judge1);
        
        // Judge delegates to agent
        vm.prank(judge1);
        hackathon.delegateToAgent(delegate);
        
        // Fast forward past hackathon end time to enable reward claiming
        vm.warp(block.timestamp + START_OFFSET + DURATION + 1);
        vm.prank(organizer);
        hackathon.endHackathon();
        
        // Delegate claims reward (should work since they're acting on behalf of judge1)
        vm.prank(delegate);
        hackathon.claimJudgeReward();
        
        // Verify judge1 has received reward
        assertTrue(hackathon.hasReceivedJudgeReward(judge1));
    }

}
