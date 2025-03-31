import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ethers } from "ethers";
const tokenContracts = 
{

  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  META: "0xd312f1C56bfe9be58a36C4747a945FC699a9C079"
};

let Step3 = ({ sharedState, updateSharedState, onBack }) => 
{
  const [transactionState, setTransactionState] = useState('idle');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [downloadLink, setDownloadLink] = useState("");

  const loadingMessages = [
    "Convincing miners to include our transaction... 🎮",
    "Teaching gas fees to behave... 🎓",
    "Waiting for consensus like waiting for everyone to agree on pizza toppings... 🍕",
    "Proof of Wait in progress... ⏳",
    "Blockchain is doing its blockchain things... ⛓️",
    "Your transaction is stuck in traffic on the Ethereum highway... 🚗",
    "Mining some patience... ⛏️",
    "Bribing the validators with extra gas... ⛽",
    "Smart contract is being smart... 🧠",
    "Web3 magic in progress... ✨",
    "Converting coffee to transactions... ☕",
    "Negotiating with network congestion... 🤝",
    "Asking Vitalik for a speed boost... 🏃",
    "Doing fancy cryptographic stuff... 🔐",
    "Your tokens are practicing social distancing... 😷"
  ];

  const confirmationMessages = [
    "Almost there! The blockchain is doing its final checks... 🔍",
    "Just a few more blocks to go... 🏗️",
    "Validators are validating... ✅",
    "The transaction is getting cozy in the blockchain... 🏠",
    "Finalizing your transaction with extra care... 🎯",
    "Adding your transaction to blockchain history... 📚",
    "Making sure everything is cryptographically sound... 🔐",
    "Your transaction is getting its final stamps of approval... 📝",
    "The blockchain nodes are nodding in agreement... 👥",
    "Getting those last confirmations... ⭐"
  ];

  useEffect(() => {
    if (transactionState === 'processing' || transactionState === 'approving') {
      const interval = setInterval(() => {
        const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        setLoadingMessage(randomMessage);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [transactionState]);

  const generateCSV = () => {
    const headers = ["Recipient", "Amount", "Token"];
    const rows = sharedState.addresses.map((address, index) => {
      return [
        address,
        ethers.utils.formatUnits(sharedState.amounts[index], 18),
        sharedState.selectedToken
      ];
    });

    const transactionInfo = [
      `Transaction Hash: ${sharedState.txHash}`,
      `Sender Address: ${sharedState.walletAddress}`,
      `Network: ${sharedState.network?.name || 'Unknown'}`,
      `Total Recipients: ${sharedState.addresses.length}`,
      `Token: ${sharedState.selectedToken}`,
      '',  
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([transactionInfo], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    setDownloadLink(url);
  };

  const handleSend = async () => {
    try {
      setTransactionState('approving');
      setLoadingMessage(loadingMessages[0]);

      if (sharedState.selectedToken !== "ETH" && !sharedState.approved_i) {
        const tokenContract = new ethers.Contract(
          sharedState.tokenAddress,
          ["function approve(address spender, uint256 amount) public returns (bool)"],
          sharedState.signer
        );

        const tx = await tokenContract.approve(
          sharedState.CONTRACT_ADDRESS,
          ethers.constants.MaxUint256
        );
        await tx.wait();
        updateSharedState({ approved_i: true });
      }

      setTransactionState('processing');
      
      const totalAmount = sharedState.amounts.reduce(
        (sum, amount) => sum.add(ethers.BigNumber.from(amount)),
        ethers.BigNumber.from(0)
      );

      let tx;
      if (sharedState.selectedToken === "ETH") {
        tx = await sharedState.contract.batchSendETH(
          sharedState.addresses,
          sharedState.amounts,
          { value: totalAmount }
        );
      } else {
        let tokenAddress = sharedState.selectedToken === "CUSTOM" ? sharedState.customTokenAddress : tokenContracts[sharedState.selectedToken]
        
        tx = await sharedState.contract.batchSendERC20(
          tokenAddress,
          sharedState.addresses,
          sharedState.amounts
        );
      }

      updateSharedState({ txHash: tx.hash });
      setTransactionState('confirming');
      await tx.wait();
      generateCSV();
      setTransactionState('success');

    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionState('error');
      updateSharedState({ errorMessage: error.message });
    }
  };

  const renderContent = () => {
    switch (transactionState) {
      case 'idle':
        return (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-gray-200">Ready to Send</h3>
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                You&apos;re about to send tokens to {sharedState.addresses.length} addresses
              </p>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Token:</span>
                <span>{sharedState.selectedToken}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Total Recipients:</span>
                <span>{sharedState.addresses.length}</span>
              </div>
            </div>
          </div>
        );
      
      case 'approving':
        return (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-yellow-400">Approving Transaction</h3>
            <div className="animate-pulse">
              <p className="text-gray-300">{loadingMessage}</p>
            </div>
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        );
      
      case 'processing':
        return (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-yellow-400">Processing Transaction</h3>
            <div className="animate-pulse">
              <p className="text-gray-300">{loadingMessage}</p>
            </div>
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        );
      
      case 'confirming':
        return (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-yellow-400">Confirming Transaction</h3>
            <div className="animate-pulse">
              <p className="text-gray-300">
                {confirmationMessages[Math.floor(Math.random() * confirmationMessages.length)]}
              </p>
            </div>
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-green-400">Transaction Successful! 🎉</h3>
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Transaction Hash:</span>
                  <a
                    href={`https://${sharedState.network?.name === 'sepolia' ? 'sepolia.' : ''}etherscan.io/tx/${sharedState.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    View on Etherscan ↗
                  </a>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Recipients:</span>
                  <span className="text-white">{sharedState.addresses.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Token:</span>
                  <span className="text-white">{sharedState.selectedToken}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">{sharedState.network?.name || 'Unknown'}</span>
                </div>
              </div>
              
              {downloadLink && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <a
                    href={downloadLink}
                    download="transaction_receipt.csv"
                    className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <span>Download Transaction Receipt</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-red-400">Transaction Failed</h3>
            <div className="bg-red-400/10 rounded-lg p-6">
              <p className="text-gray-300">
                {sharedState.errorMessage || "Something went wrong. Please try again."}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {renderContent()}
      
      <div className="flex justify-between gap-4">
        <button
          onClick={onBack}
          disabled={transactionState === 'processing' || transactionState === 'approving'}
          className="flex-1 bg-transparent text-white border-2 border-yellow-400 py-3 px-4 text-base font-medium rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-300 disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Back
        </button>
        
        {transactionState === 'idle' && (
          <button
            onClick={handleSend}
            className="flex-1 bg-yellow-400 text-black py-3 px-4 text-base font-medium rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-400/30"
          >
            Send Tokens
          </button>
        )}
        
        {transactionState === 'success' && (
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-green-400 text-black py-3 px-4 text-base font-medium rounded-lg hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-green-400/30"
          >
            Start New Transfer
          </button>
        )}
      </div>
    </div>
  );
};

Step3.propTypes = {
  sharedState: PropTypes.object.isRequired,
  updateSharedState: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

export default Step3;
