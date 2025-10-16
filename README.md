# DeHack Platform

A decentralized hackathon platform built on Ethereum that enables organizers to create hackathons, participants to register and submit projects, judges to evaluate submissions, and winners to claim prizes. The platform uses a factory pattern with cloning for gas-efficient hackathon creation and implements a comprehensive governance system for judge management.

## 🏗️ Architecture

The platform uses a modular, gas-optimized architecture:

1. **Factory Pattern with Cloning**: `HackathonFactory` creates hackathon instances using OpenZeppelin's cloning pattern
2. **Inheritance-Based Design**: `Hackathon` inherits from `StakeSystem`, `VotingSystem`, and `JudgingSystem`
3. **Timestamp-Based Phase Management**: Automatic progression through submission → voting → claiming phases
4. **Global Judge Governance**: `JudgeCouncil` manages the global judge ecosystem

## 📋 Smart Contracts

### Core Contracts

#### 1. **HackathonFactory.sol**
Factory contract for creating new hackathon instances using gas-efficient cloning.

**Key Features**:
- Gas-efficient hackathon creation via OpenZeppelin cloning
- Global judge governance management
- Judge validation against global registry
- Inherits from JudgeCouncil for governance functionality

**Main Function**:
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

#### 2. **Hackathon.sol**
Main hackathon contract that manages the entire hackathon lifecycle.

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

#### 3. **StakeSystem.sol**
Manages participant stakes and stake-related operations.

**Features**:
- Participant stake deposits
- Automatic stake refunds upon project submission
- Stake tracking and management

#### 4. **VotingSystem.sol**
Handles voting, winner determination, and prize distribution.

**Key Features**:
- Dynamic winner tracking (O(1) lookups)
- Prize distribution based on exact amounts
- Winner determination through voting or random selection
- Prize claiming with cooldown periods

**Scalability Features**:
- No large arrays that could hit gas limits
- Efficient winner tracking without sorting all participants
- Gas-optimized prize calculations

#### 5. **JudgingSystem.sol**
Manages hackathon-specific judge operations and delegation.

**Features**:
- Judge addition and removal
- Judge delegation system
- Judge reward management
- Judge validation

#### 6. **JudgeCouncil.sol**
Global judge governance system for managing the judge ecosystem.

**Features**:
- Global judge registry
- Judge addition/removal through voting
- Governance parameter management
- Judge reward distribution

### Legacy Contracts

#### **DeHackPlatform.sol**
The original monolithic contract (legacy, not used in current architecture).

#### **Counter.sol**
Simple counter contract for testing and demonstration purposes.

## 🚀 Key Features

### Gas Optimization
- **Cloning Pattern**: Reduces deployment costs by ~90%
- **Efficient Data Structures**: Mappings instead of arrays where possible
- **Minimal State Variables**: Packed structs and optimized storage

### Scalability
- **No Gas Limit Issues**: Avoids large arrays that could clog blocks
- **Dynamic Winner Tracking**: O(1) lookups without sorting all participants
- **Batch Operations**: Single transaction for multiple operations

### Security
- **Access Control**: Role-based permissions with modifiers
- **Input Validation**: Comprehensive validation for all inputs
- **Reentrancy Protection**: Protected external calls
- **Stake Protection**: Automatic stake refunds and locking mechanisms

### Automatic Progression
- **Timestamp-Based Phases**: No complex state progression logic
- **Simple Modifiers**: Clean phase checking with `onlyDuringX` modifiers
- **Pre-calculated Timestamps**: All phase boundaries calculated at initialization

## 🔄 Usage Flow

1. **Organizers**: Create hackathons with prize pools using `HackathonFactory`
2. **Participants**: Register for hackathons before they start (with stake deposit)
3. **Development**: Submit projects during submission phase
4. **Judging**: Judges vote on submissions during voting phase
5. **Claiming**: Winners claim prizes after claiming phase begins

## 🛠️ Development

### Prerequisites
- Node.js and Bun package manager
- Hardhat development environment
- Ethereum network access

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd de-hack

# Install dependencies
bun install
```

### Commands
```bash
# Compile contracts
bun hardhat compile

# Run tests
bun hardhat test

# Run specific test file
bun hardhat test test/HackathonBasic.t.sol

# Deploy to network
bun hardhat run scripts/deploy-and-verify.ts --network <network>
```

### Testing
The system includes comprehensive test coverage with **68 tests passing**:

- **HackathonBasic.t.sol**: Core functionality tests
- **HackathonJudge.t.sol**: Judge management tests  
- **HackathonDelegation.t.sol**: Delegation system tests
- **HackathonPrize.t.sol**: Prize distribution tests
- **HackathonFactoryBasic.t.sol**: Factory functionality tests

## 📊 Test Results

```
Running Solidity tests
  ✔ 68 tests passing
  ✔ 0 tests failing
  ✔ All functionality working correctly
```

## 🔒 Security Features

- **Time-based Access Controls**: Phase-specific function access
- **Role-based Permissions**: Organizer, judge, and participant roles
- **Input Validation**: Comprehensive validation for all parameters
- **Reentrancy Protection**: Protected external calls
- **Stake Protection**: Automatic refunds and locking mechanisms
- **Emergency Mechanisms**: Controlled withdrawal functions

## 🎯 Design Decisions

### 1. Timestamp-Based Phase Management
Instead of complex state progression functions, the system uses pre-calculated timestamps:

```solidity
// Calculated during initialization
votingStartTime = _endTime;
votingEndTime = votingStartTime + _judgingDuration;
claimingStartTime = votingEndTime + _prizeClaimCooldown;
```

### 2. Exact Prize Distribution
Prizes are defined as exact amounts rather than ratios:

```solidity
// Organizer specifies exact amounts: [3000, 2000, 1000] (in wei)
// Total must equal deposited prize pool
uint256[] public prizeDistribution;
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

## 🚀 Future Improvements

- **Oracle Integration**: Chainlink VRF for true randomness
- **Multi-Token Support**: ERC-20 token prizes and stakes
- **Advanced Governance**: Time-locked governance for parameter changes
- **Layer 2 Deployment**: Polygon, Arbitrum support
- **Batch Operations**: Enhanced batch functionality for large hackathons

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For questions or support, please open an issue on the GitHub repository or contact the development team.

---

*Last updated: October 17, 2025*  
*Version: 1.0.0*