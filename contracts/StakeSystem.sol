// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title StakeSystem
 * @dev Handles stake management for hackathon participants
 * @notice This contract manages the stake system where participants must deposit funds
 */
contract StakeSystem {

    uint256 public stakeAmount;
    uint256 public totalStakes;

    mapping(address => uint256) public participantStakes;

    event StakeDeposited(
        address indexed participant,
        uint256 amount
    );

    event StakeReturned(
        address indexed participant,
        uint256 amount
    );


    /**
     * @notice Deposit stake for a participant
     * @dev Internal function to handle stake deposits and emit events
     * @param _participant Address of the participant depositing the stake
     */
    function _depositStake(
        address _participant
    )
        internal
    {
        require(
            msg.value == stakeAmount,
            "Must deposit exact stake amount"
        );

        participantStakes[_participant] = msg.value;
        totalStakes += msg.value;

        emit StakeDeposited(
            _participant,
            msg.value
        );
    }

    /**
     * @notice Return stake to a participant
     * @dev Internal function to return stake to participant and emit events
     * @param _participant Address of the participant to return stake to
     */
    function _returnStake(
        address _participant
    )
        internal
    {
        uint256 stake = participantStakes[
            _participant
        ];

        if (stake > 0) {
            participantStakes[_participant] = 0;
            totalStakes -= stake;

            payable(_participant).transfer(
                stake
            );

            emit StakeReturned(
                _participant,
                stake
            );
        }
    }

    /**
     * @notice Get the stake amount for a specific participant
     * @dev Returns the stake amount deposited by a participant
     * @param _participant Address of the participant to check
     * @return Stake amount deposited by the participant
     */
    function getParticipantStake(
        address _participant
    )
        external
        view
        returns (uint256)
    {
        return participantStakes[
            _participant
        ];
    }

    /**
     * @notice Get the total stakes collected from all participants
     * @dev Returns the sum of all stakes deposited by participants
     * @return Total amount of stakes collected
     */
    function getTotalStakes()
        external
        view
        returns (uint256)
    {
        return totalStakes;
    }

    /**
     * @notice Get the required stake amount for hackathon participation
     * @dev Returns the amount that participants must deposit when joining
     * @return Required stake amount for participation
     */
    function getStakeAmount()
        external
        view
        returns (uint256)
    {
        return stakeAmount;
    }
}
