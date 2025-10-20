// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./StakeSystem.sol";
import "./VotingSystem.sol";
import "./JudgingSystem.sol";

contract Hackathon is StakeSystem, VotingSystem, JudgingSystem {

    struct Submission {
        address participant;
        string projectName;
        string projectUrl;
        uint256 submissionTime;
        uint256 score;
        bool isEvaluated;
    }

    struct Sponsor {
        address sponsorAddress;
        uint256 contribution;
        bool isActive;
    }

    uint256 public hackathonId;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public prizePool;
    address public organizer;
    bool public isActive;

    address public factory;
    uint256 public participantCount;
    uint256 public minimumSponsorContribution;
    uint256 public judgingDuration;
    uint256 public votingStartTime;
    uint256 public claimingStartTime;

    mapping(address => Submission) public submissions;
    mapping(address => bool) public isRegistered;
    mapping(address => bool) public hasSubmitted;
    uint256 public totalSubmissions;

    mapping(address => Sponsor) public sponsors;

    address[] public sponsorList;
    uint256 public totalSponsorContributions;

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

    event SponsorAdded(
        address indexed sponsor,
        uint256 contribution
    );

    event SubmissionScored(
        address indexed participant,
        uint256 score
    );

    modifier onlyOrganizer() {
        require(
            msg.sender == organizer,
            "Only organizer can call this function"
        );
        _;
    }

    modifier hackathonActive() {
        require(
            isActive,
            "Hackathon is not active"
        );

        require(
            block.timestamp >= startTime,
            "Hackathon has not started yet"
        );

        require(
            block.timestamp <= endTime,
            "Hackathon has ended"
        );
        _;
    }

    modifier onlyRegistered() {
        require(
            isRegistered[msg.sender],
            "Not registered for this hackathon"
        );
        _;
    }

    modifier onlySponsor() {
        require(
            sponsors[msg.sender].isActive,
            "Only sponsors can call this function"
        );
        _;
    }

    /**
     * @dev Internal function to initialize hackathon parameters (for cloning)
     * @notice This function is called by the implementation contract during initialization
     */
    function _initializeHackathon(
        uint256 _hackathonId,
        uint256 _startTime,
        uint256 _endTime,
        uint256[] memory _prizeDistribution,
        uint256 _stakeAmount,
        uint256 _prizeClaimCooldown,
        uint256 _judgingDuration,
        uint256 _judgeRewardPercentage,
        address[] memory _selectedJudges
    )
        internal
    {
        require(
            _startTime > block.timestamp,
            "Start time must be in the future"
        );

        require(
            _endTime > _startTime,
            "End time must be after start time"
        );

        require(
            _prizeDistribution.length > 0,
            "Must have at least 1 winner"
        );

        require(
            _prizeClaimCooldown > 0,
            "Prize claim cooldown must be greater than 0"
        );

        require(
            _judgingDuration >= 2 hours && _judgingDuration <= 2 days,
            "Judging duration must be between 2 hours and 2 days"
        );

        // Validate prize distribution
        uint256 totalDistribution = 0;
        for (uint256 i = 0; i < _prizeDistribution.length; i++) {
            require(_prizeDistribution[i] > 0, "Each prize distribution must be greater than 0");
            totalDistribution += _prizeDistribution[i];
        }

        // Initialize all hackathon state variables
        hackathonId = _hackathonId;
        startTime = _startTime;
        endTime = _endTime;
        isActive = true;
        participantCount = 0;
        totalSponsorContributions = 0;
        stakeAmount = _stakeAmount;
        prizeClaimCooldown = _prizeClaimCooldown;
        judgingDuration = _judgingDuration;
        pointsPerJudge = 100;
        votingOpen = false;
        totalStakes = 0;

        // Calculate all phase timestamps upfront
        votingStartTime = _endTime; // Voting starts when hackathon ends
        votingEndTime = votingStartTime + _judgingDuration;
        claimingStartTime = votingEndTime + _prizeClaimCooldown;

        // Initialize inherited systems
        // StakeSystem initialization
        stakeAmount = _stakeAmount;

        // VotingSystem initialization
        prizeDistribution = _prizeDistribution;
        prizeClaimCooldown = _prizeClaimCooldown;
        pointsPerJudge = 100;
        maxWinners = _prizeDistribution.length;
        prizePool = totalDistribution;

        // Initialize judging system
        judgeRewardPercentage = _judgeRewardPercentage;

        // Add selected judges
        for (uint256 i = 0; i < _selectedJudges.length; i++) {
            require(_selectedJudges[i] != address(0), "Invalid judge address");
            isJudge[_selectedJudges[i]] = true;
            judgeList.push(_selectedJudges[i]);
        }
    }

    /**
     * @dev Initialize the cloned hackathon with actual parameters
     * @notice This function is called once after cloning to set the actual hackathon parameters
     * @notice Only the factory can call this function
     */
    function initialize(
        address _organizer,
        uint256 _hackathonId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minimumSponsorContribution,
        uint256 _stakeAmount,
        uint256[] memory _prizeDistribution,
        address _factory,
        address[] memory _selectedJudges
    )
        external
        payable
    {
        // Only factory can call initialize
        require(
            msg.sender == _factory,
            "Only factory can initialize"
        );

        // Prevent multiple initialization
        require(
            organizer == address(0),
            "Already initialized"
        );

        // Set the organizer and factory
        organizer = _organizer;
        factory = _factory;

        // Set parameters
        minimumSponsorContribution = _minimumSponsorContribution;
        uint256 _prizeClaimCooldown = 1 days; // Default prize claim cooldown
        uint256 _judgingDuration = 1 days; // Default judging duration
        uint256 _judgeRewardPercentage = 50; // Default 0.5% judge reward

        // Initialize the hackathon with the provided parameters
        _initializeHackathon(
            _hackathonId,
            _startTime,
            _endTime,
            _prizeDistribution,
            _stakeAmount,
            _prizeClaimCooldown,
            _judgingDuration,
            _judgeRewardPercentage,
            _selectedJudges
        );
    }

    /**
     * @dev Registers a participant for this hackathon
     */
    function register()
        external
        payable
    {
        require(
            isActive,
            "Hackathon is not active"
        );

        require(
            block.timestamp < startTime,
            "Registration closed - hackathon has started"
        );

        require(
            isRegistered[msg.sender] == false,
            "Already registered"
        );

        isRegistered[msg.sender] = true;
        participantCount++;

        // Use inherited stake system
        _depositStake(
            msg.sender
        );

        emit ParticipantRegistered(
            msg.sender
        );
    }

    /**
     * @dev Submits a project for this hackathon
     * @param _projectName Name of the project
     * @param _projectUrl URL of the project repository or demo
     */
    function submitProject(
        string memory _projectName,
        string memory _projectUrl
    )
        external
        onlyDuringSubmission
        onlyRegistered
    {
        require(
            !hasSubmitted[msg.sender],
            "Already submitted"
        );

        submissions[msg.sender] = Submission({
            participant: msg.sender,
            projectName: _projectName,
            projectUrl: _projectUrl,
            submissionTime: block.timestamp,
            score: 0,
            isEvaluated: false
        });

        hasSubmitted[msg.sender] = true;
        totalSubmissions++;

        // Return stake to participant
        uint256 stake = participantStakes[msg.sender];
        if (stake > 0) {
            participantStakes[msg.sender] = 0;
            totalStakes -= stake;
            payable(msg.sender).transfer(stake);
            emit StakeReturned(
                msg.sender, stake);
        }

        emit SubmissionMade(
            msg.sender,
            _projectName
        );
    }

    /**
     * @dev Checks if an address is registered for this hackathon
     * @param _participant Address to check
     */
    function isParticipantRegistered(
        address _participant
    )
        external
        view
        returns (bool)
    {
        return isRegistered[
            _participant
        ];
    }

    /**
     * @dev Gets submission details for a participant
     * @param _participant Address of the participant
     */
    function getSubmission(
        address _participant
    )
        external
        view
        returns (
            address participant,
            string memory projectName,
            string memory projectUrl,
            uint256 submissionTime,
            uint256 score,
            bool isEvaluated
        )
    {
        Submission storage submission = submissions[
            _participant
        ];

        return (
            submission.participant,
            submission.projectName,
            submission.projectUrl,
            submission.submissionTime,
            submission.score,
            submission.isEvaluated
        );
    }

    /**
     * @dev Distributes prize to winner (only organizer or sponsors)
     * @param _winner Address of the winner
     * @param _amount Amount to distribute
     */
    function distributePrize(
        address _winner,
        uint256 _amount
    )
        external
    {
        require(
            msg.sender == organizer || sponsors[msg.sender].isActive,
            "Only organizer or sponsors can distribute prizes"
        );

        require(!isActive || block.timestamp > endTime, "Hackathon is still active");
        require(_amount <= prizePool, "Amount exceeds prize pool");
        require(_amount > 0, "Amount must be greater than 0");

        prizePool -= _amount;

        payable(_winner).transfer(
            _amount
        );

        emit PrizeDistributed(
            _winner,
            _amount
        );
    }

    /**
     * @dev Gets hackathon details
     */
    function getHackathonDetails()
        external
        view
        returns (
            uint256 _hackathonId,
            uint256 _startTime,
            uint256 _endTime,
            uint256 _prizePool,
            address _organizer,
            bool _isActive,
            uint256 _participantCount
        )
    {
        return (
            hackathonId,
            startTime,
            endTime,
            prizePool,
            organizer,
            isActive,
            participantCount
        );
    }

    /**
     * @dev Checks if hackathon is currently accepting registrations
     */
    function isRegistrationOpen()
        external
        view
        returns (bool)
    {
        return isActive && block.timestamp < startTime;
    }

    /**
     * @dev Checks if hackathon is currently accepting submissions
     */
    function isSubmissionOpen()
        external
        view
        returns (bool)
    {
        return isActive && block.timestamp >= startTime && block.timestamp <= endTime;
    }


    modifier onlyDuringSubmission() {
        require(isActive && block.timestamp >= startTime && block.timestamp <= endTime, "Not during submission phase");
        _;
    }

    modifier onlyDuringVoting() {
        require(block.timestamp >= votingStartTime && block.timestamp <= votingEndTime, "Not during voting phase");
        _;
    }

    modifier onlyDuringClaiming() {
        require(block.timestamp >= claimingStartTime, "Not during claiming phase");
        _;
    }

    /**
     * @dev Check if hackathon is currently active based on timestamps
     */
    function _updateActiveStatus() internal {
        isActive = block.timestamp >= startTime && block.timestamp <= endTime;
    }

    /**
     * @dev Allows anyone to become a sponsor by contributing the minimum amount
     */
    function becomeSponsor()
        external
        payable
    {
        require(
            msg.value >= minimumSponsorContribution,
            "Contribution below minimum required"
        );

        require(
            sponsors[msg.sender].isActive == false,
            "Already a sponsor"
        );

        sponsors[msg.sender] = Sponsor({
            sponsorAddress: msg.sender,
            contribution: msg.value,
            isActive: true
        });

        sponsorList.push(msg.sender);
        totalSponsorContributions += msg.value;

        // Add judge rewards from sponsor contribution
        uint256 judgeReward = msg.value * getJudgeRewardPercentage() / 10000;
        judgeRewardPool += judgeReward;

        emit SponsorAdded(
            msg.sender,
            msg.value
        );
    }

    /**
     * @dev Adds a judge to the hackathon (only organizer can call)
     * @param _judge Address of the judge
     */
    function addJudge(
        address _judge
    )
        public
        override
        onlyOrganizer
    {
        require(isActive, "Cannot add judges to inactive hackathon");
        require(block.timestamp < endTime, "Cannot add judges after hackathon ends");

        // Call inherited function directly
        JudgingSystem.addJudge(_judge);
    }

    /**
     * @dev Allows a judge to score a submission
     * @param _participant Address of the participant
     * @param _score Score to assign (0-100)
     */
    function scoreSubmission(
        address _participant,
        uint256 _score
    )
        external
    {
        require(
            isJudgeOrDelegate(msg.sender),
            "Only judges can score"
        );

        require(
            hasSubmitted[_participant],
            "No submission found"
        );

        require(_score <= 100, "Score must be between 0 and 100");
        require(!submissions[_participant].isEvaluated, "Submission already evaluated");

        submissions[_participant].score = _score;
        submissions[_participant].isEvaluated = true;

        emit SubmissionScored(
            _participant,
            _score
        );
    }

    /**
     * @dev Gets all sponsors
     */
    function getSponsors()
        external
        view
        returns (address[] memory)
    {
        return sponsorList;
    }

    /**
     * @dev Gets sponsor contribution amount
     * @param _sponsor Address of the sponsor
     */
    function getSponsorContribution(
        address _sponsor
    )
        external
        view
        returns (uint256)
    {
        return sponsors[_sponsor].contribution;
    }

    /**
     * @dev Claim judge reward (hackathon-specific)
     */
    function claimJudgeReward()
        external
    {
        require(isJudgeOrDelegate(msg.sender), "Only judges or their delegates can claim rewards");
        address actualJudge = isJudge[msg.sender] ? msg.sender : delegateToJudge[msg.sender];
        require(!hasReceivedJudgeReward[actualJudge], "Already claimed judge reward");
        require(judgeList.length > 0, "No judges to distribute rewards to");

        uint256 rewardPerJudge = judgeRewardPool / judgeList.length;
        require(rewardPerJudge > 0, "Insufficient reward per judge");

        hasReceivedJudgeReward[actualJudge] = true;
        payable(msg.sender).transfer(rewardPerJudge);
        emit JudgeRewardDistributed(actualJudge, rewardPerJudge);
    }


    /**
     * @dev Gets total prize pool including sponsor contributions
     */
    function getTotalPrizePool()
        external
        view
        returns (uint256)
    {
        return prizePool;
    }

    /**
     * @dev Gets minimum sponsor contribution required
     */
    function getMinimumSponsorContribution()
        external
        view
        returns (uint256)
    {
        return minimumSponsorContribution;
    }



    // ========== Voting System Functions ==========


    /**
     * @dev Allows a judge to vote on submissions by allocating points
     * @param _participant Address of the participant to vote for
     * @param _points Points to allocate (0-100)
     */
    function voteForSubmission(
        address _participant,
        uint256 _points
    )
        external
        onlyDuringVoting
    {
        _updateActiveStatus();

        require(
            isJudgeOrDelegate(msg.sender),
            "Only judges can vote"
        );

        require(
            hasSubmitted[_participant],
            "Participant has not submitted"
        );

        require(
            _points <= pointsPerJudge,
            "Cannot allocate more points than allowed"
        );

        require(
            hasVoted[msg.sender] == false,
            "Judge has already voted"
        );

        // Check if judge has already allocated points to this participant
        uint256 currentPoints = judgeVotes[msg.sender][_participant];

        require(
            currentPoints == 0,
            "Judge has already voted for this participant"
        );

        judgeVotes[msg.sender][_participant] = _points;
        totalPoints[_participant] += _points;

        emit JudgeVoted(
            msg.sender,
            _participant,
            _points
        );
    }

    /**
     * @dev Allows winners to claim their prize after cooldown period
     */
    function claimPrize()
        external
        onlyDuringClaiming
    {
        require(
            hasSubmitted[msg.sender],
            "Must have submitted a project"
        );

        _claimPrize(
            msg.sender,
            prizePool
        );
    }

    /**
     * @notice Get prize amount for a participant
     * @dev Uses VotingSystem's internal function to calculate prize amount
     * @param _participant Address of the participant
     * @return Prize amount for the participant
     */
    function getPrizeAmount(
        address _participant
    )
        external
        view
        returns (uint256)
    {
        return _getPrizeAmount(
            _participant
        );
    }

    /**
     * @notice Check if a participant is a winner
     * @dev Public function to check if a participant is a winner
     * @param _participant Address of the participant
     * @return True if the participant is a winner, false otherwise
     */
    function isWinner(
        address _participant
    )
        external
        view
        returns (bool)
    {
        return _isWinner(
            _participant
        );
    }

    /**
     * @notice Check if a participant has claimed their prize
     * @dev Public function to check if a participant has claimed their prize
     * @param _participant Address of the participant
     * @return True if prize has been claimed, false otherwise
     */
    function getHasClaimedPrize(
        address _participant
    )
        external
        view
        returns (bool)
    {
        return hasClaimedPrize[
            _participant
        ];
    }
}
