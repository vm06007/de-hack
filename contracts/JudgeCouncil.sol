// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

/**
 * @title JudgeCouncil
 * @dev Standalone service for managing judges and their rewards
 * @notice This contract can be used by hackathons to manage judge-related functionality
 */
contract JudgeCouncil {

    // Global judge registry
    mapping(address => bool) public isGlobalJudge;
    address[] public globalJudges;

    // Judge rewards tracking
    mapping(address => uint256) public judgeRewards;
    mapping(address => bool) public hasClaimedReward;

    // Judge delegation
    mapping(address => address) public judgeDelegates;
    mapping(address => address) public delegateToJudge;

    // Governance voting system
    uint256 public votesRequired = 1; // Minimum votes required for governance actions
    mapping(bytes32 => mapping(address => bool)) public hasVoted; // proposalId => judge => hasVoted
    mapping(bytes32 => uint256) public proposalVotes; // proposalId => vote count
    mapping(bytes32 => bool) public proposalExecuted; // proposalId => executed

    // Events
    event GlobalJudgeAdded(
        address indexed judge
    );

    event GlobalJudgeRemoved(
        address indexed judge
    );

    event JudgeDelegated(
        address indexed judge,
        address indexed delegate
    );

    event JudgeRewardAdded(
        address indexed judge,
        uint256 amount
    );

    event JudgeRewardClaimed(
        address indexed judge,
        uint256 amount
    );

    event ProposalCreated(
        bytes32 indexed proposalId,
        string proposalType,
        address indexed proposer
    );

    event VoteCast(
        bytes32 indexed proposalId,
        address indexed voter,
        bool support
    );

    event ProposalExecuted(
        bytes32 indexed proposalId
    );

    event VotesRequiredChanged(
        uint256 oldVotesRequired,
        uint256 newVotesRequired
    );

    modifier onlyGlobalJudge() {
        require(
            isGlobalJudge[msg.sender],
            "Only global judges can call this function"
        );
        _;
    }

    modifier onlyFactory() {
        require(
            msg.sender == factory,
            "Only factory can call this function"
        );
        _;
    }

    address public immutable factory;

    /**
     * @dev Constructor to set the factory address
     * @param _factory Address of the factory contract
     */
    constructor(
        address _factory
    ) {
        factory = _factory;
    }

    /**
     * @dev Add the first global judge (only factory can call this)
     * @param _judge Address of the first judge to add
     */
    function _addFirstGlobalJudge(
        address _judge
    )
        internal
    {
        require(_judge != address(0), "Invalid judge address");
        require(!isGlobalJudge[_judge], "Judge already exists");
        require(globalJudges.length == 0, "First judge already added");

        isGlobalJudge[_judge] = true;
        globalJudges.push(_judge);

        emit GlobalJudgeAdded(_judge);
    }

    /**
     * @dev Delegate judge responsibilities to another address
     * @param _delegate Address to delegate to
     */
    function delegateToAgent(
        address _delegate
    )
        external
        onlyGlobalJudge
    {
        require(_delegate != address(0), "Invalid delegate address");
        require(_delegate != msg.sender, "Cannot delegate to yourself");
        require(judgeDelegates[msg.sender] == address(0), "Already has a delegate");

        judgeDelegates[msg.sender] = _delegate;
        delegateToJudge[_delegate] = msg.sender;

        emit JudgeDelegated(msg.sender, _delegate);
    }

    /**
     * @dev Revoke delegation
     */
    function revokeDelegation()
        external
        onlyGlobalJudge
    {
        require(
            judgeDelegates[msg.sender] != address(0),
            "No delegation to revoke"
        );

        address delegate = judgeDelegates[msg.sender];
        judgeDelegates[msg.sender] = address(0);
        delegateToJudge[delegate] = address(0);

        emit JudgeDelegated(
            msg.sender,
            address(0)
        );
    }

    /**
     * @dev Add reward for a judge (called by hackathons)
     * @param _judge Address of the judge
     * @param _amount Amount to add
     */
    function addJudgeReward(
        address _judge,
        uint256 _amount
    )
        external
        payable
    {
        require(_judge != address(0), "Invalid judge address");
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value >= _amount, "Insufficient payment");

        judgeRewards[_judge] += _amount;

        emit JudgeRewardAdded(
            _judge,
            _amount
        );
    }

    /**
     * @dev Claim accumulated judge rewards
     */
    function claimJudgeReward()
        external
    {
        address judge = isGlobalJudge[msg.sender]
            ? msg.sender
            : delegateToJudge[msg.sender];

        require(judgeRewards[judge] > 0, "No rewards to claim");
        require(!hasClaimedReward[judge], "Already claimed rewards");

        uint256 amount = judgeRewards[judge];
        hasClaimedReward[judge] = true;

        payable(msg.sender).transfer(
            amount
        );

        emit JudgeRewardClaimed(
            judge,
            amount
        );
    }

    /**
     * @dev Check if an address is a judge or delegate
     * @param _address Address to check
     * @return True if the address is a judge or delegate
     */
    function isJudgeOrDelegate(
        address _address
    )
        public
        view
        returns (bool)
    {
        return isGlobalJudge[_address] || delegateToJudge[_address] != address(0);
    }

    /**
     * @dev Get all global judges
     * @return Array of global judge addresses
     */
    function getGlobalJudges()
        external
        view
        returns (address[] memory)
    {
        return globalJudges;
    }

    /**
     * @dev Get judge rewards for an address
     * @param _judge Address of the judge
     * @return Amount of rewards
     */
    function getJudgeRewards(
        address _judge
    )
        external
        view
        returns (uint256)
    {
        return judgeRewards[_judge];
    }

    /**
     * @dev Get delegate for a judge
     * @param _judge Address of the judge
     * @return Address of the delegate
     */
    function getJudgeDelegate(
        address _judge
    )
        external
        view
        returns (address)
    {
        return judgeDelegates[_judge];
    }

    /**
     * @dev Get judge for a delegate
     * @param _delegate Address of the delegate
     * @return Address of the judge
     */
    function getDelegateJudge(
        address _delegate
    )
        external
        view
        returns (address)
    {
        return delegateToJudge[_delegate];
    }

    // ========== Governance Functions ==========

    /**
     * @dev Create a proposal to add a new judge
     * @param _judge Address of the judge to add
     * @return proposalId Unique identifier for the proposal
     */
    function proposeAddJudge(
        address _judge
    )
        external
        onlyGlobalJudge
        returns (bytes32)
    {
        require(_judge != address(0), "Invalid judge address");
        require(!isGlobalJudge[_judge], "Judge already exists");

        bytes32 proposalId = keccak256(abi.encodePacked("addJudge", _judge, block.timestamp));
        require(!proposalExecuted[proposalId], "Proposal already executed");

        emit ProposalCreated(
            proposalId,
            "addJudge",
            msg.sender
        );

        return proposalId;
    }

    /**
     * @dev Create a proposal to remove a judge
     * @param _judge Address of the judge to remove
     * @return proposalId Unique identifier for the proposal
     */
    function proposeRemoveJudge(
        address _judge
    )
        external
        onlyGlobalJudge
        returns (bytes32)
    {
        require(isGlobalJudge[_judge], "Judge does not exist");
        require(_judge != msg.sender, "Cannot propose to remove yourself");

        bytes32 proposalId = keccak256(abi.encodePacked("removeJudge", _judge, block.timestamp));
        require(!proposalExecuted[proposalId], "Proposal already executed");

        emit ProposalCreated(proposalId, "removeJudge", msg.sender);
        return proposalId;
    }

    /**
     * @dev Create a proposal to change the required votes
     * @param _newVotesRequired New number of votes required
     * @return proposalId Unique identifier for the proposal
     */
    function proposeChangeVotesRequired(
        uint256 _newVotesRequired
    )
        external
        onlyGlobalJudge
        returns (bytes32)
    {
        require(_newVotesRequired > 0, "Votes required must be greater than 0");
        require(_newVotesRequired <= globalJudges.length, "Votes required cannot exceed total judges");

        bytes32 proposalId = keccak256(abi.encodePacked("changeVotesRequired", _newVotesRequired, block.timestamp));
        require(!proposalExecuted[proposalId], "Proposal already executed");

        emit ProposalCreated(
            proposalId,
            "changeVotesRequired",
            msg.sender
        );

        return proposalId;
    }

    /**
     * @dev Vote on a proposal
     * @param _proposalId Unique identifier for the proposal
     * @param _support True to support the proposal, false to oppose
     */
    function vote(
        bytes32 _proposalId,
        bool _support
    )
        external
        onlyGlobalJudge
    {
        require(!hasVoted[_proposalId][msg.sender], "Already voted on this proposal");
        require(!proposalExecuted[_proposalId], "Proposal already executed");

        hasVoted[_proposalId][msg.sender] = true;

        if (_support) {
            proposalVotes[_proposalId]++;
        }

        emit VoteCast(
            _proposalId,
            msg.sender,
            _support
        );
    }

    /**
     * @dev Execute a proposal if it has enough votes
     * @param _proposalId Unique identifier for the proposal
     * @param _judge Address of the judge (for add/remove judge proposals)
     * @param _newVotesRequired New votes required (for change votes required proposals)
     */
    function executeProposal(
        bytes32 _proposalId,
        address _judge,
        uint256 _newVotesRequired
    )
        external
        onlyGlobalJudge
    {
        require(!proposalExecuted[_proposalId], "Proposal already executed");
        require(proposalVotes[_proposalId] >= votesRequired, "Insufficient votes");

        proposalExecuted[_proposalId] = true;

        // Determine proposal type and execute
        if (_judge != address(0)) {
            // Add or remove judge proposal
            if (isGlobalJudge[_judge]) {
                // Remove judge
        isGlobalJudge[_judge] = false;
        for (uint256 i = 0; i < globalJudges.length; i++) {
            if (globalJudges[i] == _judge) {
                globalJudges[i] = globalJudges[globalJudges.length - 1];
                globalJudges.pop();
                break;
            }
                }
                emit GlobalJudgeRemoved(_judge);
            } else {
                // Add judge
                isGlobalJudge[_judge] = true;
                globalJudges.push(_judge);
                emit GlobalJudgeAdded(_judge);
            }
        } else if (_newVotesRequired > 0) {
            // Change votes required
            uint256 oldVotesRequired = votesRequired;
            votesRequired = _newVotesRequired;

            emit VotesRequiredChanged(
                oldVotesRequired,
                _newVotesRequired
            );
        }

        emit ProposalExecuted(
            _proposalId
        );
    }

    /**
     * @dev Get the current vote count for a proposal
     * @param _proposalId Unique identifier for the proposal
     * @return Current vote count
     */
    function getProposalVotes(
        bytes32 _proposalId
    )
        external
        view
        returns (uint256)
    {
        return proposalVotes[_proposalId];
    }

    /**
     * @dev Check if a judge has voted on a proposal
     * @param _proposalId Unique identifier for the proposal
     * @param _judge Address of the judge
     * @return True if the judge has voted
     */
    function hasJudgeVoted(
        bytes32 _proposalId,
        address _judge
    )
        external
        view
        returns (bool)
    {
        return hasVoted[_proposalId][_judge];
    }

    /**
     * @dev Check if a proposal has been executed
     * @param _proposalId Unique identifier for the proposal
     * @return True if the proposal has been executed
     */
    function isProposalExecuted(
        bytes32 _proposalId
    )
        external
        view
        returns (bool)
    {
        return proposalExecuted[_proposalId];
    }
}
