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

    /**
     * @dev Gets hackathon details from a specific hackathon contract
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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.getHackathonDetails();
    }

    /**
     * @dev Checks if an address is registered for a specific hackathon
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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.isParticipantRegistered(
            _participant
        );
    }

    /**
     * @dev Gets submission details from a specific hackathon contract
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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.getSubmission(
            _participant
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

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        hackathon.becomeSponsor{
            value: msg.value
        }();
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

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        hackathon.addJudge(
            _judge
        );
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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        hackathon.scoreSubmission(
            _participant,
            _score
        );
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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

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
        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.isJudge(
            _judge
        );
    }

    /**
     * @dev Gets sponsor contribution for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     * @param _sponsor Address of the sponsor
     */
    function getSponsorContribution(address _hackathonAddress, address _sponsor) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getSponsorContribution(_sponsor);
    }

    /**
     * @dev Gets total prize pool for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getTotalPrizePool(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getTotalPrizePool();
    }

    /**
     * @dev Gets minimum sponsor contribution for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getMinimumSponsorContribution(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getMinimumSponsorContribution();
    }

    /**
     * @dev Allows judges to claim their reward
     * @param _hackathonAddress Address of the hackathon contract
     */
    function claimJudgeReward(address _hackathonAddress) external {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        hackathon.claimJudgeReward();
    }

    /**
     * @dev Gets judge reward pool for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getJudgeRewardPool(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getJudgeRewardPool();
    }

    /**
     * @dev Gets reward per judge for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getRewardPerJudge(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
        Hackathon hackathon = Hackathon(_hackathonAddress);
        return hackathon.getRewardPerJudge();
    }

    /**
     * @dev Gets judge reward percentage for a hackathon
     * @param _hackathonAddress Address of the hackathon contract
     */
    function getJudgeRewardPercentage(address _hackathonAddress) external view returns (uint256) {
        require(_hackathonAddress != address(0), "Invalid hackathon address");
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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

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
        require(
            _hackathonAddress != address(0),
            "Invalid hackathon address"
        );

        Hackathon hackathon = Hackathon(
            _hackathonAddress
        );

        return hackathon.getDelegateJudge(_delegate);
    }

    // Note: For organizer-only functions like distributePrize, emergencyWithdraw, and endHackathon,
    // users should interact directly with the hackathon contract using the returned address
    // from createHackathon(). The factory only provides read-only access and participant functions.
}
