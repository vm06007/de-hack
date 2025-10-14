// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Counter
 * @dev A simple counter contract that demonstrates basic Solidity functionality
 */
contract Counter {

    uint256 public count;

    event CountIncremented(
        uint256 _newCount
    );

    event CountDecremented(
        uint256 _newCount
    );

    event CountReset();

    /**
     * @dev Increment the counter by 1
     */
    function increment()
        public
    {
        count++;

        emit CountIncremented(
            count
        );
    }

    /**
     * @dev Decrement the counter by 1
     */
    function decrement()
        public
    {
        require(
            count > 0,
            "Counter cannot be negative!"
        );

        count--;

        emit CountDecremented(
            count
        );
    }

    /**
     * @dev Reset the counter to 0
     */
    function reset()
        public
    {
        count = 0;
        emit CountReset();
    }

    /**
     * @dev Get the current count value
     * @return The current count
     */
    function get()
        public
        view
        returns (uint256)
    {
        return count;
    }
}
