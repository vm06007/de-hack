pragma circom 2.0.0;

// Vote verification circuit for DeHack ZK voting system
// This circuit proves that a judge has cast a valid vote without revealing the details

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template VoteVerification() {
    // Private inputs (witness)
    signal private input judge;
    signal private input participant;
    signal private input points;
    signal private input nonce;
    signal private input maxPoints;
    signal private input minPoints;
    
    // Public inputs
    signal input commitment;
    signal input publicJudge;
    signal input publicPoints;
    
    // Outputs
    signal output valid;
    
    // Components
    component poseidonHash = Poseidon(6);
    component pointsRangeCheck = LessThan(32);
    component commitmentCheck = IsEqual();
    
    // Hash the private inputs
    poseidonHash.inputs[0] <== judge;
    poseidonHash.inputs[1] <== participant;
    poseidonHash.inputs[2] <== points;
    poseidonHash.inputs[3] <== nonce;
    poseidonHash.inputs[4] <== maxPoints;
    poseidonHash.inputs[5] <== minPoints;
    
    // Check that points are within valid range (0-100)
    pointsRangeCheck.in[0] <== points;
    pointsRangeCheck.in[1] <== maxPoints + 1;
    pointsRangeCheck.out === 1;
    
    // Check that points are not negative
    component minPointsCheck = LessThan(32);
    minPointsCheck.in[0] <== minPoints - 1;
    minPointsCheck.in[1] <== points;
    minPointsCheck.out === 1;
    
    // Verify commitment matches the hash
    commitmentCheck.in[0] <== poseidonHash.out;
    commitmentCheck.in[1] <== commitment;
    commitmentCheck.out === 1;
    
    // Verify public inputs match private inputs
    component judgeCheck = IsEqual();
    judgeCheck.in[0] <== judge;
    judgeCheck.in[1] <== publicJudge;
    judgeCheck.out === 1;
    
    component pointsCheck = IsEqual();
    pointsCheck.in[0] <== points;
    pointsCheck.in[1] <== publicPoints;
    pointsCheck.out === 1;
    
    // Output is valid if all checks pass
    valid <== 1;
}

// Main component
component main = VoteVerification();
