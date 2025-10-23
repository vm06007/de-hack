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

// Curve Finance Router interface
interface ICurveRouter {
    function exchange(
        address[11] calldata _route,
        uint256[5][5] calldata _swap_params,
        uint256 _amount,
        uint256 _min_dy,
        address[5] calldata _pools
    ) external payable returns (uint256);
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

    // Curve Finance Router and token addresses
    address public immutable curveRouter;
    address public immutable weth;
    address public immutable pyusd;

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

    event EmergencyWithdrawal(
        address indexed judge,
        address indexed token,
        uint256 amount
    );

    event EthToPyusdConversion(
        uint256 ethAmount,
        uint256 pyusdAmount,
        uint256 minPyusdOut
    );

    /**
     * @dev Constructor that sets the implementation contract address and initializes judge governance
     * @param _implementation Address of the HackathonImplementation contract
     * @param _curveRouter Address of Curve router for ETH/PYUSD swaps
     * @param _weth Address of WETH token
     * @param _pyusd Address of PYUSD token
     */
    constructor(
        address _implementation,
        address _curveRouter,
        address _weth,
        address _pyusd
    )
        JudgeCouncil(address(this))
    {

        implementation = _implementation;
        curveRouter = _curveRouter;
        weth = _weth;
        pyusd = _pyusd;

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

        // Execute the swap using Curve router
        // Route: ETH -> USDC -> PYUSD
        address[11] memory route = [
            0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, // ETH
            0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B, // ETH/USDC pool
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // USDC
            0x383E6b4437b59fff47B619CBA855CA29342A8559, // USDC/PYUSD pool
            pyusd,      // PYUSD
            address(0), // Unused
            address(0), // Unused
            address(0), // Unused
            address(0), // Unused
            address(0), // Unused
            address(0)  // Unused
        ];

        uint256[5][5] memory swapParams = [
            [uint256(0), uint256(1), uint256(1), uint256(1), uint256(2)], // ETH/USDC: i=0, j=1, swap_type=1, pool_type=1, n_coins=2
            [uint256(0), uint256(1), uint256(1), uint256(1), uint256(2)], // USDC/PYUSD: i=0, j=1, swap_type=1, pool_type=1, n_coins=2
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)], // Unused
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)], // Unused
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]  // Unused
        ];

        address[5] memory pools = [
            0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B, // ETH/USDC pool
            0x383E6b4437b59fff47B619CBA855CA29342A8559, // USDC/PYUSD pool
            address(0), // Unused
            address(0), // Unused
            address(0)  // Unused
        ];

        pyusdAmount = ICurveRouter(curveRouter).exchange{
            value: _ethAmount
        }(
            route,
            swapParams,
            _ethAmount,
            _minPyusdOut,
            pools
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
        uint256 _pyusdAmount
    )
        internal
        returns (address hackathonAddress)
    {
        // Clone the implementation contract
        hackathonAddress = Clones.clone(
            implementation
        );

        // Transfer PYUSD to the hackathon contract
        IERC20(pyusd).safeTransfer(
            hackathonAddress,
            _pyusdAmount
        );

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
            0
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
    )
        internal
    {
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
        VotingConfig memory _votingConfig
    )
        external
        payable
        returns (address hackathonAddress)
    {
        // Basic validation
        require(
            _startTime > block.timestamp,
            "Start time must be in the future"
        );

        require(
            _endTime > _startTime,
            "End time must be after start time"
        );

        // Calculate total prize distribution
        uint256 totalPrizeDistribution = 0;
        for (uint256 i = 0; i < _prizeDistribution.length; i++) {
            totalPrizeDistribution += _prizeDistribution[i];
        }

        // Convert all ETH to PYUSD
        uint256 pyusdAmount = _convertEthToPyusd(
            msg.value,
            10000000 // @TODO: pass dynamically through constructor (6 decimals)
        );

        // The Curve router swap has already sent PYUSD to this factory contract
        // We will transfer ALL PYUSD balance to the hackathon

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
            pyusdAmount
        );

        // Transfer ALL PYUSD balance to the hackathon contract
        uint256 pyusdBalance = IERC20(pyusd).balanceOf(address(this));
        IERC20(pyusd).safeTransfer(hackathonAddress, pyusdBalance);

        // Store the hackathon address
        uint256 organizerIndex = organizerHackathonCount[msg.sender];
        organizerHackathons[msg.sender][organizerIndex] = hackathonAddress;
        organizerHackathonCount[msg.sender]++;
        totalHackathons++;

        emit HackathonCreated(
            hackathonAddress,
            _hackathonId,
            msg.sender,
            pyusdAmount,
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
            address qvWrapper = Clones.clone(
                qvWrapperImplementation
            );

            // Initialize the QVWrapper
            QVWrapper(qvWrapper).initialize(
                votingContract,
                _votingConfig.votingPowerPerJudge
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
     * @dev Get Curve router information
     * @return router address, WETH address, PYUSD address
     */
    function getCurveRouterInfo()
        external
        view
        returns (
            address,
            address,
            address
        )
    {
        return (
            curveRouter,
            weth,
            pyusd
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

    /**
     * @notice Emergency withdrawal function for ETH - only global judges can execute
     * @dev Allows global judges to withdraw ETH in emergency situations
     * @param _amount Amount of ETH to withdraw
     */
    function emergencyWithdrawETH(
        uint256 _amount
    )
        external
        onlyGlobalJudge
    {
        // Transfer ETH to the global judge
        payable(msg.sender).transfer(
            _amount
        );

        emit EmergencyWithdrawal(
            msg.sender,
            address(0),
            _amount
        );
    }
}
