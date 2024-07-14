// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function calculateMonthlySavings(uint256 investmentGoal, uint256 currentBalance, uint256 months) public pure returns (uint256) {
        require(months > 0, "The number of months must be greater than zero");
        require(investmentGoal > currentBalance, "Investment goal must be greater than current balance");
        uint256 savingsNeeded = (investmentGoal - currentBalance) / months;
        return savingsNeeded;
    }

    function calculateReturn(string memory investmentType, uint256 investmentAmount, uint256 duration, uint256 timePeriod, uint256 desiredInterest) public pure returns (uint256) {
        uint256 rate = 0;

        if (keccak256(abi.encodePacked((investmentType))) == keccak256(abi.encodePacked(("Equity Funds")))) {
            rate = 13;
        } else if (keccak256(abi.encodePacked((investmentType))) == keccak256(abi.encodePacked(("Mutual Funds")))) {
            rate = 13;
        } else if (keccak256(abi.encodePacked((investmentType))) == keccak256(abi.encodePacked(("Stocks")))) {
            rate = desiredInterest;
        } else if (keccak256(abi.encodePacked((investmentType))) == keccak256(abi.encodePacked(("Gold")))) {
            rate = desiredInterest;
        } else {
            revert("Invalid investment type");
        }

        uint256 totalReturn = 0;

        if (keccak256(abi.encodePacked((investmentType))) == keccak256(abi.encodePacked(("Mutual Funds")))) {
            totalReturn = investmentAmount * (1 + rate / 100 / 12) ** duration;
        } else {
            totalReturn = investmentAmount * (1 + rate / 100) ** timePeriod;
        }

        return totalReturn;
    }
}
