# DeHack Platform - Decentralized Hackathon System

## Overview

DeHack is a comprehensive decentralized hackathon platform built on Ethereum that enables organizers to create hackathons, participants to register and submit projects, judges to evaluate submissions, and winners to claim prizes. The platform uses a factory pattern with cloning for gas-efficient hackathon creation and implements multiple voting systems for fair judging.

## System Architecture

### Core Components

The DeHack platform consists of several key smart contracts working together:

1. **HackathonFactory** - Factory contract for creating new hackathons
2. **Hackathon** - Individual hackathon contract managing the lifecycle
3. **Voting Systems** - Multiple voting mechanisms (Open, Commit-Reveal, ZK-SNARK, Quadratic)
4. **Stake System** - Participant stake management
5. **Judge Council** - Global judge governance
6. **Curve Integration** - ETH to PYUSD conversion for prizes

### System Architecture Diagram

```mermaid
graph TB
    subgraph "DeHack Platform"
        HF[HackathonFactory]
        JC[JudgeCouncil]
        CS[Curve System]
        
        subgraph "Individual Hackathon"
            H[Hackathon Contract]
            SS[StakeSystem]
            VS[VotingSystem]
            JS[JudgingSystem]
            
            subgraph "Voting Systems"
                OV[OpenVoting]
                CRV[CommitRevealVoting]
                ZKV[ZKVotingSystem]
                QV[QuadraticVoting]
            end
        end
        
        subgraph "External Integrations"
            CR[Curve Router]
            WETH[WETH Token]
            PYUSD[PYUSD Token]
        end
    end
    
    subgraph "User Roles"
        O[Organizer]
        S[Sponsor]
        P[Participant/Hacker]
        J[Judge]
    end
    
    HF --> H
    HF --> JC
    HF --> CS
    H --> SS
    H --> VS
    H --> JS
    VS --> OV
    VS --> CRV
    VS --> ZKV
    VS --> QV
    
    CS --> CR
    CS --> WETH
    CS --> PYUSD
    
    O --> HF
    S --> H
    P --> H
    J --> H
```

## User Roles and Interactions

### 1. Organizer Role

**Responsibilities:**
- Create hackathons using the factory
- Set hackathon parameters (timing, prizes, judges)
- Configure voting systems
- Manage hackathon lifecycle

**Key Interactions:**
```mermaid
sequenceDiagram
    participant O as Organizer
    participant HF as HackathonFactory
    participant H as Hackathon
    participant CR as Curve Router
    
    O->>HF: createHackathon()
    Note over O,HF: Send ETH for prize pool
    HF->>CR: Convert ETH to PYUSD
    CR-->>HF: Return PYUSD
    HF->>H: Deploy & Initialize
    HF-->>O: Return hackathon address
    O->>H: Configure judges & parameters
```

**Organizer Flow:**
1. **Hackathon Creation**: Call `createHackathon()` with parameters
2. **Prize Pool Setup**: ETH is automatically converted to PYUSD via Curve
3. **Judge Selection**: Choose judges from global registry
4. **Voting Configuration**: Select voting system type
5. **Hackathon Management**: Monitor and manage hackathon lifecycle

### 2. Sponsor Role

**Responsibilities:**
- Contribute to hackathon prize pools
- Support specific hackathons with ETH or tokens
- Distribute prizes to winners

**Key Interactions:**
```mermaid
sequenceDiagram
    participant S as Sponsor
    participant H as Hackathon
    participant W as Winner
    
    S->>H: becomeSponsor() or becomeSponsorWithToken()
    H-->>S: Sponsor registered
    Note over S,H: Sponsor can contribute ETH or ERC20 tokens
    S->>H: distributePrize(winner, amount)
    H->>W: Transfer prize
```

**Sponsor Flow:**
1. **Contribution**: Send ETH or ERC20 tokens to become sponsor
2. **Prize Pool**: Sponsor's contribution creates separate prize pool
3. **Distribution**: Sponsor can distribute prizes to winners
4. **Tracking**: Monitor distributed vs. available amounts

### 3. Participant/Hacker Role

**Responsibilities:**
- Register for hackathons
- Submit projects during submission phase
- Claim prizes if winning

**Key Interactions:**
```mermaid
sequenceDiagram
    participant P as Participant
    participant H as Hackathon
    participant SS as StakeSystem
    
    P->>H: register()
    Note over P,H: Must stake required amount
    H->>SS: Deposit stake
    P->>H: submitProject(name, url)
    SS->>P: Return stake
    Note over P,H: During submission phase
    P->>H: claimPrize()
    H->>P: Transfer prize
```

**Participant Flow:**
1. **Registration**: Pay stake to register for hackathon
2. **Development**: Work on project during hackathon period
3. **Submission**: Submit project details before deadline
4. **Stake Return**: Receive stake back upon submission
5. **Prize Claiming**: Claim prizes if winning (after cooldown)

### 4. Judge Role

**Responsibilities:**
- Evaluate submissions during voting phase
- Vote on projects using selected voting system
- Receive judge rewards

**Key Interactions:**
```mermaid
sequenceDiagram
    participant J as Judge
    participant H as Hackathon
    participant VS as VotingSystem
    
    J->>H: voteForSubmission(participant, points)
    H->>VS: Record vote
    Note over J,H: During voting phase
    J->>H: claimJudgeReward()
    H->>J: Transfer reward
```

**Judge Flow:**
1. **Voting Phase**: Judge submissions during designated period
2. **Point Allocation**: Allocate points to participants
3. **Voting System**: Use configured voting mechanism
4. **Reward Claiming**: Claim judge rewards after hackathon

## Voting Systems

The platform supports multiple voting mechanisms:

### 1. Open Voting
- Transparent voting system
- All votes are publicly visible
- Simple point allocation

### 2. Commit-Reveal Voting
- Hidden voting until reveal phase
- Prevents strategic voting
- Two-phase process: commit then reveal

### 3. Zero-Knowledge (ZK-SNARK) Voting
- Private voting with cryptographic proofs
- Maintains anonymity while ensuring validity
- Advanced cryptographic implementation

### 4. Quadratic Voting
- Participants get voting credits
- Cost increases quadratically with votes
- Prevents vote buying and promotes fair distribution

## Hackathon Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Registration: Organizer creates hackathon
    Registration --> Submission: Start time reached
    Submission --> Voting: End time reached
    Voting --> Claiming: Voting period ends
    Claiming --> [*]: All prizes claimed
    
    state Registration {
        [*] --> ParticipantsRegister
        ParticipantsRegister --> StakeDeposited
    }
    
    state Submission {
        [*] --> ProjectsSubmitted
        ProjectsSubmitted --> StakeReturned
    }
    
    state Voting {
        [*] --> JudgesVote
        JudgesVote --> WinnersDetermined
    }
    
    state Claiming {
        [*] --> CooldownPeriod
        CooldownPeriod --> PrizesClaimed
    }
```

## Technical Features

### Gas Optimization
- **Clone Pattern**: Uses OpenZeppelin's cloning for gas-efficient hackathon creation
- **Batch Operations**: Supports batch voting and operations
- **Efficient Storage**: Optimized data structures for scalability

### Security Features
- **Stake System**: Participants must stake to prevent spam
- **Judge Validation**: Global judge registry with validation
- **Time-based Phases**: Automatic phase progression
- **Access Controls**: Role-based permissions

### Integration Features
- **Curve Finance**: Automatic ETH to PYUSD conversion
- **Multi-token Support**: Support for ETH and ERC20 tokens
- **Flexible Voting**: Multiple voting system options
- **Sponsor System**: Independent sponsor prize pools

## Smart Contract Architecture

### Core Contracts

#### HackathonFactory.sol
```solidity
contract HackathonFactory is JudgeCouncil {
    function createHackathon(
        uint256 _hackathonId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minimumSponsorContribution,
        uint256 _stakeAmount,
        uint256[] memory _prizeDistribution,
        address[] memory _selectedJudges,
        VotingConfig memory _votingConfig
    ) external payable returns (address hackathonAddress)
}
```

#### Hackathon.sol
```solidity
contract Hackathon is StakeSystem, VotingSystem, JudgingSystem {
    // Manages entire hackathon lifecycle
    // Inherits stake, voting, and judging functionality
}
```

### Inheritance Hierarchy

```mermaid
graph TD
    H[Hackathon]
    SS[StakeSystem]
    VS[VotingSystem]
    JS[JudgingSystem]
    
    H --> SS
    H --> VS
    H --> JS
    
    subgraph "Voting Systems"
        OV[OpenVoting]
        CRV[CommitRevealVoting]
        ZKV[ZKVotingSystem]
        QV[QuadraticVoting]
    end
    
    VS --> OV
    VS --> CRV
    VS --> ZKV
    VS --> QV
```

## Getting Started

### Prerequisites
- Node.js and Bun
- Ethereum development environment
- Understanding of smart contracts

### Installation
```bash
# Install dependencies
bun install

# Compile contracts
bun run compile

# Run tests
bun run test
```

### Deployment
```bash
# Deploy to local network
bun run deploy:local

# Deploy to testnet
bun run deploy:testnet

# Deploy to mainnet
bun run deploy:mainnet
```

## Usage Examples

### Creating a Hackathon
```typescript
const hackathonParams = {
    hackathonId: 1,
    startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    endTime: Math.floor(Date.now() / 1000) + 86400,   // 24 hours from now
    minimumSponsorContribution: parseEther("0.1"),
    stakeAmount: parseEther("0.01"),
    prizeDistribution: [parseEther("1"), parseEther("0.5"), parseEther("0.3")],
    selectedJudges: [judge1, judge2, judge3],
    votingConfig: {
        systemType: 0, // Open voting
        useQuadraticVoting: false,
        votingPowerPerJudge: 100,
        maxWinners: 3
    }
};

const tx = await hackathonFactory.createHackathon(
    ...Object.values(hackathonParams),
    { value: parseEther("2") } // Prize pool
);
```

### Participating in a Hackathon
```typescript
// Register for hackathon
await hackathon.register({ value: stakeAmount });

// Submit project
await hackathon.submitProject(
    "My Awesome Project",
    "https://github.com/user/project"
);

// Claim prize (if winning)
await hackathon.claimPrize();
```

### Sponsoring a Hackathon
```typescript
// Become sponsor with ETH
await hackathon.becomeSponsor({ value: parseEther("0.5") });

// Become sponsor with ERC20 token
await token.approve(hackathon.address, parseEther("100"));
await hackathon.becomeSponsorWithToken(token.address, parseEther("100"));

// Distribute prize
await hackathon.distributePrize(winnerAddress, parseEther("0.1"));
```

## Security Considerations

### Audit Recommendations
- All contracts should undergo professional security audits
- Test all voting systems thoroughly
- Validate judge selection mechanisms
- Review stake and prize distribution logic

### Best Practices
- Use multi-signature wallets for factory operations
- Implement proper access controls
- Regular security updates
- Monitor for unusual activity

## Contributing

We welcome contributions to the DeHack platform! Please see our contributing guidelines for more information.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki

---

**DeHack Platform** - Building the future of decentralized hackathons on Ethereum.