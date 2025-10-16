// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/HackathonRouter.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";

contract HackathonRouterTest is Test {

    HackathonRouter public router;
    HackathonFactory public factory;
    address public organizer;
    address public participant1;
    address public participant2;
    address public participant3;

    uint256 constant PRIZE_POOL = 10 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    event HackathonCreated(
        address indexed hackathonAddress,
        string name,
        address indexed organizer,
        uint256 prizePool
    );

    event ParticipantRegistered(
        address indexed hackathonAddress,
        address indexed participant
    );

    event ProjectSubmitted(
        address indexed hackathonAddress,
        address indexed participant,
        string projectName
    );

    function setUp() public {
        factory = new HackathonFactory();
        
        // Create initial judges
        address[] memory initialJudges = new address[](2);
        initialJudges[0] = makeAddr("judge1");
        initialJudges[1] = makeAddr("judge2");
        
        router = new HackathonRouter(address(factory), initialJudges);

        organizer = makeAddr("organizer");
        participant1 = makeAddr("participant1");
        participant2 = makeAddr("participant2");
        participant3 = makeAddr("participant3");

        // Fund accounts
        vm.deal(organizer, 100 ether);
        vm.deal(participant1, 10 ether);
        vm.deal(participant2, 10 ether);
        vm.deal(participant3, 10 ether);
        vm.deal(initialJudges[0], 10 ether);
        vm.deal(initialJudges[1], 10 ether);
    }

    function testCreateHackathon() public {
        vm.startPrank(organizer);

        uint256 startTime = block.timestamp + START_OFFSET;
        uint256 endTime = startTime + DURATION;

        vm.expectEmit(
            false, // Don't check the address
            true,  // Check the name
            false, // Don't check the description
            true   // Check the organizer
        );

        emit HackathonCreated(
            address(0), // We can't predict the exact address
            "Web3 Hackathon",
            organizer,
            PRIZE_POOL
        );

        // Get initial judges from router
        address[] memory judges = router.getGlobalJudges();
        
        address hackathonAddress = router.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            startTime,
            endTime,
            1 ether, // minimum sponsor contribution
            judges,
            250 // 2.50% judge reward percentage
        );

        vm.stopPrank();

        // Verify hackathon was created
        assertTrue(hackathonAddress != address(0));
        assertEq(router.getTotalHackathons(), 1);

        // Verify hackathon details
        (
            string memory name,
            string memory description,
            uint256 storedStartTime,
            uint256 storedEndTime,
            uint256 prizePool,
            address storedOrganizer,
            bool isActive,
            uint256 participantCount
        ) = router.getHackathonDetails(hackathonAddress);

        assertEq(name, "Web3 Hackathon");
        assertEq(description, "Build the future of Web3");
        assertEq(storedStartTime, startTime);
        assertEq(storedEndTime, endTime);
        assertEq(prizePool, PRIZE_POOL);
        assertEq(storedOrganizer, organizer);
        assertTrue(isActive);
        assertEq(participantCount, 0);
    }

    function testRegisterForHackathon() public {
        address hackathonAddress = _createDefaultHackathon();

        vm.prank(participant1);

        vm.expectEmit(
            true,
            true,
            false,
            false
        );

        emit ParticipantRegistered(
            hackathonAddress,
            participant1
        );

        router.registerForHackathon(hackathonAddress);

        // Check participant is registered
        assertTrue(router.isParticipantRegistered(hackathonAddress, participant1));
        assertEq(router.getParticipantHackathonCount(participant1), 1);
        assertEq(router.getParticipantHackathon(participant1, 0), hackathonAddress);
    }

    function testSubmitProject() public {
        address hackathonAddress = _createDefaultHackathon();

        // Register participant
        vm.prank(participant1);
        router.registerForHackathon(hackathonAddress);

        // Fast forward to hackathon start
        vm.warp(block.timestamp + START_OFFSET + 1);

        vm.prank(participant1);

        vm.expectEmit(
            true,
            true,
            false,
            true
        );

        emit ProjectSubmitted(
            hackathonAddress,
            participant1,
            "DeFi Protocol"
        );

        router.submitProject(
            hackathonAddress,
            "DeFi Protocol",
            "https://github.com/example/defi"
        );

        // Check submission
        (
            address submitter,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score,
            bool isEvaluated
        ) = router.getSubmission(hackathonAddress, participant1);

        assertEq(submitter, participant1);
        assertEq(projectName, "DeFi Protocol");
        assertEq(projectUrl, "https://github.com/example/defi");
        assertEq(submissionTime, block.timestamp);
        assertEq(score, 0);
    }


    function testRouterConstructorInvalidFactoryReverts() public {
        address[] memory emptyJudges = new address[](0);
        vm.expectRevert("Invalid factory address");
        new HackathonRouter(address(0), emptyJudges);
    }

    function testRegisterForInvalidHackathonReverts() public {
        vm.prank(participant1);
        vm.expectRevert("Invalid hackathon address");
        router.registerForHackathon(address(0));
    }

    function testSubmitProjectForInvalidHackathonReverts() public {
        vm.prank(participant1);
        vm.expectRevert("Invalid hackathon address");
        router.submitProject(address(0), "Test Project", "https://test.com");
    }



    // Helper function to create a default hackathon
    function _createDefaultHackathon() internal returns (address) {
        vm.prank(organizer);
        // Get initial judges from router
        address[] memory judges = router.getGlobalJudges();
        
        return router.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether, // minimum sponsor contribution
            judges,
            250 // 2.50% judge reward percentage
        );
    }

    function testAddMoreJudge() public {
        // Create hackathon without initial judges
        address[] memory emptyJudges = new address[](0);
        vm.prank(organizer);
        address hackathonAddress = router.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether, // minimum sponsor contribution
            emptyJudges,
            250 // 2.50% judge reward percentage
        );
        
        // Use an existing global judge
        address[] memory globalJudges = router.getGlobalJudges();
        address newJudge = globalJudges[1]; // Use the second global judge
        
        // Add judge to hackathon directly (organizer should interact with hackathon directly)
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(organizer);
        hackathon.addMoreJudge(newJudge);
        
        // Verify judge was added
        assertTrue(hackathon.isJudge(newJudge));
    }
    
    
    function testReplaceJudge() public {
        // Create hackathon with one initial judge
        address[] memory initialJudges = new address[](1);
        initialJudges[0] = router.getGlobalJudges()[0];
        
        vm.prank(organizer);
        address hackathonAddress = router.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether, // minimum sponsor contribution
            initialJudges,
            250 // 2.50% judge reward percentage
        );
        
        address oldJudge = initialJudges[0];
        // Use an existing global judge as replacement
        address[] memory globalJudges = router.getGlobalJudges();
        address newJudge = globalJudges[1]; // Use the second global judge
        
        // Replace judge directly (organizer should interact with hackathon directly)
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(organizer);
        hackathon.replaceJudge(oldJudge, newJudge);
        
        // Verify replacement
        assertFalse(hackathon.isJudge(oldJudge));
        assertTrue(hackathon.isJudge(newJudge));
    }
    
}
