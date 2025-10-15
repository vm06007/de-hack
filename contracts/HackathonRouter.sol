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

    constructor(address _factory) {
        require(_factory != address(0), "Invalid factory address");
        factory = HackathonFactory(_factory);
    }

    /**
     * @dev Creates a new hackathon through the factory
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @return hackathonAddress Address of the newly created hackathon
     */
    function createHackathon(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external payable returns (address hackathonAddress) {
        hackathonAddress = factory.createHackathon{value: msg.value}(
            _name,
            _description,
            _startTime,
            _endTime
        );

        emit HackathonCreated(hackathonAddress, _name, msg.sender, msg.value);
        return hackathonAddress;
    }

    /**
     * @dev Registers a participant for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function registerForHackathon(address _hackathonAddress) external {
        require(_hackathonAddress != address(0), "Invalid hackathon address");

        factory.registerForHackathon(_hackathonAddress);
        emit ParticipantRegistered(_hackathonAddress, msg.sender);
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
    ) external {
        require(_hackathonAddress != address(0), "Invalid hackathon address");

        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.submitProject(_projectName, _projectUrl);

        emit ProjectSubmitted(_hackathonAddress, msg.sender, _projectName);
    }

    /**
     * @dev Gets hackathon details
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getHackathonDetails(address _hackathonAddress) external view returns (
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 prizePool,
        address organizer,
        bool isActive,
        uint256 participantCount
    ) {
        return factory.getHackathonDetails(_hackathonAddress);
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
        return factory.isParticipantRegistered(_hackathonAddress, _participant);
    }

    /**
     * @dev Gets submission details for a participant
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant
     */
    function getSubmission(address _hackathonAddress, address _participant) external view returns (
        address participant,
        string memory projectName,
        string memory projectUrl,
        uint256 submissionTime,
        uint256 score
    ) {
        return factory.getSubmission(_hackathonAddress, _participant);
    }

    /**
     * @dev Gets the total number of hackathons created
     */
    function getTotalHackathons() external view returns (uint256) {
        return factory.getHackathonCount();
    }

    /**
     * @dev Gets the number of hackathons created by an organizer
     * @param _organizer Address of the organizer
     */
    function getOrganizerHackathonCount(address _organizer) external view returns (uint256) {
        return factory.getOrganizerHackathonCount(_organizer);
    }

    /**
     * @dev Gets the number of hackathons a participant is registered for
     * @param _participant Address of the participant
     */
    function getParticipantHackathonCount(address _participant) external view returns (uint256) {
        return factory.getParticipantHackathonCount(_participant);
    }

    /**
     * @dev Gets a specific hackathon created by an organizer
     * @param _organizer Address of the organizer
     * @param _index Index of the hackathon
     */
    function getOrganizerHackathon(address _organizer, uint256 _index) external view returns (address) {
        return factory.getOrganizerHackathon(_organizer, _index);
    }

    /**
     * @dev Gets a specific hackathon a participant is registered for
     * @param _participant Address of the participant
     * @param _index Index of the hackathon
     */
    function getParticipantHackathon(address _participant, uint256 _index) external view returns (address) {
        return factory.getParticipantHackathon(_participant, _index);
    }

    /**
     * @dev Batch operation: Register for multiple hackathons
     * @param _hackathonAddresses Array of hackathon addresses
     */
    function batchRegisterForHackathons(address[] calldata _hackathonAddresses) external {
        require(_hackathonAddresses.length > 0, "No hackathons provided");
        require(_hackathonAddresses.length <= 50, "Too many hackathons"); // Prevent gas issues

        for (uint256 i = 0; i < _hackathonAddresses.length; i++) {
            if (_hackathonAddresses[i] != address(0)) {
                factory.registerForHackathon(_hackathonAddresses[i]);
                emit ParticipantRegistered(_hackathonAddresses[i], msg.sender);
            }
        }
    }
}
