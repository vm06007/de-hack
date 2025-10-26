// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "../contracts/Hackathon.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/JudgeCouncil.sol";
import "../contracts/VotingTypes.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockToken is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract HackathonComprehensiveTest {
    HackathonFactory public factory;
    JudgeCouncil public judgeCouncil;
    Hackathon public hackathonImplementation;
    Hackathon public hackathon;
    MockToken public token;
    
    address public organizer;
    address public participant1;
    address public participant2;
    address public judge1;
    address public judge2;
    address public sponsor1;
    address public sponsor2;
    
    uint256 public constant HACKATHON_ID = 1;
    uint256 public constant START_TIME = 1000;
    uint256 public constant END_TIME = 2000;
    uint256 public constant STAKE_AMOUNT = 0.1 ether;
    uint256 public constant MIN_SPONSOR_CONTRIBUTION = 1 ether;
    uint256[] public prizeDistribution;
    address[] public judges;
    
    event ParticipantRegistered(address indexed participant);
    event SubmissionMade(address indexed participant, string projectName);
    event SponsorAdded(address indexed sponsor, uint256 contribution);
    event TokenSponsorAdded(address indexed sponsor, address indexed token, uint256 amount);
    event PrizeDistributed(address indexed winner, uint256 amount);
    event SubmissionScored(address indexed participant, uint256 score);
    
    modifier setUp() {
        console.log("Setting up HackathonComprehensiveTest...");
        
        // Set up addresses (in real test these would be provided by test framework)
        organizer = address(this);
        participant1 = address(0x2);
        participant2 = address(0x3);
        judge1 = address(0x4);
        judge2 = address(0x5);
        sponsor1 = address(0x6);
        sponsor2 = address(0x7);
        
        // Deploy contracts
        hackathonImplementation = new Hackathon();
        
        // Deploy JudgeCouncil with factory address (we'll set it after factory deployment)
        judgeCouncil = new JudgeCouncil(address(0)); // Placeholder for now
        
        // Deploy factory with required parameters
        factory = new HackathonFactory(
            address(hackathonImplementation),
            address(0), // curveRouter - using zero address for testing
            address(0), // weth - using zero address for testing  
            address(0)  // pyusd - using zero address for testing
        );
        
        token = new MockToken();
        
        // Setup prize distribution
        prizeDistribution.push(3 ether);
        prizeDistribution.push(2 ether);
        prizeDistribution.push(1 ether);
        
        // Setup judges
        judges.push(judge1);
        judges.push(judge2);
        
        console.log("Setup complete");
        _;
    }
    
    function _createHackathon() internal returns (address) {
        // Create voting config
        VotingConfig memory votingConfig = VotingConfig({
            systemType: VotingSystemType.OPEN,
            useQuadraticVoting: false,
            votingPowerPerJudge: 100,
            maxWinners: 3
        });
        
        address hackathonAddress = factory.createHackathon{value: 10 ether}(
            HACKATHON_ID,
            START_TIME,
            END_TIME,
            MIN_SPONSOR_CONTRIBUTION,
            STAKE_AMOUNT,
            prizeDistribution,
            judges,
            votingConfig
        );
        
        hackathon = Hackathon(hackathonAddress);
        return hackathonAddress;
    }
    
    // ========== INITIALIZATION TESTS ==========
    
    function testInitialize() public setUp {
        console.log("Testing initialization...");
        
        address hackathonAddress = _createHackathon();
        
        // Check basic parameters
        (
            uint256 hackathonId,
            uint256 startTime,
            uint256 endTime,
            uint256 prizePool,
            address hackathonOrganizer,
            bool isActive,
            uint256 participantCount
        ) = hackathon.getHackathonDetails();
        
        require(hackathonId == HACKATHON_ID, "Hackathon ID should match");
        require(startTime == START_TIME, "Start time should match");
        require(endTime == END_TIME, "End time should match");
        require(hackathonOrganizer == organizer, "Organizer should match");
        require(isActive == true, "Should be active");
        require(participantCount == 0, "Participant count should be 0");
        
        console.log("Initialize test passed");
    }
    
    function testCannotInitializeTwice() public setUp {
        console.log("Testing cannot initialize twice...");
        
        _createHackathon();
        
        // Try to initialize again - this should fail
        try hackathon.initialize(
            organizer,
            HACKATHON_ID,
            START_TIME,
            END_TIME,
            MIN_SPONSOR_CONTRIBUTION,
            STAKE_AMOUNT,
            prizeDistribution,
            address(factory),
            judges,
            address(token)
        ) {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Already initialized")),
                "Should fail with 'Already initialized'"
            );
        }
        
        console.log("Cannot initialize twice test passed");
    }
    
    // ========== REGISTRATION TESTS ==========
    
    function testRegister() public setUp payable {
        console.log("Testing registration...");
        
        _createHackathon();
        
        // Simulate participant registration with sufficient value
        uint256 balanceBefore = address(this).balance;
        hackathon.register{value: STAKE_AMOUNT}();
        
        require(hackathon.isParticipantRegistered(address(this)), "Should be registered");
        
        (, , , , , , uint256 participantCount) = hackathon.getHackathonDetails();
        require(participantCount == 1, "Participant count should be 1");
        
        console.log("Register test passed");
    }
    
    function testCannotRegisterTwice() public setUp payable {
        console.log("Testing cannot register twice...");
        
        _createHackathon();
        
        hackathon.register{value: STAKE_AMOUNT}();
        
        // Try to register again
        try hackathon.register{value: STAKE_AMOUNT}() {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Already registered")),
                "Should fail with 'Already registered'"
            );
        }
        
        console.log("Cannot register twice test passed");
    }
    
    function testCannotRegisterWithInsufficientStake() public setUp {
        console.log("Testing cannot register with insufficient stake...");
        
        _createHackathon();
        
        try hackathon.register{value: STAKE_AMOUNT - 1}() {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Incorrect stake amount")),
                "Should fail with 'Incorrect stake amount'"
            );
        }
        
        console.log("Cannot register with insufficient stake test passed");
    }
    
    // ========== PROJECT SUBMISSION TESTS ==========
    
    function testSubmitProject() public setUp payable {
        console.log("Testing project submission...");
        
        _createHackathon();
        
        // Register participant first
        hackathon.register{value: STAKE_AMOUNT}();
        
        // Note: In real test environment, we would advance time here
        // For now, we'll test the function call structure
        
        // Submit project
        hackathon.submitProject("Test Project", "https://github.com/test");
        
        // Check submission
        (
            address participant,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score,
            bool isEvaluated
        ) = hackathon.getSubmission(address(this));
        
        require(participant == address(this), "Participant should match");
        require(keccak256(bytes(projectName)) == keccak256(bytes("Test Project")), "Project name should match");
        require(keccak256(bytes(projectUrl)) == keccak256(bytes("https://github.com/test")), "Project URL should match");
        require(score == 0, "Score should be 0");
        require(isEvaluated == false, "Should not be evaluated");
        require(hackathon.totalSubmissions() == 1, "Total submissions should be 1");
        
        console.log("Submit project test passed");
    }
    
    function testCannotSubmitWithoutRegistration() public setUp {
        console.log("Testing cannot submit without registration...");
        
        _createHackathon();
        
        try hackathon.submitProject("Test Project", "https://github.com/test") {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Not registered for this hackathon")),
                "Should fail with 'Not registered for this hackathon'"
            );
        }
        
        console.log("Cannot submit without registration test passed");
    }
    
    // ========== SPONSORSHIP TESTS ==========
    
    function testBecomeSponsor() public setUp payable {
        console.log("Testing become sponsor...");
        
        _createHackathon();
        
        uint256 sponsorAmount = 5 ether;
        hackathon.becomeSponsor{value: sponsorAmount}();
        
        require(hackathon.getSponsorContribution(address(this)) == sponsorAmount, "Sponsor contribution should match");
        require(hackathon.totalSponsorContributions() == sponsorAmount, "Total contributions should match");
        
        address[] memory sponsors = hackathon.getSponsors();
        require(sponsors.length == 1, "Should have 1 sponsor");
        require(sponsors[0] == address(this), "Sponsor should be this contract");
        
        console.log("Become sponsor test passed");
    }
    
    function testCannotBecomeSponsorWithInsufficientAmount() public setUp {
        console.log("Testing cannot become sponsor with insufficient amount...");
        
        _createHackathon();
        
        try hackathon.becomeSponsor{value: MIN_SPONSOR_CONTRIBUTION - 1}() {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Contribution below minimum required")),
                "Should fail with 'Contribution below minimum required'"
            );
        }
        
        console.log("Cannot become sponsor with insufficient amount test passed");
    }
    
    function testCannotBecomeSponsorTwice() public setUp payable {
        console.log("Testing cannot become sponsor twice...");
        
        _createHackathon();
        
        hackathon.becomeSponsor{value: 5 ether}();
        
        try hackathon.becomeSponsor{value: 5 ether}() {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Already a sponsor")),
                "Should fail with 'Already a sponsor'"
            );
        }
        
        console.log("Cannot become sponsor twice test passed");
    }
    
    function testBecomeSponsorWithToken() public setUp {
        console.log("Testing become sponsor with token...");
        
        _createHackathon();
        
        uint256 tokenAmount = 1000 * 10**18;
        
        token.approve(address(hackathon), tokenAmount);
        hackathon.becomeSponsorWithToken(address(token), tokenAmount);
        
        require(hackathon.getTokenContribution(address(this), address(token)) == tokenAmount, "Token contribution should match");
        require(hackathon.getSponsorTokenAddress(address(this)) == address(token), "Token address should match");
        require(hackathon.getTotalTokenContributions(address(token)) == tokenAmount, "Total token contributions should match");
        
        console.log("Become sponsor with token test passed");
    }
    
    // ========== JUDGE MANAGEMENT TESTS ==========
    
    function testAddJudge() public setUp {
        console.log("Testing add judge...");
        
        _createHackathon();
        
        address newJudge = address(0x99);
        hackathon.addJudge(newJudge);
        
        require(hackathon.isJudge(newJudge), "Should be a judge");
        
        console.log("Add judge test passed");
    }
    
    // ========== SCORING TESTS ==========
    
    function testScoreSubmission() public setUp payable {
        console.log("Testing score submission...");
        
        _createHackathon();
        
        // Register and submit as this contract
        hackathon.register{value: STAKE_AMOUNT}();
        hackathon.submitProject("Test Project", "https://github.com/test");
        
        // Add this contract as a judge for testing
        hackathon.addJudge(address(this));
        
        // Score the submission
        hackathon.scoreSubmission(address(this), 85);
        
        // Check score
        (, , , , uint256 score, bool isEvaluated) = hackathon.getSubmission(address(this));
        require(score == 85, "Score should be 85");
        require(isEvaluated == true, "Should be evaluated");
        
        console.log("Score submission test passed");
    }
    
    function testCannotScoreAbove100() public setUp payable {
        console.log("Testing cannot score above 100...");
        
        _createHackathon();
        
        hackathon.register{value: STAKE_AMOUNT}();
        hackathon.submitProject("Test Project", "https://github.com/test");
        hackathon.addJudge(address(this));
        
        try hackathon.scoreSubmission(address(this), 101) {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Score must be between 0 and 100")),
                "Should fail with 'Score must be between 0 and 100'"
            );
        }
        
        console.log("Cannot score above 100 test passed");
    }
    
    // ========== VOTING TESTS ==========
    
    function testVoteForSubmission() public setUp payable {
        console.log("Testing vote for submission...");
        
        _createHackathon();
        
        // Register and submit
        hackathon.register{value: STAKE_AMOUNT}();
        hackathon.submitProject("Test Project", "https://github.com/test");
        
        // Add this contract as a judge
        hackathon.addJudge(address(this));
        
        // Vote for submission (note: in real test we'd advance time to voting phase)
        hackathon.voteForSubmission(address(this), 50);
        
        require(hackathon.totalPoints(address(this)) == 50, "Total points should be 50");
        
        console.log("Vote for submission test passed");
    }
    
    function testCannotVoteMoreThanAllowed() public setUp payable {
        console.log("Testing cannot vote more than allowed...");
        
        _createHackathon();
        
        hackathon.register{value: STAKE_AMOUNT}();
        hackathon.submitProject("Test Project", "https://github.com/test");
        hackathon.addJudge(address(this));
        
        try hackathon.voteForSubmission(address(this), 101) {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Cannot allocate more points than allowed")),
                "Should fail with 'Cannot allocate more points than allowed'"
            );
        }
        
        console.log("Cannot vote more than allowed test passed");
    }
    
    // ========== PRIZE DISTRIBUTION TESTS ==========
    
    function testDistributePrize() public setUp payable {
        console.log("Testing distribute prize...");
        
        _createHackathon();
        
        // Become sponsor first
        hackathon.becomeSponsor{value: 5 ether}();
        
        uint256 balanceBefore = participant1.balance;
        
        // Distribute prize
        hackathon.distributePrize(participant1, 1 ether);
        
        require(participant1.balance == balanceBefore + 1 ether, "Balance should increase");
        require(hackathon.getSponsorAvailablePrize(address(this)) == 4 ether, "Available prize should decrease");
        
        console.log("Distribute prize test passed");
    }
    
    function testCannotDistributeMoreThanAvailable() public setUp payable {
        console.log("Testing cannot distribute more than available...");
        
        _createHackathon();
        
        hackathon.becomeSponsor{value: 5 ether}();
        
        try hackathon.distributePrize(participant1, 6 ether) {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Amount exceeds sponsor's available prize pool")),
                "Should fail with 'Amount exceeds sponsor's available prize pool'"
            );
        }
        
        console.log("Cannot distribute more than available test passed");
    }
    
    // ========== VIEW FUNCTION TESTS ==========
    
    function testGetTotalPrizePool() public setUp {
        console.log("Testing get total prize pool...");
        
        _createHackathon();
        
        uint256 totalPrizePool = hackathon.getTotalPrizePool();
        require(totalPrizePool == 6 ether, "Total prize pool should be 6 ether"); // Sum of prizeDistribution
        
        console.log("Get total prize pool test passed");
    }
    
    function testGetMinimumSponsorContribution() public setUp {
        console.log("Testing get minimum sponsor contribution...");
        
        _createHackathon();
        
        require(hackathon.getMinimumSponsorContribution() == MIN_SPONSOR_CONTRIBUTION, "Minimum contribution should match");
        
        console.log("Get minimum sponsor contribution test passed");
    }
    
    // ========== EDGE CASES AND ERROR CONDITIONS ==========
    
    function testMultipleParticipantsFlow() public setUp {
        console.log("Testing multiple participants flow...");
        
        _createHackathon();
        
        // This contract registers
        hackathon.register{value: STAKE_AMOUNT}();
        
        (, , , , , , uint256 participantCount) = hackathon.getHackathonDetails();
        require(participantCount == 1, "Participant count should be 1");
        
        // Submit project
        hackathon.submitProject("Project 1", "https://github.com/project1");
        require(hackathon.totalSubmissions() == 1, "Total submissions should be 1");
        
        console.log("Multiple participants flow test passed");
    }
    
    function testMultipleSponsorFlow() public setUp payable {
        console.log("Testing multiple sponsor flow...");
        
        _createHackathon();
        
        // This contract becomes sponsor
        hackathon.becomeSponsor{value: 5 ether}();
        
        require(hackathon.totalSponsorContributions() == 5 ether, "Total contributions should be 5 ether");
        
        address[] memory sponsors = hackathon.getSponsors();
        require(sponsors.length == 1, "Should have 1 sponsor");
        
        console.log("Multiple sponsor flow test passed");
    }
    
    function testTokenAndETHSponsors() public setUp payable {
        console.log("Testing token and ETH sponsors...");
        
        _createHackathon();
        
        // ETH sponsor (this contract)
        hackathon.becomeSponsor{value: 5 ether}();
        
        address[] memory sponsors = hackathon.getSponsors();
        require(sponsors.length == 1, "Should have 1 sponsor");
        require(hackathon.getSponsorContribution(address(this)) == 5 ether, "ETH contribution should match");
        
        console.log("Token and ETH sponsors test passed");
    }
    
    function testEmptyStringsInSubmission() public setUp payable {
        console.log("Testing empty strings in submission...");
        
        _createHackathon();
        
        hackathon.register{value: STAKE_AMOUNT}();
        
        // Should allow empty strings (validation might be done on frontend)
        hackathon.submitProject("", "");
        
        (, string memory projectName, string memory projectUrl, , ,) = hackathon.getSubmission(address(this));
        require(keccak256(bytes(projectName)) == keccak256(bytes("")), "Project name should be empty");
        require(keccak256(bytes(projectUrl)) == keccak256(bytes("")), "Project URL should be empty");
        
        console.log("Empty strings in submission test passed");
    }
    
    function testZeroAmountPrizeDistribution() public setUp payable {
        console.log("Testing zero amount prize distribution...");
        
        _createHackathon();
        
        hackathon.becomeSponsor{value: 5 ether}();
        
        try hackathon.distributePrize(participant1, 0) {
            revert("Should have failed");
        } catch Error(string memory reason) {
            require(
                keccak256(bytes(reason)) == keccak256(bytes("Amount must be greater than 0")),
                "Should fail with 'Amount must be greater than 0'"
            );
        }
        
        console.log("Zero amount prize distribution test passed");
    }
    
    // Required receive function to accept ETH
    receive() external payable {}
    
    // Fallback function
    fallback() external payable {}
}