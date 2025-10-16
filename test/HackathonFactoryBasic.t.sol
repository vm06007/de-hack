// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";

contract HackathonFactoryBasicTest is Test {
    HackathonFactory public factory;
    address public organizer;
    address public participant;

    uint256 constant PRIZE_POOL = 5 ether;
    uint256 constant START_OFFSET = 1 hours;
    uint256 constant DURATION = 24 hours;

    function _createPrizeDistribution(uint256 a, uint256 b, uint256 c) internal pure returns (uint256[] memory) {
        uint256[] memory distribution = new uint256[](3);
        distribution[0] = a;
        distribution[1] = b;
        distribution[2] = c;
        return distribution;
    }

    event HackathonCreated(
        address indexed hackathonAddress,
        string name,
        address indexed organizer,
        uint256 prizePool
    );

    function setUp() public {
        // Deploy implementation contract first (no constructor needed)
        Hackathon implementation = new Hackathon();

        // Deploy factory with implementation address
        factory = new HackathonFactory(address(implementation));

        organizer = makeAddr("organizer");
        participant = makeAddr("participant");

        vm.deal(organizer, 10 ether);
        vm.deal(participant, 10 ether);
    }

    function testCreateHackathon() public {
        vm.prank(organizer);
        address hackathonAddress = factory.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether, // minimum sponsor contribution
            new address[](0), // selected judges (empty)
            250, // 2.50% judge reward percentage
            0.01 ether, // stake amount
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether), // prize distribution [3, 1.5, 0.5] = 5 ether total
            1 days, // prize claim cooldown
            1 days // judging duration
        );

        assertTrue(hackathonAddress != address(0));
        assertEq(factory.getHackathonCount(), 1);
        assertEq(factory.getOrganizerHackathon(organizer, 0), hackathonAddress);

        // Verify hackathon details
        (
            string memory name,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 prizePool,
            address hackathonOrganizer,
            bool isActive,
            uint256 participantCount
        ) = Hackathon(hackathonAddress).getHackathonDetails();

        assertEq(name, "Web3 Hackathon");
        assertEq(description, "Build the future of Web3");
        assertEq(hackathonOrganizer, organizer);
        assertEq(prizePool, PRIZE_POOL);
        assertTrue(isActive);
        assertEq(participantCount, 0);
    }

    function testCreateHackathonWithPastStartTimeReverts() public {
        vm.prank(organizer);
        vm.expectRevert("Start time must be in the future");
        factory.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp - 1, // Past time
            block.timestamp + DURATION,
            1 ether,
            new address[](0), // selected judges (empty)
            250,
            0.01 ether,
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether),
            1 days,
            1 days // judging duration
        );
    }

    function testCreateHackathonWithNoPrizeReverts() public {
        vm.prank(organizer);
        vm.expectRevert("Prize pool must be greater than 0");
        factory.createHackathon{value: 0}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether,
            new address[](0), // selected judges (empty)
            250,
            0.01 ether,
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether),
            1 days,
            1 days // judging duration
        );
    }

    function testCreateHackathonWithInvalidEndTimeReverts() public {
        vm.prank(organizer);
        vm.expectRevert("End time must be after start time");
        factory.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET - 1, // End before start
            1 ether,
            new address[](0), // selected judges (empty)
            250,
            0.01 ether,
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether),
            1 days,
            1 days // judging duration
        );
    }

    function testCreateHackathonWithExcessiveCooldownReverts() public {
        vm.prank(organizer);
        vm.expectRevert("Prize claim cooldown cannot exceed 7 days");
        factory.createHackathon{value: PRIZE_POOL}(
            "Web3 Hackathon",
            "Build the future of Web3",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether,
            new address[](0), // selected judges (empty)
            250,
            0.01 ether,
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether),
            8 days, // Exceeds 7 day maximum
            1 days // judging duration
        );
    }

    function testMultipleHackathons() public {
        // Create first hackathon
        vm.prank(organizer);
        address hackathon1 = factory.createHackathon{value: PRIZE_POOL}(
            "Hackathon 1",
            "First hackathon",
            block.timestamp + START_OFFSET,
            block.timestamp + START_OFFSET + DURATION,
            1 ether,
            new address[](0), // selected judges (empty)
            250,
            0.01 ether,
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether),
            1 days,
            1 days // judging duration
        );

        // Create second hackathon
        vm.prank(organizer);
        address hackathon2 = factory.createHackathon{value: PRIZE_POOL}(
            "Hackathon 2",
            "Second hackathon",
            block.timestamp + START_OFFSET + 1 days,
            block.timestamp + START_OFFSET + 1 days + DURATION,
            1 ether,
            new address[](0), // selected judges (empty)
            250,
            0.01 ether,
            _createPrizeDistribution(3 ether, 1.5 ether, 0.5 ether),
            1 days,
            1 days // judging duration
        );

        assertEq(factory.getHackathonCount(), 2);
        assertEq(factory.getOrganizerHackathon(organizer, 0), hackathon1);
        assertEq(factory.getOrganizerHackathon(organizer, 1), hackathon2);
        assertTrue(hackathon1 != hackathon2);
    }
}
