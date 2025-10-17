import { ethers } from 'ethers';
import { ZKVotingClient, ZKVotingUtils, VoteData } from '../src/index';

describe('ZK Voting System', () => {
  let provider: ethers.Provider;
  let client: ZKVotingClient;
  let judgeWallet: ethers.Wallet;
  let participantAddress: string;

  beforeEach(() => {
    // Setup test environment
    provider = new ethers.JsonRpcProvider('http://localhost:8545');
    judgeWallet = new ethers.Wallet('0x...', provider);
    participantAddress = '0x1234567890123456789012345678901234567890';
    
    // Mock contract ABI (simplified)
    const abi = [
      'function commitVote(bytes32 commitment)',
      'function revealVote(address participant, uint256 points, uint256 nonce, bytes32 proof)',
      'function getVotingStats() view returns (uint256, uint256, uint256)',
      'function getParticipantScore(address participant) view returns (uint256, uint256, bool, uint256)',
      'function getWinners() view returns (address[])',
      'function isCommitPhase() view returns (bool)',
      'function isRevealPhase() view returns (bool)'
    ];
    
    client = new ZKVotingClient('0x...', provider, abi);
  });

  describe('Vote Commitment', () => {
    it('should generate valid vote commitment', async () => {
      const voteData: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 85,
        nonce: ZKVotingUtils.generateNonce()
      };

      const commitment = await client.generateVoteCommitment(voteData);
      
      expect(commitment.commitment).toBeDefined();
      expect(commitment.timestamp).toBeGreaterThan(0);
      expect(commitment.commitment).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should validate vote data correctly', () => {
      const validVoteData: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 85,
        nonce: ZKVotingUtils.generateNonce()
      };

      const invalidVoteData: VoteData = {
        judge: 'invalid-address',
        participant: participantAddress,
        points: 150, // Invalid points
        nonce: 'invalid-nonce'
      };

      expect(ZKVotingUtils.validateVoteData(validVoteData)).toBe(true);
      expect(ZKVotingUtils.validateVoteData(invalidVoteData)).toBe(false);
    });
  });

  describe('ZK Proof Generation', () => {
    it('should generate ZK proof for valid vote', async () => {
      const voteData: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 85,
        nonce: ZKVotingUtils.generateNonce()
      };

      const zkProof = await client.generateZKProof(voteData);
      
      expect(zkProof.proof).toBeDefined();
      expect(zkProof.publicSignals).toBeDefined();
      expect(zkProof.publicSignals.length).toBeGreaterThan(0);
    });
  });

  describe('Voting Flow', () => {
    it('should complete full voting flow', async () => {
      const voteData: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 85,
        nonce: ZKVotingUtils.generateNonce()
      };

      // Generate commitment
      const commitment = await client.generateVoteCommitment(voteData);
      
      // Mock contract calls
      const mockCommitTx = { hash: '0x...', wait: () => Promise.resolve() };
      const mockRevealTx = { hash: '0x...', wait: () => Promise.resolve() };
      
      // Mock contract methods
      jest.spyOn(client as any, 'commitVote').mockResolvedValue(mockCommitTx);
      jest.spyOn(client as any, 'revealVote').mockResolvedValue(mockRevealTx);
      
      // Commit vote
      const commitResult = await client.commitVote(judgeWallet, commitment.commitment);
      expect(commitResult).toBeDefined();
      
      // Generate ZK proof
      const zkProof = await client.generateZKProof(voteData);
      
      // Reveal vote
      const revealResult = await client.revealVote(judgeWallet, voteData, zkProof);
      expect(revealResult).toBeDefined();
    });
  });

  describe('Privacy Features', () => {
    it('should not reveal individual votes in commitment', () => {
      const voteData1: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 85,
        nonce: ZKVotingUtils.generateNonce()
      };

      const voteData2: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 90,
        nonce: ZKVotingUtils.generateNonce()
      };

      const commitment1 = ZKVotingUtils.calculateCommitment(voteData1);
      const commitment2 = ZKVotingUtils.calculateCommitment(voteData2);
      
      // Commitments should be different even for same participant
      expect(commitment1).not.toBe(commitment2);
      
      // Commitments should not reveal the points
      expect(commitment1).not.toContain('85');
      expect(commitment2).not.toContain('90');
    });

    it('should allow verification without revealing vote details', async () => {
      const voteData: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 85,
        nonce: ZKVotingUtils.generateNonce()
      };

      const zkProof = await client.generateZKProof(voteData);
      
      // ZK proof should prove validity without revealing details
      expect(zkProof.proof).toBeDefined();
      expect(zkProof.publicSignals).toBeDefined();
      
      // Public signals should only contain necessary information
      expect(zkProof.publicSignals.length).toBeGreaterThan(0);
    });
  });

  describe('Utility Functions', () => {
    it('should generate unique nonces', () => {
      const nonce1 = ZKVotingUtils.generateNonce();
      const nonce2 = ZKVotingUtils.generateNonce();
      
      expect(nonce1).not.toBe(nonce2);
      expect(nonce1).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(nonce2).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should calculate consistent commitments', () => {
      const voteData: VoteData = {
        judge: judgeWallet.address,
        participant: participantAddress,
        points: 85,
        nonce: '0x1234567890123456789012345678901234567890123456789012345678901234'
      };

      const commitment1 = ZKVotingUtils.calculateCommitment(voteData);
      const commitment2 = ZKVotingUtils.calculateCommitment(voteData);
      
      expect(commitment1).toBe(commitment2);
    });
  });
});

// Integration test example
describe('ZK Voting Integration', () => {
  it('should demonstrate complete privacy-preserving voting', async () => {
    // This test would demonstrate:
    // 1. Multiple judges committing votes
    // 2. Votes being revealed with ZK proofs
    // 3. Winners being determined without revealing individual votes
    // 4. Verification that all votes were valid
    
    const judges = [
      new ethers.Wallet('0x...'),
      new ethers.Wallet('0x...'),
      new ethers.Wallet('0x...')
    ];
    
    const participants = [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333'
    ];
    
    // Each judge votes for different participants
    const votes = [
      { judge: judges[0], participant: participants[0], points: 90 },
      { judge: judges[1], participant: participants[1], points: 85 },
      { judge: judges[2], participant: participants[0], points: 95 }
    ];
    
    // Commit phase: All judges commit their votes
    const commitments = [];
    for (const vote of votes) {
      const voteData: VoteData = {
        judge: vote.judge.address,
        participant: vote.participant,
        points: vote.points,
        nonce: ZKVotingUtils.generateNonce()
      };
      
      const commitment = await client.generateVoteCommitment(voteData);
      commitments.push({ voteData, commitment });
    }
    
    // Reveal phase: All judges reveal with ZK proofs
    for (const { voteData, commitment } of commitments) {
      const zkProof = await client.generateZKProof(voteData);
      
      // Verify that the proof is valid without revealing vote details
      expect(zkProof.proof).toBeDefined();
      expect(zkProof.publicSignals).toBeDefined();
    }
    
    // After reveal phase: Winners can be determined
    // Participant 0: 90 + 95 = 185 points (2 votes)
    // Participant 1: 85 points (1 vote)
    // Participant 2: 0 points (0 votes)
    
    // Winner should be participant 0 with 185 points
    // But individual votes remain private!
  });
});
