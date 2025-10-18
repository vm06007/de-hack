// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Hackathon.sol";
import "./JudgeCouncil.sol";
import "./VotingTypes.sol";
import "./OpenVoting.sol";
import "./RevealCommitVoting.sol";
import "./ZKVotingSystem.sol";
import "./QuadraticVoting.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title HackathonFactory
 * @dev Factory contract for creating new hackathon instances using cloning
 * @notice This contract serves as a factory for deploying individual hackathon contracts using the clone pattern for gas efficiency.
 * @notice This contract also manages global judge governance.
 */
contract HackathonFactory is JudgeCouncil {

    mapping(address => uint256) public organizerHackathonCount;
    mapping(address => mapping(uint256 => address)) public organizerHackathons;

    uint256 public totalHackathons;
    uint256 public constant MAX_PRIZE_CLAIM_COOLDOWN = 7 days;

    // Implementation contract addresses
    address public immutable implementation;

    // Voting system implementation addresses
    address public immutable openVotingImplementation;
    address public immutable RevealCommitVotingImplementation;
    address public immutable zkVotingImplementation;
    address public immutable qvWrapperImplementation;

    event HackathonCreated(
        address indexed hackathonAddress,
        string name,
        address indexed organizer,
        uint256 prizePool,
        VotingSystemType votingSystem,
        bool useQuadraticVoting
    );

    event VotingSystemDeployed(
        address indexed votingContract,
        VotingSystemType systemType,
        bool useQuadraticVoting
    );

    /**
     * @dev Constructor that sets the implementation contract address and initializes judge governance
     * @param _implementation Address of the HackathonImplementation contract
     */
    constructor(
        address _implementation
    )
        JudgeCouncil(address(this))
    {
        require(
            _implementation != address(0),
            "Invalid implementation address"
        );

        implementation = _implementation;

        // Deploy voting system implementations (initial)
        openVotingImplementation = address(
            new OpenVoting()
        );

        RevealCommitVotingImplementation = address(
            new RevealCommitVoting()
        );

        zkVotingImplementation = address(
            new ZKVotingSystem()
        );

        qvWrapperImplementation = address(
            new QVWrapper()
        );
    }

    /**
     * @notice Creates a new hackathon contract
     * @dev Deploys a new Hackathon contract with the specified parameters and tracks it
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @param _minimumSponsorContribution Minimum contribution required to become a sponsor
     * @param _selectedJudges Array of judge addresses to assign to this hackathon
     * @param _judgeRewardPercentage Judge reward percentage (0-500, representing 0.00% to 5.00%)
     * @param _stakeAmount Amount participants must stake when joining
     * @param _prizeDistribution Array defining how the prize pool is distributed among winners
     * @param _prizeClaimCooldown Cooldown period before winners can claim prizes
     * @param _judgingDuration Duration of judging phase (2 hours to 2 days)
     * @param _votingConfig Voting system configuration
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
        uint256[] memory _prizeDistribution,
        uint256 _prizeClaimCooldown,
        uint256 _judgingDuration,
        VotingConfig memory _votingConfig
    )
        external
        payable
        returns (address hackathonAddress)
    {
        // Validate cooldown period
        require(
            _prizeClaimCooldown <= MAX_PRIZE_CLAIM_COOLDOWN,
            "Prize claim cooldown cannot exceed 7 days"
        );

        // Validate judging duration
        require(
            _judgingDuration >= 2 hours && _judgingDuration <= 2 days,
            "Judging duration must be between 2 hours and 2 days"
        );

        require(
            msg.value > 0,
            "Prize pool must be greater than 0"
        );

        // Validate that all selected judges are in the global registry
        for (uint256 i = 0; i < _selectedJudges.length; i++) {
            require(
                isJudgeOrDelegate(_selectedJudges[i]),
                "Selected judge is not in global registry"
            );
        }

        // Deploy voting system
        _deployVotingSystem(
            _votingConfig,
            _selectedJudges
        );

        // Clone the implementation contract
        hackathonAddress = Clones.clone(
            implementation
        );

        // Initialize the cloned contract
        Hackathon(hackathonAddress).initialize{
            value: msg.value
        }(
            msg.sender, // organizer
            _name,
            _description,
            _startTime,
            _endTime,
            _minimumSponsorContribution,
            _judgeRewardPercentage,
            _stakeAmount,
            _prizeDistribution,
            _prizeClaimCooldown,
            _judgingDuration,
            address(this), // factory
            _selectedJudges
        );

        // Store the hackathon address
        uint256 organizerIndex = organizerHackathonCount[
            msg.sender
        ];

        totalHackathons++;
        organizerHackathonCount[msg.sender]++;
        organizerHackathons[msg.sender][organizerIndex] = hackathonAddress;

        emit HackathonCreated(
            hackathonAddress,
            _name,
            msg.sender,
            msg.value,
            _votingConfig.systemType,
            _votingConfig.useQuadraticVoting
        );

        return hackathonAddress;
    }

    /**
     * @dev Deploy voting system based on configuration using clone pattern
     * @param _votingConfig Voting system configuration
     * @param _judges Array of judge addresses
     * @return votingContract Address of the deployed voting contract
     */
    function _deployVotingSystem(
        VotingConfig memory _votingConfig,
        address[] memory _judges
    ) internal returns (address votingContract) {
        // Clone base voting system
        if (_votingConfig.systemType == VotingSystemType.OPEN) {
            votingContract = Clones.clone(openVotingImplementation);
        } else if (_votingConfig.systemType == VotingSystemType.COMMIT_REVEAL) {
            votingContract = Clones.clone(RevealCommitVotingImplementation);
        } else if (_votingConfig.systemType == VotingSystemType.ZK_SNARK) {
            votingContract = Clones.clone(zkVotingImplementation);
        } else if (_votingConfig.systemType == VotingSystemType.QUADRATIC) {
            // Quadratic voting uses the same OpenVoting but with quadratic validation
            votingContract = Clones.clone(openVotingImplementation);
        } else {
            revert("Unsupported voting system type");
        }

        // Initialize the voting system
        IVotingSystem(votingContract).initialize(
            _votingConfig.pointsPerJudge,
            _votingConfig.maxWinners,
            _judges
        );

        // Wrap with quadratic voting if enabled
        if (_votingConfig.useQuadraticVoting) {
            // Clone QVWrapper for gas efficiency
            address qvWrapper = Clones.clone(
                qvWrapperImplementation
            );

            // Initialize the QVWrapper
            QVWrapper(qvWrapper).initialize(
                votingContract,
                _votingConfig.creditsPerJudge
            );

            votingContract = qvWrapper;
        }

        emit VotingSystemDeployed(
            votingContract,
            _votingConfig.systemType,
            _votingConfig.useQuadraticVoting
        );

        return votingContract;
    }

    /**
     * @dev Gets the total number of hackathons created
     */
    function getHackathonCount()
        external
        view
        returns (uint256)
    {
        return totalHackathons;
    }

    /**
     * @dev Gets the number of hackathons created by a specific organizer
     * @param _organizer Address of the organizer
     */
    function getOrganizerHackathonCount(
        address _organizer
    )
        external
        view
        returns (uint256)
    {
        return organizerHackathonCount[
            _organizer
        ];
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
        returns (address)
    {
        require(
            _index < organizerHackathonCount[_organizer],
            "Index out of bounds"
        );

        return organizerHackathons[_organizer][_index];
    }
}
