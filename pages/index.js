import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [investmentGoal, setInvestmentGoal] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [targetDate, setTargetDate] = useState("");
  const [monthlySavings, setMonthlySavings] = useState(0);

  const [investmentType, setInvestmentType] = useState("Equity Funds");
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timePeriod, setTimePeriod] = useState(0);
  const [desiredInterest, setDesiredInterest] = useState(0);
  const [calculatedReturn, setCalculatedReturn] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      const wallet = window.ethereum;
      setEthWallet(wallet);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const sendDummyTransaction = async (message) => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const transaction = {
      to: account,
      value: ethers.utils.parseEther("0.001"), // Dummy value
      data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message)),
    };

    try {
      await signer.sendTransaction(transaction);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const calculateMonthlySavings = async () => {
    if (!targetDate || investmentGoal <= 0 || currentBalance < 0) {
      alert("Please fill out all fields correctly.");
      return;
    }

    const targetDateObj = new Date(targetDate);
    const currentDate = new Date();

    if (targetDateObj <= currentDate) {
      alert("The target date must be in the future.");
      return;
    }

    const timeDifference = targetDateObj - currentDate;
    const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30.44)); // Average days in a month

    const savingsNeeded = (investmentGoal - currentBalance) / months;

    setMonthlySavings(savingsNeeded);

    await sendDummyTransaction(`Monthly savings: ${savingsNeeded.toFixed(2)} ETH`);
  };

  const calculateReturn = async () => {
    let rate = 0;

    switch (investmentType) {
      case "Equity Funds":
        rate = 13; // Fixed 13% for equity funds
        break;
      case "Mutual Funds":
        rate = 13; // Fixed 13% for mutual funds
        break;
      case "Stocks":
        rate = desiredInterest; // User-provided rate
        break;
      case "Gold":
        rate = desiredInterest; // User-provided rate
        break;
      default:
        alert("Invalid investment type");
        return;
    }

    let totalReturn = 0;

    if (investmentType === "Mutual Funds") {
      totalReturn = investmentAmount * Math.pow((1 + rate / 100 / 12), duration);
    } else {
      totalReturn = investmentAmount * Math.pow((1 + rate / 100), timePeriod);
    }

    setCalculatedReturn(totalReturn);

    await sendDummyTransaction(`Investment return: ${totalReturn.toFixed(2)} ETH`);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>

        {/* Investment Planner */}
        <div className="investment-planner">
          <h2>Investment Planner</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateMonthlySavings();
            }}
          >
            <label>
              Target Investment Goal (ETH):
              <input
                type="number"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(e.target.value)}
              />
            </label>
            <br />
            <label>
              Current Balance (ETH):
              <input
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
              />
            </label>
            <br />
            <label>
              Target Date:
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </label>
            <br />
            <button type="submit">Calculate Monthly Savings</button>
          </form>
          {monthlySavings > 0 && (
            <p>
              You need to save approximately {monthlySavings.toFixed(2)} ETH per month to reach your goal by {targetDate}.
            </p>
          )}
        </div>

        {/* Investment Return Calculator */}
        <div className="investment-return-calculator">
          <h2>Investment Return Calculator</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateReturn();
            }}
          >
            <label>
              Investment Type:
              <select
                value={investmentType}
                onChange={(e) => setInvestmentType(e.target.value)}
              >
                <option value="Equity Funds">Equity Funds</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="Stocks">Stocks</option>
                <option value="Gold">Gold</option>
              </select>
            </label>
            <br />
            <label>
              Investment Amount (ETH):
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
              />
            </label>
            <br />
            {investmentType === "Mutual Funds" ? (
              <label>
                Duration (months):
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </label>
            ) : (
              <label>
                Time Period (years):
                <input
                  type="number"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                />
              </label>
            )}
            <br />
            {(investmentType === "Stocks" || investmentType === "Gold") && (
              <label>
                Desired Interest Rate (%):
                <input
                  type="number"
                  value={desiredInterest}
                  onChange={(e) => setDesiredInterest(e.target.value)}
                />
              </label>
            )}
            <br />
            <button type="submit">Calculate Return</button>
          </form>
          {calculatedReturn > 0 && (
            <p>Your investment return will be approximately {calculatedReturn.toFixed(2)} ETH.</p>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        .investment-planner,
        .investment-return-calculator {
          margin-top: 20px;
        }
        .investment-planner label,
        .investment-return-calculator label {
          display: block;
          margin: 10px 0;
        }
      `}</style>
    </main>
  );
}
