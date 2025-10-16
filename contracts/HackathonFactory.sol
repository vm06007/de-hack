// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Hackathon.sol";

/**
 * @title HackathonFactory
 * @dev Factory contract for creating new hackathon instances
 */
contract HackathonFactory {

    // Mapping to track hackathons by organizer
    mapping(address => mapping(uint256 => address)) public organizerHackathons;
    mapping(address => uint256) public organizerHackathonCount;

    // Mapping to track hackathons by participant
    mapping(address => mapping(uint256 => address)) public participantHackathons;
    mapping(address => uint256) public participantHackathonCount;

    // Total hackathon count
    uint256 public totalHackathons;

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

    /**
     * @dev Creates a new hackathon contract
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @param _minimumSponsorContribution Minimum contribution required to become a sponsor
     * @param _judgeRewardPercentage Judge reward percentage (0-500, representing 0.00% to 5.00%)
     * @return hackathonAddress Address of the newly created hackathon
     */
    function createHackathon(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minimumSponsorContribution,
        uint256 _judgeRewardPercentage
    )
        external
        payable
        returns (address hackathonAddress)
    {
        // Deploy new hackathon contract
        Hackathon newHackathon = new Hackathon{
            value: msg.value
        }(
            _name,
            _description,
            _startTime,
            _endTime,
            msg.sender,
            _minimumSponsorContribution,
            _judgeRewardPercentage
        );

        hackathonAddress = address(
            newHackathon
        );

        // Store the hackathon address
        uint256 organizerIndex = organizerHackathonCount[
            msg.sender
        ];

        organizerHackathons[msg.sender][organizerIndex] = hackathonAddress;
        organizerHackathonCount[msg.sender]++;
        totalHackathons++;

        emit HackathonCreated(
            hackathonAddress,
            _name,
            msg.sender,
            msg.value
        );

        return hackathonAddress;
    }

    /**
     * @dev Creates a new hackathon contract with specified organizer
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @param _organizer Address of the organizer
     * @param _minimumSponsorContribution Minimum contribution required to become a sponsor
     * @param _selectedJudges Array of judge addresses to assign to this hackathon
     * @param _judgeRewardPercentage Judge reward percentage (0-500, representing 0.00% to 5.00%)
     * @return hackathonAddress Address of the newly created hackathon
     */
    function createHackathonWithOrganizer(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        address _organizer,
        uint256 _minimumSponsorContribution,
        address[] memory _selectedJudges,
        uint256 _judgeRewardPercentage
    )
        external
        payable
        returns (address hackathonAddress)
    {
        // Deploy new hackathon contract
        Hackathon newHackathon = new Hackathon{value: msg.value}(
            _name,
            _description,
            _startTime,
            _endTime,
            _organizer,
            _minimumSponsorContribution,
            _judgeRewardPercentage
        );

        // Add selected judges to the hackathon
        for (uint256 i = 0; i < _selectedJudges.length; i++) {
            newHackathon.addJudge(_selectedJudges[i]);
        }

        // Disable factory access to add judges after deployment
        newHackathon.factoryDisableJudgeAccess();

        hackathonAddress = address(newHackathon);

        // Store the hackathon address
        uint256 organizerIndex = organizerHackathonCount[_organizer];
        organizerHackathons[_organizer][organizerIndex] = hackathonAddress;
        organizerHackathonCount[_organizer]++;
        totalHackathons++;

        emit HackathonCreated(
            hackathonAddress,
            _name,
            _organizer,
            msg.value
        );

        return hackathonAddress;
    }

    /**
     * @dev Registers a participant for a specific hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function registerForHackathon(
        address _hackathonAddress
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

        hackathon.registerParticipant(
            msg.sender
        );

        // Track participant's hackathons
        uint256 participantIndex = participantHackathonCount[msg.sender];
        participantHackathons[msg.sender][participantIndex] = _hackathonAddress;
        participantHackathonCount[msg.sender]++;

        emit ParticipantRegistered(
            _hackathonAddress,
            msg.sender
        );
    }

    /**
     * @dev Registers a participant for a specific hackathon (with specified participant)
     * @param _hackathonAddress Address of the hackathon contract
     * @param _participant Address of the participant to register
     */
    function registerParticipantForHackathon(
        address _hackathonAddress,
        address _participant
    )
        external
    {
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        require(
            _participant != address(0),
            "Invalid participant address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        hackathon.registerParticipant(
            _participant
        );

        // Track participant's hackathons
        uint256 participantIndex = participantHackathonCount[_participant];
        participantHackathons[_participant][participantIndex] = _hackathonAddress;
        participantHackathonCount[_participant]++;

        emit ParticipantRegistered(
            _hackathonAddress,
            _participant
        );
    }

    // Note: For project submissions, participants should interact directly with the hackathon contract
    // using the hackathon address returned from createHackathon(). This ensures proper access control
    // and prevents frontrunning attacks or fake submissions.

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
        return participantHackathonCount[
            _participant
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
        require(
            _index < participantHackathonCount[_participant],
            "Index out of bounds"
        );

        return participantHackathons[_participant][_index];
    }



    // Note: For all hackathon operations (sponsors, judges, submissions, etc.),
    // users should interact directly with the hackathon contract using the returned address
    // from createHackathon(). The factory only creates and tracks hackathon contracts.
}
