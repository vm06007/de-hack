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
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Curve Finance interfaces
interface ICurvePool {
    function exchange(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    )
        external
        payable
        returns (uint256);

    function get_dy(
        int128 i,
        int128 j,
        uint256 dx
    )
        external
        view
        returns (uint256);

    function coins(uint256 i)
        external
        view
        returns (address);
}

interface IWETH9 {
    function deposit() external payable;
    function withdraw(uint256 wad) external;
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

/**
 * @title HackathonFactory
 * @dev Factory contract for creating new hackathon instances using cloning
 * @notice This contract serves as a factory for deploying individual hackathon contracts using the clone pattern for gas efficiency.
 * @notice This contract also manages global judge governance.
 */
contract HackathonFactory is JudgeCouncil {

    using SafeERC20 for IERC20;

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

    // Curve Finance and token addresses
    address public immutable curvePool;
    address public immutable weth;
    address public immutable pyusd;
    int128 public immutable ethIndex; // Index of ETH in the Curve pool
    int128 public immutable pyusdIndex; // Index of PYUSD in the Curve pool

    event HackathonCreated(
        address indexed hackathonAddress,
        uint256 hackathonId,
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

    event EthToPyusdConversion(
        uint256 ethAmount,
        uint256 pyusdAmount,
        uint256 minPyusdOut
    );

    /**
     * @dev Constructor that sets the implementation contract address and initializes judge governance
     * @param _implementation Address of the HackathonImplementation contract
     * @param _curvePool Address of Curve pool for ETH/PYUSD
     * @param _weth Address of WETH token
     * @param _pyusd Address of PYUSD token
     * @param _ethIndex Index of ETH in the Curve pool
     * @param _pyusdIndex Index of PYUSD in the Curve pool
     */
    constructor(
        address _implementation,
        address _curvePool,
        address _weth,
        address _pyusd,
        int128 _ethIndex,
        int128 _pyusdIndex
    )
        JudgeCouncil(address(this))
    {
        require(
            _implementation != address(0),
            "Invalid implementation address"
        );
        require(
            _curvePool != address(0),
            "Invalid Curve pool address"
        );
        require(
            _weth != address(0),
            "Invalid WETH address"
        );
        require(
            _pyusd != address(0),
            "Invalid PYUSD address"
        );

        implementation = _implementation;
        curvePool = _curvePool;
        weth = _weth;
        pyusd = _pyusd;
        ethIndex = _ethIndex;
        pyusdIndex = _pyusdIndex;

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

        _addFirstGlobalJudge(
            msg.sender
        );
    }

    /**
     * @dev Converts ETH to PYUSD using Curve Finance
     * @param _ethAmount Amount of ETH to convert
     * @param _minPyusdOut Minimum PYUSD amount expected (for slippage protection)
     * @return pyusdAmount Amount of PYUSD received
     */
    function _convertEthToPyusd(
        uint256 _ethAmount,
        uint256 _minPyusdOut
    )
        internal
        returns (uint256 pyusdAmount)
    {
        require(
            _ethAmount > 0,
            "ETH amount must be greater than 0"
        );

        // Execute the swap directly on Curve pool
        pyusdAmount = ICurvePool(curvePool).exchange{value: _ethAmount}(
            ethIndex,
            pyusdIndex,
            _ethAmount,
            _minPyusdOut
        );

        require(
            pyusdAmount >= _minPyusdOut,
            "Insufficient PYUSD output"
        );

        // Emit conversion event
        emit EthToPyusdConversion(
            _ethAmount,
            pyusdAmount,
            _minPyusdOut
        );

        return pyusdAmount;
    }

    /**
     * @dev Estimates how much ETH is needed to get the required PYUSD amount
     * @param _pyusdAmount Required PYUSD amount
     * @return Estimated ETH amount needed
     */
    function _estimateEthForPyusd(uint256 _pyusdAmount) internal view returns (uint256) {
        // Get the current exchange rate from Curve pool
        uint256 estimatedPyusd = this.estimatePyusdOutput(1 ether);
        
        // Calculate how much ETH is needed for the PYUSD amount
        // Add 5% buffer for slippage
        return (_pyusdAmount * 1 ether * 105) / (estimatedPyusd * 100);
    }

    /**
     * @dev Helper function to create and initialize hackathon (reduces stack depth)
     */
    function _createAndInitializeHackathon(
        uint256 _hackathonId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minimumSponsorContribution,
        uint256 _stakeAmount,
        uint256[] memory _prizeDistribution,
        address[] memory _selectedJudges,
        uint256 _pyusdAmount,
        uint256 _estimatedEthForPrizes
    ) internal returns (address hackathonAddress) {
        // Clone the implementation contract
        hackathonAddress = Clones.clone(implementation);

        // Transfer PYUSD to the hackathon contract
        IERC20(pyusd).safeTransfer(hackathonAddress, _pyusdAmount);

        // Initialize the cloned contract with remaining ETH for judges
        _initializeHackathon(
            hackathonAddress,
            _hackathonId,
            _startTime,
            _endTime,
            _minimumSponsorContribution,
            _stakeAmount,
            _prizeDistribution,
            _selectedJudges,
            msg.value - _estimatedEthForPrizes
        );

        return hackathonAddress;
    }

    /**
     * @dev Helper function to initialize hackathon (reduces stack depth)
     */
    function _initializeHackathon(
        address hackathonAddress,
        uint256 _hackathonId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minimumSponsorContribution,
        uint256 _stakeAmount,
        uint256[] memory _prizeDistribution,
        address[] memory _selectedJudges,
        uint256 _remainingEth
    ) internal {
        Hackathon(hackathonAddress).initialize{
            value: _remainingEth
        }(
            msg.sender, // organizer
            _hackathonId,
            _startTime,
            _endTime,
            _minimumSponsorContribution,
            _stakeAmount,
            _prizeDistribution,
            address(this), // factory
            _selectedJudges,
            pyusd // PYUSD token address
        );
    }

    /**
     * @notice Creates a new hackathon contract
     * @dev Deploys a new Hackathon contract with the specified parameters and tracks it
     * @param _hackathonId Unique identifier for the hackathon
     * @param _startTime Start time in Unix timestamp
     * @param _endTime End time in Unix timestamp
     * @param _minimumSponsorContribution Minimum contribution required to become a sponsor
     * @param _stakeAmount Amount participants must stake when joining
     * @param _prizeDistribution Array defining how the prize pool is distributed among winners
     * @param _selectedJudges Array of judge addresses to assign to this hackathon
     * @param _votingConfig Voting system configuration
     * @param _minPyusdOut Minimum PYUSD amount expected (for slippage protection)
     * @return hackathonAddress Address of the newly created hackathon
     */
    function createHackathon(
        uint256 _hackathonId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minimumSponsorContribution,
        uint256 _stakeAmount,
        uint256[] memory _prizeDistribution,
        address[] memory _selectedJudges,
        VotingConfig memory _votingConfig,
        uint256 _minPyusdOut
    )
        external
        payable
        returns (address hackathonAddress)
    {
        // Basic validation
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        require(
            msg.value > 0,
            "Prize pool must be greater than 0"
        );

        // Calculate total prize distribution
        uint256 totalPrizeDistribution = 0;
        for (uint256 i = 0; i < _prizeDistribution.length; i++) {
            require(_prizeDistribution[i] > 0, "Each prize distribution must be greater than 0");
            totalPrizeDistribution += _prizeDistribution[i];
        }

        // Estimate how much ETH is needed for the prize distribution
        // This is a rough estimate - in practice, the organizer should send more ETH
        uint256 estimatedEthForPrizes = _estimateEthForPyusd(totalPrizeDistribution);
        
        // Ensure organizer sent enough ETH (should be more than estimated for judges)
        require(
            msg.value >= estimatedEthForPrizes,
            "Insufficient ETH sent - need more for prizes and judge rewards"
        );

        // Convert only the prize distribution amount to PYUSD
        uint256 pyusdAmount = _convertEthToPyusd(estimatedEthForPrizes, _minPyusdOut);

        // Validate that the converted PYUSD amount matches the total prize distribution
        require(
            pyusdAmount >= totalPrizeDistribution,
            "Insufficient PYUSD amount for prize distribution"
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

        // Create and initialize hackathon
        hackathonAddress = _createAndInitializeHackathon(
            _hackathonId,
            _startTime,
            _endTime,
            _minimumSponsorContribution,
            _stakeAmount,
            _prizeDistribution,
            _selectedJudges,
            pyusdAmount,
            estimatedEthForPrizes
        );

        // Store the hackathon address
        uint256 organizerIndex = organizerHackathonCount[msg.sender];
        organizerHackathons[msg.sender][organizerIndex] = hackathonAddress;
        organizerHackathonCount[msg.sender]++;
        totalHackathons++;

        emit HackathonCreated(
            hackathonAddress,
            _hackathonId,
            msg.sender,
            pyusdAmount, // Emit PYUSD amount instead of ETH
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
    )
        internal
        returns (address votingContract)
    {
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
            _votingConfig.votingPowerPerJudge,
            _votingConfig.maxWinners,
            _judges
        );

        // Wrap with quadratic voting if enabled
        if (_votingConfig.useQuadraticVoting) {
            // Clone QVWrapper for gas efficiency
            address qvWrapper = Clones.clone(qvWrapperImplementation);

            // Initialize the QVWrapper
            QVWrapper(qvWrapper).initialize(votingContract, _votingConfig.votingPowerPerJudge);

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

    /**
     * @dev Gets the current PYUSD balance of the factory
     */
    function getPyusdBalance()
        external
        view
        returns (uint256)
    {
        return IERC20(pyusd).balanceOf(
            address(this)
        );
    }

    /**
     * @dev Gets the current WETH balance of the factory
     */
    function getWethBalance()
        external
        view
        returns (uint256)
    {
        return IERC20(weth).balanceOf(
            address(this)
        );
    }

    /**
     * @dev Estimate PYUSD output for given ETH input using Curve pool
     * @param _ethAmount Amount of ETH to convert
     * @return Estimated PYUSD amount
     */
    function estimatePyusdOutput(
        uint256 _ethAmount
    ) external view returns (uint256) {
        return ICurvePool(curvePool).get_dy(
            ethIndex,
            pyusdIndex,
            _ethAmount
        );
    }

    /**
     * @dev Get Curve pool information
     * @return pool address, ETH index, PYUSD index
     */
    function getCurvePoolInfo()
        external
        view
        returns (
            address,
            int128,
            int128
        )
    {
        return (
            curvePool,
            ethIndex,
            pyusdIndex
        );
    }

    /**
     * @dev Emergency function to withdraw any remaining PYUSD (only global judges)
     */
    function emergencyWithdrawPyusd()
        external
        onlyGlobalJudge
    {
        uint256 balance = IERC20(pyusd).balanceOf(
            address(this)
        );

        if (balance > 0) {
            IERC20(pyusd).safeTransfer(
                msg.sender,
                balance
            );
        }
    }
}
