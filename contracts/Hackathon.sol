// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Hackathon
 * @dev Individual hackathon contract deployed for each hackathon instance
 */
contract Hackathon {

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

    // Hackathon details
    string public name;
    string public description;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public prizePool;
    address public organizer;
    bool public isActive;
    uint256 public participantCount;
    uint256 public minimumSponsorContribution;

    // Submissions and participants
    mapping(address => Submission) public submissions;
    mapping(address => bool) public hasSubmitted;
    mapping(address => bool) public isRegistered;

    // Sponsors and judges
    mapping(address => Sponsor) public sponsors;
    mapping(address => bool) public isJudge;
    address[] public sponsorList;
    address[] public judgeList;
    uint256 public totalSponsorContributions;
    
    // Judge incentives
    uint256 public judgeRewardPercentage; // Configurable percentage (0-500, representing 0.00% to 5.00%)
    uint256 public judgeRewardPool;
    mapping(address => bool) public hasReceivedJudgeReward;

    event ParticipantRegistered(address indexed participant);
    event SubmissionMade(address indexed participant, string projectName);
    event PrizeDistributed(address indexed winner, uint256 amount);
    event HackathonEnded();
    event SponsorAdded(address indexed sponsor, uint256 contribution);
    event JudgeAdded(address indexed judge);
    event SubmissionScored(address indexed participant, uint256 score);
    event JudgeRewardDistributed(address indexed judge, uint256 amount);

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can call this function");
        _;
    }

    modifier hackathonActive() {
        require(isActive, "Hackathon is not active");
        require(block.timestamp >= startTime, "Hackathon has not started yet");
        require(block.timestamp <= endTime, "Hackathon has ended");
        _;
    }

    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "Not registered for this hackathon");
        _;
    }

    modifier onlySponsor() {
        require(sponsors[msg.sender].isActive, "Only sponsors can call this function");
        _;
    }

    modifier onlyJudge() {
        require(isJudge[msg.sender], "Only judges can call this function");
        _;
    }
    
    modifier onlyOrganizerOrFactory() {
        require(msg.sender == organizer || msg.sender == address(this), "Only organizer or factory can call this function");
        _;
    }
    
    // Flag to allow factory to add judges during deployment
    bool private factoryCanAddJudges = true;

    /**
     * @dev Constructor to initialize hackathon details
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @param _organizer Address of the organizer
     * @param _minimumSponsorContribution Minimum contribution required to become a sponsor
     * @param _judgeRewardPercentage Judge reward percentage (0-500, representing 0.00% to 5.00%)
     */
    constructor(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        address _organizer,
        uint256 _minimumSponsorContribution,
        uint256 _judgeRewardPercentage
    ) payable {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(msg.value > 0, "Prize pool must be greater than 0");
        require(_organizer != address(0), "Invalid organizer address");
        require(_judgeRewardPercentage <= 500, "Judge reward percentage cannot exceed 5.00%");

        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        prizePool = msg.value;
        organizer = _organizer;
        isActive = true;
        participantCount = 0;
        totalSponsorContributions = 0;
        minimumSponsorContribution = _minimumSponsorContribution;
        judgeRewardPercentage = _judgeRewardPercentage;
        judgeRewardPool = (msg.value * _judgeRewardPercentage) / 10000; // Divide by 10000 for 2 decimal precision
    }

    /**
     * @dev Registers a participant for this hackathon
     */
    function register() external {
        require(isActive, "Hackathon is not active");
        require(block.timestamp < startTime, "Registration closed - hackathon has started");
        require(!isRegistered[msg.sender], "Already registered");

        isRegistered[msg.sender] = true;
        participantCount++;

        emit ParticipantRegistered(msg.sender);
    }

    /**
     * @dev Registers a participant for this hackathon (called by factory)
     * @param _participant Address of the participant to register
     */
    function registerParticipant(address _participant) external {
        require(isActive, "Hackathon is not active");
        require(block.timestamp < startTime, "Registration closed - hackathon has started");
        require(!isRegistered[_participant], "Already registered");
        require(_participant != address(0), "Invalid participant address");

        isRegistered[_participant] = true;
        participantCount++;

        emit ParticipantRegistered(_participant);
    }

    /**
     * @dev Submits a project for this hackathon
     * @param _projectName Name of the project
     * @param _projectUrl URL of the project repository or demo
     */
    function submitProject(
        string memory _projectName,
        string memory _projectUrl
    ) external hackathonActive onlyRegistered {
        require(!hasSubmitted[msg.sender], "Already submitted");

        submissions[msg.sender] = Submission({
            participant: msg.sender,
            projectName: _projectName,
            projectUrl: _projectUrl,
            submissionTime: block.timestamp,
            score: 0,
            isEvaluated: false
        });

        hasSubmitted[msg.sender] = true;

        emit SubmissionMade(msg.sender, _projectName);
    }

    /**
     * @dev Submits a project for this hackathon (with specified participant)
     * @param _participant Address of the participant
     * @param _projectName Name of the project
     * @param _projectUrl URL of the project repository or demo
     */
    function submitProjectForParticipant(
        address _participant,
        string memory _projectName,
        string memory _projectUrl
    ) external hackathonActive {
        require(_participant != address(0), "Invalid participant address");
        require(isRegistered[_participant], "Not registered for this hackathon");
        require(!hasSubmitted[_participant], "Already submitted");

        submissions[_participant] = Submission({
            participant: _participant,
            projectName: _projectName,
            projectUrl: _projectUrl,
            submissionTime: block.timestamp,
            score: 0,
            isEvaluated: false
        });

        hasSubmitted[_participant] = true;

        emit SubmissionMade(_participant, _projectName);
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
        require(msg.sender == organizer || sponsors[msg.sender].isActive, "Only organizer or sponsors can distribute prizes");
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
     * @dev Emergency function to withdraw funds (only organizer)
     */
    function emergencyWithdraw()
        external
        onlyOrganizer
    {
        require(
            isActive,
            "Hackathon is not active"
        );

        uint256 amount = prizePool;
        prizePool = 0;
        isActive = false;

        payable(organizer).transfer(amount);
    }

    /**
     * @dev Ends the hackathon (only organizer)
     */
    function endHackathon()
        external
        onlyOrganizer
    {
        require(isActive, "Hackathon is not active");
        require(block.timestamp > endTime, "Hackathon has not ended yet");

        isActive = false;
        emit HackathonEnded();
    }

    /**
     * @dev Gets hackathon details
     */
    function getHackathonDetails()
        external
        view
        returns (
            string memory _name,
            string memory _description,
            uint256 _startTime,
            uint256 _endTime,
            uint256 _prizePool,
            address _organizer,
            bool _isActive,
            uint256 _participantCount
        )
    {
        return (
            name,
            description,
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

    /**
     * @dev Allows anyone to become a sponsor by contributing the minimum amount
     */
    function becomeSponsor()
        external
        payable
    {
        require(msg.value >= minimumSponsorContribution, "Contribution below minimum required");
        require(!sponsors[msg.sender].isActive, "Already a sponsor");

        sponsors[msg.sender] = Sponsor({
            sponsorAddress: msg.sender,
            contribution: msg.value,
            isActive: true
        });

        sponsorList.push(msg.sender);
        totalSponsorContributions += msg.value;
        prizePool += msg.value;
        
        // Add configured percentage of sponsor contribution to judge reward pool
        uint256 judgeReward = (msg.value * judgeRewardPercentage) / 10000; // Divide by 10000 for 2 decimal precision
        judgeRewardPool += judgeReward;

        emit SponsorAdded(msg.sender, msg.value);
    }

    /**
     * @dev Adds a judge to the hackathon (only organizer or factory during deployment)
     * @param _judge Address of the judge
     */
    function addJudge(address _judge) external {
        require(_judge != address(0), "Invalid judge address");
        require(!isJudge[_judge], "Judge already added");
        require(msg.sender == organizer || factoryCanAddJudges, "Only organizer can add judges after deployment");

        isJudge[_judge] = true;
        judgeList.push(_judge);

        emit JudgeAdded(_judge);
    }
    
    /**
     * @dev Disables factory access to add judges (called after deployment)
     */
    function disableFactoryJudgeAccess() external {
        require(msg.sender == organizer || factoryCanAddJudges, "Only organizer or factory can call this function");
        factoryCanAddJudges = false;
    }

    /**
     * @dev Allows a judge to score a submission
     * @param _participant Address of the participant
     * @param _score Score to assign (0-100)
     */
    function scoreSubmission(address _participant, uint256 _score) external onlyJudge {
        require(hasSubmitted[_participant], "No submission found");
        require(_score <= 100, "Score must be between 0 and 100");
        require(!submissions[_participant].isEvaluated, "Submission already evaluated");

        submissions[_participant].score = _score;
        submissions[_participant].isEvaluated = true;

        emit SubmissionScored(_participant, _score);
    }

    /**
     * @dev Gets all sponsors
     */
    function getSponsors() external view returns (address[] memory) {
        return sponsorList;
    }

    /**
     * @dev Gets all judges
     */
    function getJudges() external view returns (address[] memory) {
        return judgeList;
    }

    /**
     * @dev Gets sponsor contribution amount
     * @param _sponsor Address of the sponsor
     */
    function getSponsorContribution(address _sponsor) external view returns (uint256) {
        return sponsors[_sponsor].contribution;
    }

    /**
     * @dev Gets total prize pool including sponsor contributions
     */
    function getTotalPrizePool() external view returns (uint256) {
        return prizePool;
    }

    /**
     * @dev Gets minimum sponsor contribution required
     */
    function getMinimumSponsorContribution() external view returns (uint256) {
        return minimumSponsorContribution;
    }
    
    /**
     * @dev Allows judges to claim their reward after hackathon ends
     */
    function claimJudgeReward() external onlyJudge {
        require(!isActive || block.timestamp > endTime, "Hackathon must be ended");
        require(!hasReceivedJudgeReward[msg.sender], "Already claimed judge reward");
        require(judgeRewardPool > 0, "No judge rewards available");
        
        uint256 rewardPerJudge = judgeRewardPool / judgeList.length;
        require(rewardPerJudge > 0, "Insufficient reward per judge");
        
        hasReceivedJudgeReward[msg.sender] = true;
        payable(msg.sender).transfer(rewardPerJudge);
        
        emit JudgeRewardDistributed(msg.sender, rewardPerJudge);
    }
    
    /**
     * @dev Gets judge reward pool amount
     */
    function getJudgeRewardPool() external view returns (uint256) {
        return judgeRewardPool;
    }
    
    /**
     * @dev Gets reward per judge
     */
    function getRewardPerJudge() external view returns (uint256) {
        if (judgeList.length == 0) return 0;
        return judgeRewardPool / judgeList.length;
    }
    
    /**
     * @dev Gets judge reward percentage (in basis points, 0-500 for 0.00%-5.00%)
     */
    function getJudgeRewardPercentage() external view returns (uint256) {
        return judgeRewardPercentage;
    }
}
