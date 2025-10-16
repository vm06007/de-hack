// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Hackathon.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title HackathonFactory
 * @dev Factory contract for creating new hackathon instances using cloning
 * @notice This contract serves as a factory for deploying individual hackathon contracts using the clone pattern for gas efficiency.
 */
contract HackathonFactory {

    mapping(address => uint256) public organizerHackathonCount;
    mapping(address => mapping(uint256 => address)) public organizerHackathons;

    uint256 public totalHackathons;
    uint256 public constant MAX_PRIZE_CLAIM_COOLDOWN = 7 days;

    // Implementation contract address
    address public immutable implementation;

    event HackathonCreated(
        address indexed hackathonAddress,
        string name,
        address indexed organizer,
        uint256 prizePool
    );

    /**
     * @dev Constructor that sets the implementation contract address
     * @param _implementation Address of the HackathonImplementation contract
     */
    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation address");
        implementation = _implementation;
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
        uint256 _prizeClaimCooldown
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

        require(
            msg.value > 0,
            "Prize pool must be greater than 0"
        );

        // Clone the implementation contract
        hackathonAddress = Clones.clone(implementation);

        // Initialize the cloned contract
        Hackathon(hackathonAddress).initialize{value: msg.value}(
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
            address(this), // factory
            _selectedJudges
        );

        // Store the hackathon address
        uint256 organizerIndex = organizerHackathonCount[msg.sender];

        totalHackathons++;
        organizerHackathonCount[msg.sender]++;
        organizerHackathons[msg.sender][organizerIndex] = hackathonAddress;

        emit HackathonCreated(
            hackathonAddress,
            _name,
            msg.sender,
            msg.value
        );

        return hackathonAddress;
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
