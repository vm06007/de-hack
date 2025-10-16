# DeHack Platform - Smart Contract Documentation

## Overview

DeHack is a decentralized hackathon platform built on Ethereum that enables organizers to create hackathons, participants to register and submit projects, judges to evaluate submissions, and winners to claim prizes. The platform uses a factory pattern with cloning for gas-efficient hackathon creation and implements a comprehensive governance system for judge management.

## Architecture

### Core Contracts

#### 1. HackathonFactory.sol
**Purpose**: Factory contract for creating new hackathon instances using OpenZeppelin's cloning pattern.

**Key Features**:
- Gas-efficient hackathon creation via cloning
- Global judge governance management
- Judge validation against global registry
- Inherits from JudgeCouncil for governance functionality

**Main Functions**:
```solidity
function createHackathon(
    string memory _name,
    string memory _description,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _stakeAmount,
    uint256 _prizeClaimCooldown,
    uint256 _judgingDuration,
    uint256[] memory _prizeDistribution,
    address[] memory _judges
) external payable returns (address)
```

#### 2. Hackathon.sol
**Purpose**: Main hackathon contract that manages the entire hackathon lifecycle.

**Inheritance Chain**:
- `Hackathon` inherits from `StakeSystem`, `VotingSystem`, and `JudgingSystem`

**Key Features**:
- Participant registration and project submission
- Automatic phase progression based on timestamps
- Prize distribution and claiming
- Judge management and delegation
- Sponsor contributions

**Phase Management**:
- **Submission Phase**: `startTime` to `endTime`
- **Voting Phase**: `votingStartTime` to `votingEndTime`
- **Claiming Phase**: `claimingStartTime` onwards

**Modifiers**:
- `onlyDuringSubmission()`: Ensures function is called during submission phase
- `onlyDuringVoting()`: Ensures function is called during voting phase
- `onlyDuringClaiming()`: Ensures function is called during claiming phase

#### 3. StakeSystem.sol
**Purpose**: Manages participant stakes and stake-related operations.

**Key Features**:
- Participant stake deposits
- Stake refunds upon project submission
- Stake tracking and management

#### 4. VotingSystem.sol
**Purpose**: Handles voting, winner determination, and prize distribution.

**Key Features**:
- Dynamic winner tracking (O(1) lookups)
- Prize distribution based on exact amounts
- Winner determination through voting or random selection
- Prize claiming with cooldown periods

**Scalability Features**:
- No large arrays that could hit gas limits
- Efficient winner tracking without sorting all participants
- Gas-optimized prize calculations

#### 5. JudgingSystem.sol
**Purpose**: Manages hackathon-specific judge operations and delegation.

**Key Features**:
- Judge addition and removal
- Judge delegation system
- Judge reward management
- Judge validation

#### 6. JudgeCouncil.sol
**Purpose**: Global judge governance system for managing the judge ecosystem.

**Key Features**:
- Global judge registry
- Judge addition/removal through voting
- Governance parameter management
- Judge reward distribution

## Key Design Decisions

### 1. Timestamp-Based Phase Management
Instead of complex state progression functions, the system uses pre-calculated timestamps and simple modifiers:

```solidity
// Calculated during initialization
votingStartTime = _endTime;
votingEndTime = votingStartTime + _judgingDuration;
claimingStartTime = votingEndTime + _prizeClaimCooldown;

// Simple modifiers
modifier onlyDuringVoting() {
    require(block.timestamp >= votingStartTime && block.timestamp <= votingEndTime, "Not during voting phase");
    _;
}
```

### 2. Gas-Efficient Cloning Pattern
Uses OpenZeppelin's `Clones.sol` for gas-efficient hackathon creation:

```solidity
// Deploy implementation once
Hackathon implementation = new Hackathon();

// Clone for each new hackathon
address clone = Clones.clone(address(implementation));
Hackathon(clone).initialize(...);
```

### 3. Scalable Winner Tracking
Avoids gas limit issues with large participant lists:

```solidity
// Instead of: address[] public participantsWithSubmissions;
uint256 public totalSubmissions; // Just a counter

// Dynamic winner tracking without sorting
mapping(address => uint256) public winnerPosition;
address[] public winners;
```

### 4. Exact Prize Distribution
Prizes are defined as exact amounts rather than ratios:

```solidity
// Organizer specifies exact amounts: [3000, 2000, 1000] (in wei)
// Total must equal deposited prize pool
uint256[] public prizeDistribution;
```

## Security Features

### 1. Access Control
- `onlyOrganizer` modifier for organizer-only functions
- `onlyJudge` modifier for judge-only functions
- `onlyDuringX` modifiers for phase-specific access

### 2. Input Validation
- Time validation (start < end, judging duration 2 hours to 2 days)
- Prize distribution validation (sum must equal prize pool)
- Address validation (non-zero addresses)

### 3. Reentrancy Protection
- Uses `nonReentrant` modifier on critical functions
- External calls made last in functions

### 4. Stake Protection
- Stakes are locked until project submission
- Automatic stake refund upon submission
- No way to withdraw stakes without submitting

## Gas Optimization

### 1. Cloning Pattern
- Reduces deployment costs by ~90%
- Single implementation contract for all hackathons

### 2. Efficient Data Structures
- Mappings instead of arrays where possible
- Packed structs to minimize storage slots
- Minimal state variables

### 3. Batch Operations
- Single transaction for multiple operations where possible
- Efficient event emission

## Testing

The system includes comprehensive test coverage:

- **HackathonBasic.t.sol**: Core functionality tests
- **HackathonJudge.t.sol**: Judge management tests
- **HackathonDelegation.t.sol**: Delegation system tests
- **HackathonPrize.t.sol**: Prize distribution tests
- **HackathonFactoryBasic.t.sol**: Factory functionality tests

**Test Results**: 68 tests passing ✅

## Deployment

### Prerequisites
- Node.js and Bun package manager
- Hardhat development environment
- Ethereum network access

### Commands
```bash
# Install dependencies
bun install

# Compile contracts
bun hardhat compile

# Run tests
bun hardhat test

# Deploy to network
bun hardhat run scripts/deploy-and-verify.ts --network <network>
```

## Future Improvements

### 1. Oracle Integration
- Replace pseudo-randomness with Chainlink VRF
- Price feeds for multi-token support

### 2. Multi-Token Support
- Support for ERC-20 tokens as prizes
- Multi-token stake deposits

### 3. Advanced Governance
- Time-locked governance for parameter changes
- Multi-signature requirements for critical operations

### 4. Scalability Enhancements
- Layer 2 deployment (Polygon, Arbitrum)
- Batch operations for large hackathons

## Contract Addresses

*To be updated after deployment*

- HackathonFactory: `TBD`
- JudgeCouncil: `TBD`
- Hackathon Implementation: `TBD`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

For questions or support, please open an issue on the GitHub repository or contact the development team.

---

*Last updated: October17 2025*
*Version: 1.0.0*
