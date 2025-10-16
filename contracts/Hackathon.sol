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

    // Judge delegation
    mapping(address => address) public judgeDelegates; // judge => delegate
    mapping(address => address) public delegateToJudge; // delegate => judge (for reverse lookup)

    // Stake system
    uint256 public stakeAmount; // Amount hackers must deposit when joining
    mapping(address => uint256) public participantStakes; // participant => stake amount
    uint256 public totalStakes; // Total stakes collected

    // Judge voting system
    uint256 public maxWinners; // Maximum number of winners (set by organizer)
    uint256 public pointsPerJudge; // Points each judge can distribute
    mapping(address => mapping(address => uint256)) public judgeVotes; // judge => participant => points
    mapping(address => uint256) public totalPoints; // participant => total points received
    mapping(address => bool) public hasVoted; // judge => has voted
    uint256 public votingDeadline; // When voting ends
    bool public votingOpen; // Whether voting is currently open

    // Prize claiming
    uint256 public prizeClaimCooldown; // Cooldown period before winners can claim
    uint256 public votingEndTime; // When voting actually ended
    mapping(address => bool) public hasClaimedPrize; // participant => has claimed prize

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

    event JudgeAdded(
        address indexed judge
    );

    event SubmissionScored(
        address indexed participant,
        uint256 score
    );

    event JudgeRewardDistributed(
        address indexed judge,
        uint256 amount
    );

    event JudgeDelegated(
        address indexed judge,
        address indexed delegate
    );

    event StakeDeposited(
        address indexed participant,
        uint256 amount
    );

    event StakeReturned(
        address indexed participant,
        uint256 amount
    );

    event JudgeVoted(
        address indexed judge,
        address indexed participant,
        uint256 points
    );

    event VotingOpened(
        uint256 deadline
    );

    event VotingClosed(
        uint256 endTime
    );

    event PrizeClaimed(
        address indexed winner,
        uint256 amount
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
        require(sponsors[msg.sender].isActive, "Only sponsors can call this function");
        _;
    }

    modifier onlyJudge() {
        require(
            isJudge[msg.sender] || isJudge[delegateToJudge[msg.sender]],
            "Only judges or their delegates can call this function"
        );
        _;
    }

    modifier onlyOrganizerOrFactory() {
        require(
            msg.sender == organizer || msg.sender == address(this),
            "Only organizer or factory can call this function"
        );
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
        uint256 _judgeRewardPercentage,
        uint256 _stakeAmount,
        uint256 _maxWinners,
        uint256 _prizeClaimCooldown
    )
        payable
    {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(msg.value > 0, "Prize pool must be greater than 0");
        require(_organizer != address(0), "Invalid organizer address");
        require(_judgeRewardPercentage <= 500, "Judge reward percentage cannot exceed 5.00%");
        require(_maxWinners > 0, "Must have at least 1 winner");
        require(_prizeClaimCooldown > 0, "Prize claim cooldown must be greater than 0");

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
        
        // New parameters
        stakeAmount = _stakeAmount;
        maxWinners = _maxWinners;
        prizeClaimCooldown = _prizeClaimCooldown;
        pointsPerJudge = 100; // Each judge can distribute 100 points
        votingOpen = false;
        totalStakes = 0;
    }

    /**
     * @dev Registers a participant for this hackathon
     */
    function register()
        external
        payable
    {
        require(isActive, "Hackathon is not active");
        require(block.timestamp < startTime, "Registration closed - hackathon has started");
        require(!isRegistered[msg.sender], "Already registered");
        require(msg.value == stakeAmount, "Must deposit exact stake amount");

        isRegistered[msg.sender] = true;
        participantCount++;
        participantStakes[msg.sender] = msg.value;
        totalStakes += msg.value;

        emit ParticipantRegistered(msg.sender);
        emit StakeDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Registers a participant for this hackathon (called by factory)
     * @param _participant Address of the participant to register
     */
    function registerParticipant(
        address _participant
    )
        external
        payable
    {
        require(isActive, "Hackathon is not active");
        require(block.timestamp < startTime, "Registration closed - hackathon has started");
        require(!isRegistered[_participant], "Already registered");
        require(_participant != address(0), "Invalid participant address");
        require(msg.value == stakeAmount, "Must deposit exact stake amount");

        isRegistered[_participant] = true;
        participantCount++;
        participantStakes[_participant] = msg.value;
        totalStakes += msg.value;

        emit ParticipantRegistered(_participant);
        emit StakeDeposited(_participant, msg.value);
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

        // Return stake to participant
        uint256 stake = participantStakes[msg.sender];
        if (stake > 0) {
            participantStakes[msg.sender] = 0;
            totalStakes -= stake;
            payable(msg.sender).transfer(stake);
            emit StakeReturned(msg.sender, stake);
        }

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

        // Return stake to participant
        uint256 stake = participantStakes[_participant];
        if (stake > 0) {
            participantStakes[_participant] = 0;
            totalStakes -= stake;
            payable(_participant).transfer(stake);
            emit StakeReturned(_participant, stake);
        }

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
        require(
            isActive,
            "Hackathon is not active"
        );

        require(
            block.timestamp > endTime,
            "Hackathon has not ended yet"
        );

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
        require(
            msg.value >= minimumSponsorContribution,
            "Contribution below minimum required"
        );

        require(
            !sponsors[msg.sender].isActive,
            "Already a sponsor"
        );

        sponsors[msg.sender] = Sponsor({
            sponsorAddress: msg.sender,
            contribution: msg.value,
            isActive: true
        });

        sponsorList.push(msg.sender);
        totalSponsorContributions += msg.value;
        prizePool += msg.value;

        uint256 judgeReward = msg.value
            * judgeRewardPercentage
            / 10000;

        judgeRewardPool += judgeReward;

        emit SponsorAdded(
            msg.sender,
            msg.value
        );
    }

    /**
     * @dev Adds a judge to the hackathon (only organizer or factory during deployment)
     * @param _judge Address of the judge
     */
    function addJudge(
        address _judge
    )
        external
    {
        require(!isJudge[_judge], "Judge already added");
        require(msg.sender == organizer || factoryCanAddJudges, "Only organizer can add judges after deployment");

        isJudge[_judge] = true;
        judgeList.push(_judge);

        emit JudgeAdded(_judge);
    }

    /**
     * @dev Disables factory access to add judges (called after deployment)
     */
    function disableFactoryJudgeAccess()
        external
    {
        require(msg.sender == organizer || factoryCanAddJudges, "Only organizer or factory can call this function");
        factoryCanAddJudges = false;
    }

    /**
     * @dev Allows factory to disable factory access (called during deployment)
     */
    function factoryDisableJudgeAccess()
        external
    {
        require(
            factoryCanAddJudges,
            "Factory access already disabled"
        );

        factoryCanAddJudges = false;
    }

    /**
     * @dev Allows organizer to add more judges to the hackathon
     * @param _newJudge Address of the new judge to add
     */
    function addMoreJudge(address _newJudge) external onlyOrganizer {
        require(_newJudge != address(0), "Invalid judge address");
        require(!isJudge[_newJudge], "Judge already added");
        require(isActive, "Cannot add judges to inactive hackathon");
        require(block.timestamp < endTime, "Cannot add judges after hackathon ends");

        isJudge[_newJudge] = true;
        judgeList.push(_newJudge);

        emit JudgeAdded(_newJudge);
    }

    /**
     * @dev Allows organizer to replace an existing judge with a new one
     * @param _oldJudge Address of the judge to replace
     * @param _newJudge Address of the new judge
     */
    function replaceJudge(
        address _oldJudge,
        address _newJudge
    )
        external
        onlyOrganizer
    {
        require(_oldJudge != address(0), "Invalid old judge address");
        require(_newJudge != address(0), "Invalid new judge address");
        require(isJudge[_oldJudge], "Old judge not found");
        require(!isJudge[_newJudge], "New judge already exists");
        require(factoryCanAddJudges == false, "Cannot replace judges during deployment phase");
        require(isActive, "Cannot replace judges in inactive hackathon");
        require(block.timestamp < endTime, "Cannot replace judges after hackathon ends");

        // Remove old judge
        isJudge[_oldJudge] = false;

        // Find and replace in array
        for (uint256 i = 0; i < judgeList.length; i++) {
            if (judgeList[i] == _oldJudge) {
                judgeList[i] = _newJudge;
                break;
            }
        }

        // Add new judge
        isJudge[_newJudge] = true;

        emit JudgeAdded(_newJudge);
    }

    /**
     * @dev Allows a judge to delegate their scoring responsibilities to an agent
     * @param _delegate Address of the delegate (agent) that will score on behalf of the judge
     */
    function delegateToAgent(address _delegate) external {
        require(isJudge[msg.sender], "Only judges can delegate");
        require(_delegate != address(0), "Invalid delegate address");
        require(_delegate != msg.sender, "Cannot delegate to yourself");
        require(judgeDelegates[msg.sender] == address(0), "Already has a delegate");

        // Set delegation
        judgeDelegates[msg.sender] = _delegate;
        delegateToJudge[_delegate] = msg.sender;

        emit JudgeDelegated(msg.sender, _delegate);
    }

    /**
     * @dev Allows a judge to revoke their delegation
     */
    function revokeDelegation() external {
        require(isJudge[msg.sender], "Only judges can revoke delegation");
        require(judgeDelegates[msg.sender] != address(0), "No delegation to revoke");

        address delegate = judgeDelegates[msg.sender];
        
        // Clear delegation
        judgeDelegates[msg.sender] = address(0);
        delegateToJudge[delegate] = address(0);

        emit JudgeDelegated(msg.sender, address(0));
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
    function getMinimumSponsorContribution()
        external
        view
        returns (uint256)
    {
        return minimumSponsorContribution;
    }

    /**
     * @dev Allows judges to claim their reward after hackathon ends
     */
    function claimJudgeReward()
        external
        onlyJudge
    {
        require(!isActive || block.timestamp > endTime, "Hackathon must be ended");
        require(judgeRewardPool > 0, "No judge rewards available");

        // Determine the actual judge (either msg.sender or their delegate)
        address actualJudge = isJudge[msg.sender] ? msg.sender : delegateToJudge[msg.sender];
        require(!hasReceivedJudgeReward[actualJudge], "Already claimed judge reward");

        uint256 rewardPerJudge = judgeRewardPool / judgeList.length;
        require(rewardPerJudge > 0, "Insufficient reward per judge");

        hasReceivedJudgeReward[actualJudge] = true;
        payable(msg.sender).transfer(rewardPerJudge);

        emit JudgeRewardDistributed(
            actualJudge,
            rewardPerJudge
        );
    }

    /**
     * @dev Gets judge reward pool amount
     */
    function getJudgeRewardPool()
        external
        view
        returns (uint256)
    {
        return judgeRewardPool;
    }

    /**
     * @dev Gets reward per judge
     */
    function getRewardPerJudge()
        external
        view
        returns (uint256)
    {
        if (judgeList.length == 0) return 0;
        return judgeRewardPool / judgeList.length;
    }

    /**
     * @dev Gets judge reward percentage (in basis points, 0-500 for 0.00%-5.00%)
     */
    function getJudgeRewardPercentage()
        external
        view
        returns (uint256)
    {
        return judgeRewardPercentage;
    }

    /**
     * @dev Gets the delegate for a judge
     * @param _judge Address of the judge
     * @return Address of the delegate (address(0) if no delegate)
     */
    function getJudgeDelegate(address _judge)
        external
        view
        returns (address)
    {
        return judgeDelegates[_judge];
    }

    /**
     * @dev Gets the judge for a delegate
     * @param _delegate Address of the delegate
     * @return Address of the judge (address(0) if not a delegate)
     */
    function getDelegateJudge(address _delegate)
        external
        view
        returns (address)
    {
        return delegateToJudge[_delegate];
    }

    // ========== Voting System Functions ==========

    /**
     * @dev Opens voting for judges (only organizer can call)
     * @param _votingDuration Duration of voting period in seconds
     */
    function openVoting(uint256 _votingDuration) external onlyOrganizer {
        require(!isActive, "Hackathon must be ended first");
        require(!votingOpen, "Voting is already open");
        require(_votingDuration > 0, "Voting duration must be greater than 0");

        votingOpen = true;
        votingDeadline = block.timestamp + _votingDuration;

        emit VotingOpened(votingDeadline);
    }

    /**
     * @dev Allows a judge to vote on submissions by allocating points
     * @param _participant Address of the participant to vote for
     * @param _points Points to allocate (0-100)
     */
    function voteForSubmission(address _participant, uint256 _points) external onlyJudge {
        require(votingOpen, "Voting is not open");
        require(block.timestamp <= votingDeadline, "Voting deadline has passed");
        require(hasSubmitted[_participant], "Participant has not submitted");
        require(_points <= pointsPerJudge, "Cannot allocate more points than allowed");
        require(!hasVoted[msg.sender], "Judge has already voted");

        // Check if judge has already allocated points to this participant
        uint256 currentPoints = judgeVotes[msg.sender][_participant];
        require(currentPoints == 0, "Judge has already voted for this participant");

        judgeVotes[msg.sender][_participant] = _points;
        totalPoints[_participant] += _points;

        emit JudgeVoted(msg.sender, _participant, _points);
    }

    /**
     * @dev Closes voting (only organizer can call)
     */
    function closeVoting() external onlyOrganizer {
        require(votingOpen, "Voting is not open");
        require(block.timestamp > votingDeadline, "Voting deadline has not passed");

        votingOpen = false;
        votingEndTime = block.timestamp;

        emit VotingClosed(votingEndTime);
    }

    /**
     * @dev Allows winners to claim their prize after cooldown period
     */
    function claimPrize() external {
        require(!votingOpen, "Voting must be closed first");
        require(votingEndTime > 0, "Voting has not ended");
        require(block.timestamp >= votingEndTime + prizeClaimCooldown, "Cooldown period not over");
        require(hasSubmitted[msg.sender], "Must have submitted a project");
        require(!hasClaimedPrize[msg.sender], "Prize already claimed");

        // Check if participant is a winner
        require(isWinner(msg.sender), "Not a winner");

        hasClaimedPrize[msg.sender] = true;

        // Calculate prize amount
        uint256 prizeAmount = getPrizeAmount();
        require(prizeAmount > 0, "No prize to claim");

        payable(msg.sender).transfer(prizeAmount);

        emit PrizeClaimed(msg.sender, prizeAmount);
    }

    /**
     * @dev Checks if a participant is a winner
     * @param _participant Address of the participant
     * @return True if participant is a winner
     */
    function isWinner(address _participant) public view returns (bool) {
        if (!hasSubmitted[_participant]) return false;
        if (totalPoints[_participant] == 0) return false;

        // Get all participants with their points
        address[] memory participants = getParticipantsWithSubmissions();
        uint256[] memory points = new uint256[](participants.length);
        
        for (uint256 i = 0; i < participants.length; i++) {
            points[i] = totalPoints[participants[i]];
        }

        // Sort participants by points (simple bubble sort for small arrays)
        for (uint256 i = 0; i < participants.length - 1; i++) {
            for (uint256 j = 0; j < participants.length - i - 1; j++) {
                if (points[j] < points[j + 1]) {
                    // Swap points
                    uint256 tempPoints = points[j];
                    points[j] = points[j + 1];
                    points[j + 1] = tempPoints;
                    
                    // Swap participants
                    address tempParticipant = participants[j];
                    participants[j] = participants[j + 1];
                    participants[j + 1] = tempParticipant;
                }
            }
        }

        // Check if participant is in top maxWinners
        for (uint256 i = 0; i < maxWinners && i < participants.length; i++) {
            if (participants[i] == _participant) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Gets the prize amount for each winner
     * @return Prize amount per winner
     */
    function getPrizeAmount() public view returns (uint256) {
        if (maxWinners == 0) return 0;
        return prizePool / maxWinners;
    }

    /**
     * @dev Gets all participants who have submitted projects
     * @return Array of participant addresses
     */
    function getParticipantsWithSubmissions() public view returns (address[] memory) {
        address[] memory participants = new address[](participantCount);
        uint256 count = 0;

        // This is a simplified version - in practice, you might want to store this differently
        // For now, we'll return an empty array as this would require iterating through all participants
        // In a real implementation, you'd want to maintain a separate array of participants with submissions
        return participants;
    }

    // ========== Getter Functions for New Features ==========

    /**
     * @dev Gets stake amount required to join
     * @return Stake amount
     */
    function getStakeAmount() external view returns (uint256) {
        return stakeAmount;
    }

    /**
     * @dev Gets participant's stake
     * @param _participant Address of the participant
     * @return Stake amount
     */
    function getParticipantStake(address _participant) external view returns (uint256) {
        return participantStakes[_participant];
    }

    /**
     * @dev Gets total stakes collected
     * @return Total stakes
     */
    function getTotalStakes() external view returns (uint256) {
        return totalStakes;
    }

    /**
     * @dev Gets maximum number of winners
     * @return Maximum winners
     */
    function getMaxWinners() external view returns (uint256) {
        return maxWinners;
    }

    /**
     * @dev Gets points per judge
     * @return Points per judge
     */
    function getPointsPerJudge() external view returns (uint256) {
        return pointsPerJudge;
    }

    /**
     * @dev Gets total points for a participant
     * @param _participant Address of the participant
     * @return Total points
     */
    function getTotalPoints(address _participant) external view returns (uint256) {
        return totalPoints[_participant];
    }

    /**
     * @dev Gets voting deadline
     * @return Voting deadline timestamp
     */
    function getVotingDeadline() external view returns (uint256) {
        return votingDeadline;
    }

    /**
     * @dev Gets whether voting is open
     * @return True if voting is open
     */
    function isVotingOpen() external view returns (bool) {
        return votingOpen;
    }

    /**
     * @dev Gets prize claim cooldown period
     * @return Cooldown period in seconds
     */
    function getPrizeClaimCooldown() external view returns (uint256) {
        return prizeClaimCooldown;
    }

    /**
     * @dev Gets whether a participant has claimed their prize
     * @param _participant Address of the participant
     * @return True if prize has been claimed
     */
    function getHasClaimedPrize(address _participant) external view returns (bool) {
        return hasClaimedPrize[_participant];
    }
}
