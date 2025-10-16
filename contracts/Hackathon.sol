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

    event ParticipantRegistered(address indexed participant);
    event SubmissionMade(address indexed participant, string projectName);
    event PrizeDistributed(address indexed winner, uint256 amount);
    event HackathonEnded();
    event SponsorAdded(address indexed sponsor, uint256 contribution);
    event JudgeAdded(address indexed judge);
    event SubmissionScored(address indexed participant, uint256 score);

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

    /**
     * @dev Constructor to initialize hackathon details
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @param _organizer Address of the organizer
     */
    constructor(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        address _organizer
    ) payable {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(msg.value > 0, "Prize pool must be greater than 0");
        require(_organizer != address(0), "Invalid organizer address");

        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        prizePool = msg.value;
        organizer = _organizer;
        isActive = true;
        participantCount = 0;
        totalSponsorContributions = 0;
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
    function isParticipantRegistered(address _participant) external view returns (bool) {
        return isRegistered[_participant];
    }

    /**
     * @dev Gets submission details for a participant
     * @param _participant Address of the participant
     */
    function getSubmission(address _participant) external view returns (
        address participant,
        string memory projectName,
        string memory projectUrl,
        uint256 submissionTime,
        uint256 score,
        bool isEvaluated
    ) {
        Submission storage submission = submissions[_participant];
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
        payable(_winner).transfer(_amount);

        emit PrizeDistributed(_winner, _amount);
    }

    /**
     * @dev Emergency function to withdraw funds (only organizer)
     */
    function emergencyWithdraw() external onlyOrganizer {
        require(isActive, "Hackathon is not active");

        uint256 amount = prizePool;
        prizePool = 0;
        isActive = false;

        payable(organizer).transfer(amount);
    }

    /**
     * @dev Ends the hackathon (only organizer)
     */
    function endHackathon() external onlyOrganizer {
        require(isActive, "Hackathon is not active");
        require(block.timestamp > endTime, "Hackathon has not ended yet");

        isActive = false;
        emit HackathonEnded();
    }

    /**
     * @dev Gets hackathon details
     */
    function getHackathonDetails() external view returns (
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _prizePool,
        address _organizer,
        bool _isActive,
        uint256 _participantCount
    ) {
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
     * @dev Adds a sponsor to the hackathon (only organizer)
     * @param _sponsor Address of the sponsor
     */
    function addSponsor(address _sponsor) external onlyOrganizer {
        require(_sponsor != address(0), "Invalid sponsor address");
        require(!sponsors[_sponsor].isActive, "Sponsor already added");

        sponsors[_sponsor] = Sponsor({
            sponsorAddress: _sponsor,
            contribution: 0,
            isActive: true
        });

        sponsorList.push(_sponsor);
        emit SponsorAdded(_sponsor, 0);
    }

    /**
     * @dev Allows a sponsor to contribute funds to the hackathon
     */
    function sponsorContribute() external payable {
        require(sponsors[msg.sender].isActive, "Not an active sponsor");
        require(msg.value > 0, "Contribution must be greater than 0");

        sponsors[msg.sender].contribution += msg.value;
        totalSponsorContributions += msg.value;
        prizePool += msg.value;

        emit SponsorAdded(msg.sender, msg.value);
    }

    /**
     * @dev Adds a judge to the hackathon (only organizer)
     * @param _judge Address of the judge
     */
    function addJudge(address _judge) external onlyOrganizer {
        require(_judge != address(0), "Invalid judge address");
        require(!isJudge[_judge], "Judge already added");

        isJudge[_judge] = true;
        judgeList.push(_judge);

        emit JudgeAdded(_judge);
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
}
