// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title DeHackPlatform
 * @dev A decentralized hackathon platform for organizing and managing hackathons
 */
contract DeHackPlatform {

    struct Hackathon {
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        address organizer;
        bool isActive;
        uint256 participantCount;
    }

    struct Submission {
        address participant;
        string projectName;
        string projectUrl;
        uint256 submissionTime;
        uint256 score;
    }

    uint256 public hackathonCounter;
    mapping(uint256 => Hackathon) public hackathons;
    mapping(uint256 => mapping(address => Submission)) public submissions;
    mapping(uint256 => address[]) public participants;
    mapping(uint256 => mapping(address => bool)) public hasSubmitted;

    event HackathonCreated(
        uint256 indexed hackathonId,
        string name,
        address indexed organizer,
        uint256 prizePool
    );

    event ParticipantRegistered(
        uint256 indexed hackathonId,
        address indexed participant
    );

    event SubmissionMade(
        uint256 indexed hackathonId,
        address indexed participant,
        string projectName
    );

    event PrizeDistributed(
        uint256 indexed hackathonId,
        address indexed winner,
        uint256 amount
    );

    modifier onlyOrganizer(
        uint256 _hackathonId
    ) {
        require(
            msg.sender == hackathons[_hackathonId].organizer,
            "Only organizer can call this function"
        );
        _;
    }

    modifier hackathonActive(uint256 _hackathonId) {
        require(
            hackathons[_hackathonId].isActive,
            "Hackathon is not active"
        );
        require(
            block.timestamp >= hackathons[_hackathonId].startTime,
            "Hackathon has not started yet"
        );
        require(
            block.timestamp <= hackathons[_hackathonId].endTime,
            "Hackathon has ended"
        );
        _;
    }

    /**
     * @dev Creates a new hackathon
     * @param _name Name of the hackathon
     * @param _description Description of the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     */
    function createHackathon(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    )
        external
        payable
    {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(msg.value > 0, "Prize pool must be greater than 0");

        hackathonCounter++;

        Hackathon storage newHackathon = hackathons[hackathonCounter];
        newHackathon.name = _name;
        newHackathon.description = _description;
        newHackathon.startTime = _startTime;
        newHackathon.endTime = _endTime;
        newHackathon.prizePool = msg.value;
        newHackathon.organizer = msg.sender;
        newHackathon.isActive = true;
        newHackathon.participantCount = 0;

        emit HackathonCreated(
            hackathonCounter,
            _name,
            msg.sender,
            msg.value
        );
    }

    /**
     * @dev Registers a participant for a hackathon
     * @param _hackathonId ID of the hackathon to register for
     */
    function registerForHackathon(
        uint256 _hackathonId
    )
        external
    {
        require(
            hackathons[_hackathonId].isActive,
            "Hackathon is not active"
        );
        require(
            block.timestamp < hackathons[_hackathonId].startTime,
            "Registration closed - hackathon has started"
        );

        participants[_hackathonId].push(
            msg.sender
        );

        hackathons[_hackathonId].participantCount++;

        emit ParticipantRegistered(
            _hackathonId,
            msg.sender
        );
    }

    /**
     * @dev Submits a project for a hackathon
     * @param _hackathonId ID of the hackathon
     * @param _projectName Name of the project
     * @param _projectUrl URL of the project repository or demo
     */
    function submitProject(
        uint256 _hackathonId,
        string memory _projectName,
        string memory _projectUrl
    )
        external
        hackathonActive(_hackathonId)
    {
        require(!hasSubmitted[_hackathonId][msg.sender], "Already submitted");

        submissions[_hackathonId][msg.sender] = Submission({
            participant: msg.sender,
            projectName: _projectName,
            projectUrl: _projectUrl,
            submissionTime: block.timestamp,
            score: 0
        });

        hasSubmitted[_hackathonId][msg.sender] = true;

        emit SubmissionMade(
            _hackathonId,
            msg.sender,
            _projectName
        );
    }

    /**
     * @dev Gets hackathon details
     * @param _hackathonId ID of the hackathon
     */
    function getHackathonDetails(
        uint256 _hackathonId
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
        )
    {
        Hackathon storage hackathon = hackathons[
            _hackathonId
        ];

        return (
            hackathon.name,
            hackathon.description,
            hackathon.startTime,
            hackathon.endTime,
            hackathon.prizePool,
            hackathon.organizer,
            hackathon.isActive,
            hackathon.participantCount
        );
    }

    /**
     * @dev Emergency function to withdraw funds (only organizer)
     * @param _hackathonId ID of the hackathon
     */
    function emergencyWithdraw(
        uint256 _hackathonId
    )
        external
        onlyOrganizer(_hackathonId)
    {
        require(
            hackathons[_hackathonId].isActive,
            "Hackathon is not active"
        );

        uint256 amount = hackathons[_hackathonId].prizePool;
        hackathons[_hackathonId].prizePool = 0;
        hackathons[_hackathonId].isActive = false;

        payable(msg.sender).transfer(amount);
    }
}
