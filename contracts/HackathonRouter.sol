// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./HackathonFactory.sol";
import "./Hackathon.sol";

/**
 * @title HackathonRouter
 * @dev Router contract for easier interaction with hackathons
 * Provides a centralized interface for common operations
 */
contract HackathonRouter {

    HackathonFactory public immutable factory;

    // Global judge governance
    mapping(address => bool) public isGlobalJudge;
    address[] public globalJudges;
    uint256 public totalGlobalJudges;

    // Judge voting system
    struct JudgeVote {
        address voter;
        address candidate;
        bool isAdd; // true for adding, false for removing
        bool hasVoted;
    }

    mapping(bytes32 => mapping(address => bool)) public hasVotedOnProposal;
    mapping(bytes32 => uint256) public votesForProposal;
    mapping(bytes32 => JudgeVote) public judgeProposals;

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

    event GlobalJudgeAdded(address indexed judge);
    event GlobalJudgeRemoved(address indexed judge);
    event JudgeProposalCreated(bytes32 indexed proposalId, address indexed candidate, bool isAdd);
    event JudgeProposalVoted(bytes32 indexed proposalId, address indexed voter);
    event JudgeProposalExecuted(bytes32 indexed proposalId, address indexed candidate, bool isAdd);

    constructor(
        address _factory,
        address[] memory _initialJudges
    ) {
        require(
            _factory != address(0),
            "Invalid factory address"
        );

        factory = HackathonFactory(
            _factory
        );

        // Initialize with default judges
        for (uint256 i = 0; i < _initialJudges.length; i++) {
            require(_initialJudges[i] != address(0), "Invalid judge address");
            isGlobalJudge[_initialJudges[i]] = true;
            globalJudges.push(_initialJudges[i]);
            emit GlobalJudgeAdded(_initialJudges[i]);
        }
        totalGlobalJudges = _initialJudges.length;
    }

    /**
     * @dev Modifier to ensure only global judges can call certain functions
     */
    modifier onlyGlobalJudge() {
        require(isGlobalJudge[msg.sender], "Only global judges can call this function");
        _;
    }

    /**
     * @dev Calculate required majority for judge proposals
     * @return Required number of votes (majority of current judges)
     */
    function getRequiredMajority() public view returns (uint256) {
        if (totalGlobalJudges <= 1) return 1;
        return (totalGlobalJudges / 2) + 1; // Simple majority
    }

    /**
     * @dev Propose to add or remove a judge
     * @param _candidate Address of the judge to add/remove
     * @param _isAdd True to add, false to remove
     */
    function proposeJudgeChange(address _candidate, bool _isAdd) external onlyGlobalJudge {
        require(_candidate != address(0), "Invalid candidate address");

        if (_isAdd) {
            require(!isGlobalJudge[_candidate], "Judge already exists");
        } else {
            require(isGlobalJudge[_candidate], "Judge does not exist");
            require(totalGlobalJudges > 1, "Cannot remove last judge");
        }

        bytes32 proposalId = keccak256(abi.encodePacked(_candidate, _isAdd, block.timestamp));

        judgeProposals[proposalId] = JudgeVote({
            voter: msg.sender,
            candidate: _candidate,
            isAdd: _isAdd,
            hasVoted: false
        });

        emit JudgeProposalCreated(proposalId, _candidate, _isAdd);
    }

    /**
     * @dev Vote on a judge proposal
     * @param _proposalId The proposal ID to vote on
     */
    function voteOnJudgeProposal(bytes32 _proposalId) external onlyGlobalJudge {
        require(judgeProposals[_proposalId].voter != address(0), "Proposal does not exist");
        require(!hasVotedOnProposal[_proposalId][msg.sender], "Already voted on this proposal");

        hasVotedOnProposal[_proposalId][msg.sender] = true;
        votesForProposal[_proposalId]++;

        emit JudgeProposalVoted(_proposalId, msg.sender);

        // Check if majority reached
        if (votesForProposal[_proposalId] >= getRequiredMajority()) {
            _executeJudgeProposal(_proposalId);
        }
    }

    /**
     * @dev Execute a judge proposal when majority is reached
     * @param _proposalId The proposal ID to execute
     */
    function _executeJudgeProposal(
        bytes32 _proposalId
    )
        internal
    {
        JudgeVote memory proposal = judgeProposals[
            _proposalId
        ];

        if (proposal.isAdd) {
            isGlobalJudge[proposal.candidate] = true;
            globalJudges.push(proposal.candidate);
            totalGlobalJudges++;
            emit GlobalJudgeAdded(proposal.candidate);
        } else {
            isGlobalJudge[proposal.candidate] = false;
            // Remove from array (find and swap with last element)
            for (uint256 i = 0; i < globalJudges.length; i++) {
                if (globalJudges[i] == proposal.candidate) {
                    globalJudges[i] = globalJudges[globalJudges.length - 1];
                    globalJudges.pop();
                    break;
                }
            }
            totalGlobalJudges--;

            emit GlobalJudgeRemoved(
                proposal.candidate
            );
        }

        emit JudgeProposalExecuted(
            _proposalId,
            proposal.candidate,
            proposal.isAdd
        );
    }

    /**
     * @dev Get all global judges
     */
    function getGlobalJudges()
        external
        view
        returns (address[] memory)
    {
        return globalJudges;
    }

    /**
     * @dev Check if an address is a global judge
     * @param _judge Address to check
     */
    function isAddressGlobalJudge(
        address _judge
    )
        external
        view
        returns (bool)
    {
        return isGlobalJudge[_judge];
    }

    /**
     * @dev Creates a new hackathon through the factory
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @param _minimumSponsorContribution Minimum contribution required to become a sponsor
     * @param _selectedJudges Array of global judge addresses to assign to this hackathon
     * @param _judgeRewardPercentage Judge reward percentage (0-500, representing 0.00% to 5.00%)
     * @return hackathonAddress Address of the newly created hackathon
     */
    function createHackathon(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minimumSponsorContribution,
        address[] memory _selectedJudges,
        uint256 _judgeRewardPercentage,
        uint256 _stakeAmount,
        uint256 _maxWinners,
        uint256 _prizeClaimCooldown
    )
        external
        payable
        returns (address hackathonAddress)
    {
        // Validate that all selected judges are in the global whitelist
        for (uint256 i = 0; i < _selectedJudges.length; i++) {
            require(isGlobalJudge[_selectedJudges[i]], "Selected judge not in global whitelist");
        }
        hackathonAddress = factory.createHackathonWithOrganizer{value: msg.value}(
            _name,
            _description,
            _startTime,
            _endTime,
            msg.sender,
            _minimumSponsorContribution,
            _selectedJudges,
            _judgeRewardPercentage,
            _stakeAmount,
            _maxWinners,
            _prizeClaimCooldown
        );

        emit HackathonCreated(
            hackathonAddress,
            _name,
            msg.sender,
            msg.value
        );

        return hackathonAddress;
    }

    /**
     * @dev Registers a participant for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function registerForHackathon(
        address _hackathonAddress
    )
        external
        payable
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        // Get stake amount from hackathon
        Hackathon hackathon = Hackathon(_hackathonAddress);
        uint256 stakeAmount = hackathon.getStakeAmount();
        require(msg.value == stakeAmount, "Must send exact stake amount");

        // Register with hackathon directly
        hackathon.registerParticipant{value: msg.value}(msg.sender);

        // Also register with factory to track participant's hackathons
        factory.registerParticipantForHackathon(_hackathonAddress, msg.sender);

        emit ParticipantRegistered(
            _hackathonAddress,
            msg.sender
        );
    }

    /**
     * @dev Submits a project for a hackathon (direct interaction with hackathon contract)
     * @param _hackathonAddress Address of the hackathon contract
     * @param _projectName Name of the project
     * @param _projectUrl URL of the project repository or demo
     */
    function submitProject(
        address _hackathonAddress,
        string memory _projectName,
        string memory _projectUrl
    )
        external
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        hackathon.submitProjectForParticipant(
            msg.sender,
            _projectName,
            _projectUrl
        );

        emit ProjectSubmitted(
            _hackathonAddress,
            msg.sender,
            _projectName
        );
    }

    /**
     * @dev Gets hackathon details
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getHackathonDetails(
        address _hackathonAddress
    )
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            uint256 prizePool,
            address organizer,
            bool isActive,
            uint256 participantCount
    ) {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getHackathonDetails();
    }

    /**
     * @dev Checks if an address is registered for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant to check
     */
    function isParticipantRegistered(
        address _hackathonAddress,
        address _participant
    )
        external
        view
        returns (bool)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.isRegistered(_participant);
    }

    /**
     * @dev Gets submission details for a participant
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant
     */
    function getSubmission(
        address _hackathonAddress,
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
    ) {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getSubmission(_participant);
    }

    /**
     * @dev Gets the total number of hackathons created
     */
    function getTotalHackathons()
        external
        view
        returns (uint256)
    {
        return factory.getHackathonCount();
    }

    /**
     * @dev Gets the number of hackathons created by an organizer
     * @param _organizer Address of the organizer
     */
    function getOrganizerHackathonCount(
        address _organizer
    )
        external
        view
        returns (uint256)
    {
        return factory.getOrganizerHackathonCount(
            _organizer
        );
    }

    /**
     * @dev Gets the number of hackathons a participant is registered for
     * @param _participant Address of the participant
     */
    function getParticipantHackathonCount(
        address _participant
    )
        external
        view
        returns (uint256)
    {
        return factory.getParticipantHackathonCount(
            _participant
        );
    }

    /**
     * @dev Gets a specific hackathon created by an organizer
     * @param _organizer Address of the organizer
     * @param _index Index of the hackathon
     */
    function getOrganizerHackathon(
        address _organizer,
        uint256 _index
    )
        external
        view
        returns (address) {
        return factory.getOrganizerHackathon(
            _organizer,
            _index
        );
    }

    /**
     * @dev Gets a specific hackathon a participant is registered for
     * @param _participant Address of the participant
     * @param _index Index of the hackathon
     */
    function getParticipantHackathon(
        address _participant,
        uint256 _index
    )
        external
        view
        returns (address)
    {
        return factory.getParticipantHackathon(
            _participant,
            _index
        );
    }

    /**
     * @dev Allows anyone to become a sponsor by contributing to a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function becomeSponsor(
        address _hackathonAddress
    )
        external
        payable
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.becomeSponsor{value: msg.value}();
    }

    /**
     * @dev Adds a judge to a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @param _judge Address of the judge
     */
    function addJudge(
        address _hackathonAddress,
        address _judge
    )
        external
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.addJudge(_judge);
    }

    /**
     * @dev Allows a judge to score a submission
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant
     * @param _score Score to assign (0-100)
     */
    function scoreSubmission(
        address _hackathonAddress,
        address _participant,
        uint256 _score
    )
        external
    {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.scoreSubmission(_participant, _score);
    }

    /**
     * @dev Gets all sponsors for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getSponsors(
        address _hackathonAddress
    )
        external
        view
        returns (address[] memory)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getSponsors();
    }

    /**
     * @dev Gets all judges for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getJudges(
        address _hackathonAddress
    )
        external
        view
        returns (address[] memory)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getJudges();
    }

    /**
     * @dev Checks if an address is a judge for a specific hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @param _judge Address to check
     */
    function isJudge(
        address _hackathonAddress,
        address _judge
    )
        external
        view
        returns (bool)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.isJudge(_judge);
    }

    /**
     * @dev Gets sponsor contribution for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @param _sponsor Address of the sponsor
     */
    function getSponsorContribution(
        address _hackathonAddress,
        address _sponsor
    )
        external
        view
        returns (uint256)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getSponsorContribution(_sponsor);
    }

    /**
     * @dev Gets total prize pool for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getTotalPrizePool(
        address _hackathonAddress
    )
        external
        view
        returns (uint256)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getTotalPrizePool();
    }

    /**
     * @dev Gets minimum sponsor contribution for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getMinimumSponsorContribution(
        address _hackathonAddress
    )
        external
        view
        returns (uint256)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getMinimumSponsorContribution();
    }

    /**
     * @dev Allows judges to claim their reward
     * @param _hackathonAddress Address of the hackathon contract
     */
    function claimJudgeReward(
        address _hackathonAddress
    )
        external
    {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.claimJudgeReward();
    }

    /**
     * @dev Gets judge reward pool for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getJudgeRewardPool(
        address _hackathonAddress
    )
        external
        view
        returns (uint256)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getJudgeRewardPool();
    }

    /**
     * @dev Gets reward per judge for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getRewardPerJudge(
        address _hackathonAddress
    )
        external
        view
        returns (uint256)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getRewardPerJudge();
    }

    /**
     * @dev Gets judge reward percentage for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getJudgeRewardPercentage(
        address _hackathonAddress
    )
        external
        view
        returns (uint256)
    {
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getJudgeRewardPercentage();
    }

    /**
     * @dev Allows a judge to delegate their scoring responsibilities to an agent
     * @param _hackathonAddress Address of the hackathon contract
     * @param _delegate Address of the delegate (agent)
     */
    function delegateToAgent(
        address _hackathonAddress,
        address _delegate
    )
        external
    {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.delegateToAgent(_delegate);
    }

    /**
     * @dev Allows a judge to revoke their delegation
     * @param _hackathonAddress Address of the hackathon contract
     */
    function revokeDelegation(
        address _hackathonAddress
    )
        external
    {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.revokeDelegation();
    }

    /**
     * @dev Gets the delegate for a judge
     * @param _hackathonAddress Address of the hackathon contract
     * @param _judge Address of the judge
     * @return Address of the delegate (address(0) if no delegate)
     */
    function getJudgeDelegate(
        address _hackathonAddress,
        address _judge
    )
        external
        view
        returns (address)
    {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getJudgeDelegate(_judge);
    }

    /**
     * @dev Gets the judge for a delegate
     * @param _hackathonAddress Address of the hackathon contract
     * @param _delegate Address of the delegate
     * @return Address of the judge (address(0) if not a delegate)
     */
    function getDelegateJudge(
        address _hackathonAddress,
        address _delegate
    )
        external
        view
        returns (address)
    {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getDelegateJudge(_delegate);
    }

    // ========== Stake System Functions ==========

    /**
     * @dev Gets stake amount required to join a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @return Stake amount
     */
    function getStakeAmount(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getStakeAmount();
    }

    /**
     * @dev Gets participant's stake for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant
     * @return Stake amount
     */
    function getParticipantStake(address _hackathonAddress, address _participant) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getParticipantStake(_participant);
    }

    /**
     * @dev Gets total stakes collected for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @return Total stakes
     */
    function getTotalStakes(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getTotalStakes();
    }

    // ========== Voting System Functions ==========

    /**
     * @dev Opens voting for judges in a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @param _votingDuration Duration of voting period in seconds
     */
    function openVoting(address _hackathonAddress, uint256 _votingDuration) external {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.openVoting(_votingDuration);
    }

    /**
     * @dev Allows a judge to vote on submissions
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant to vote for
     * @param _points Points to allocate
     */
    function voteForSubmission(address _hackathonAddress, address _participant, uint256 _points) external {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.voteForSubmission(_participant, _points);
    }

    /**
     * @dev Closes voting for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function closeVoting(address _hackathonAddress) external {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.closeVoting();
    }

    /**
     * @dev Allows winners to claim their prize
     * @param _hackathonAddress Address of the hackathon contract
     */
    function claimPrize(address _hackathonAddress) external {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.claimPrize();
    }

    /**
     * @dev Checks if a participant is a winner
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant
     * @return True if participant is a winner
     */
    function isWinner(address _hackathonAddress, address _participant) external view returns (bool) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.isWinner(_participant);
    }

    /**
     * @dev Gets the prize amount for each winner
     * @param _hackathonAddress Address of the hackathon contract
     * @return Prize amount per winner
     */
    function getPrizeAmount(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getPrizeAmount();
    }

    // ========== Getter Functions for New Features ==========

    /**
     * @dev Gets maximum number of winners for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @return Maximum winners
     */
    function getMaxWinners(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getMaxWinners();
    }

    /**
     * @dev Gets points per judge for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @return Points per judge
     */
    function getPointsPerJudge(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getPointsPerJudge();
    }

    /**
     * @dev Gets total points for a participant
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant
     * @return Total points
     */
    function getTotalPoints(
        address _hackathonAddress,
        address _participant
    )
        external
        view
        returns (uint256)
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.getTotalPoints(
            _participant
        );
    }

    /**
     * @dev Gets voting deadline for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @return Voting deadline timestamp
     */
    function getVotingDeadline(
        address _hackathonAddress
    )
        external
        view
        returns (uint256)
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.getVotingDeadline();
    }

    /**
     * @dev Gets whether voting is open for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @return True if voting is open
     */
    function isVotingOpen(
        address _hackathonAddress
    )
        external
        view
        returns (bool)
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.isVotingOpen();
    }

    /**
     * @dev Gets prize claim cooldown period for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @return Cooldown period in seconds
     */
    function getPrizeClaimCooldown(
        address _hackathonAddress
    )
        external
        view
        returns (uint256)
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.getPrizeClaimCooldown();
    }

    /**
     * @dev Gets whether a participant has claimed their prize
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant
     * @return True if prize has been claimed
     */
    function hasClaimedPrize(
        address _hackathonAddress,
        address _participant
    )
        external
        view
        returns (bool)
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.getHasClaimedPrize(
            _participant
        );
    }
}
