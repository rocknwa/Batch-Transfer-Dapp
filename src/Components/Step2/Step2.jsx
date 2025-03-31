import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ethers } from "ethers";

const tokenContracts = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  META: "0xd312f1C56bfe9be58a36C4747a945FC699a9C079"
};

let Step2 = ({ sharedState, updateSharedState, onNext, onBack }) => {
  let [totalAmount, setTotalAmount] = useState("0");
  let [sufficientBalance, setSufficientBalance] = useState(true);
  let [isLoading, setIsLoading] = useState(false);

  let approve_func = async()=>
  {
    try 
    {
      setIsLoading(true);
      let contract = sharedState.contract;
      if (sharedState.selectedToken != "ETH") 
      {
        let tokenAddress = sharedState.selectedToken === "CUSTOM" ? sharedState.customTokenAddress : tokenContracts[sharedState.selectedToken];
        let tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function safeApprove(address spender, uint256 amount) external;"
          ],
          sharedState.signer
        );
        let decimals = await tokenContract.decimals();

        // Adjust amounts to the correct decimals
        let adjustedAmounts = await Promise.all(sharedState.amounts.map(async (amount) => {return adjustAmountDecimals(amount, 18, decimals);}));

        let totalAmount = adjustedAmounts.reduce((acc, amount) => acc.add(amount),ethers.BigNumber.from(0));

        let resetTx = await tokenContract.approve(sharedState.CONTRACT_ADDRESS, 0);
        await resetTx.wait();
  
        let resetTx1 = await tokenContract.approve(sharedState.CONTRACT_ADDRESS, totalAmount);
        await resetTx1.wait();
        let estimatedGas = await contract.estimateGas.batchSendERC20(
          tokenAddress,
          sharedState.addresses,
          adjustedAmounts,
          { gasLimit: 210000 }
        );
        updateSharedState({ estimatedGas: estimatedGas.toString() });
        setIsLoading(false);
        updateSharedState({approved_i: true});
      }   

    } 
    catch (error) 
    {
      console.error("Gas estimation error:", error);
      setIsLoading(false);
    }
  }

  // Function to adjust amounts based on decimals
  let adjustAmountDecimals = async (amount, fromDecimals, toDecimals) => {
    // Convert to a regular number string with fromDecimals
    let normalizedAmount = ethers.utils.formatUnits(amount, fromDecimals);
    // Parse back with correct decimals
    return ethers.utils.parseUnits(normalizedAmount, toDecimals);
  };

  useEffect(() => {
    let total = sharedState.amounts.reduce(
      (acc, amount) => acc.add(amount),
      ethers.BigNumber.from(0)
    );

    // Format total based on the selected token's decimals
    let decimals = sharedState.selectedToken === "CUSTOM" 
      ? (sharedState.custom_token_decimals || 18)
      : (sharedState.token_decimals || 18);

    let Total_ = ethers.utils.formatUnits(total, decimals);
    setTotalAmount(Total_);
    updateSharedState({totalAmount: Total_ });

    let Balance_ = 0;
    if(sharedState.selectedToken === "CUSTOM") {
      Balance_ = parseFloat(sharedState.custom_token_balance);
    } else if(sharedState.selectedToken === "ETH") {
      Balance_ = parseFloat(sharedState.ethBalance);
    } else {
      Balance_ = parseFloat(sharedState.token_balance);
    }
    
    let totalValue = parseFloat(Total_);
    setSufficientBalance(Balance_ >= totalValue);
  }, [sharedState.amounts, sharedState.ethBalance]);

  let calculateGas = async () => 
  {
    try 
    {
      let contract = sharedState.contract;
      
      if (sharedState.selectedToken === "ETH") 
      {
          let totalValue = sharedState.amounts.reduce((acc, amount) => acc.add(amount),ethers.BigNumber.from(0));
          let estimatedGas = await contract.estimateGas.batchSendETH(sharedState.addresses,sharedState.amounts,{ value: totalValue},);
          updateSharedState({ estimatedGas: estimatedGas.toString() });
      }  
      
    } 
    catch (error) 
    {
      console.error("Gas estimation error:", error);
    }
  };

  let handleRemoveRecipient = (index) => {
    let updatedAddresses = [...sharedState.addresses];
    let updatedAmounts = [...sharedState.amounts];
    updatedAddresses.splice(index, 1);
    updatedAmounts.splice(index, 1);

    updateSharedState({
      addresses: updatedAddresses,
      amounts: updatedAmounts,
    });
  };

  useEffect(() => {
    calculateGas();
  }, [sharedState.addresses, sharedState.amounts, sharedState.selectedToken,sharedState.CONTRACT_ADDRESS]);

  let formatDisplayAmount = (amount) => {
    let decimals = sharedState.selectedToken === "CUSTOM" 
      ? (sharedState.custom_token_decimals || 18)
      : (sharedState.token_decimals || 18);
    return ethers.utils.formatUnits(amount, decimals);
  };

  useEffect(() => {
    if (sharedState.selectedToken === "ETH") {
      updateSharedState({ approved_i: true });
    } else {
      updateSharedState({ approved_i: false });
    }
  }, [sharedState.selectedToken]);

  useEffect(() => {
    let Total_ = sharedState.amounts.reduce((acc, amount) => acc + parseFloat(ethers.utils.formatUnits(amount, 18)), 0);
    
    let Balance_ = 0;
    if(sharedState.selectedToken === "CUSTOM") {
      Balance_ = parseFloat(sharedState.custom_token_balance);
    } else if(sharedState.selectedToken === "ETH") {
      Balance_ = parseFloat(sharedState.ethBalance);
    } else {
      Balance_ = parseFloat(sharedState.token_balance);
    }
    
    let totalValue = parseFloat(Total_);
    setSufficientBalance(Balance_ >= totalValue);
  }, [
    sharedState.amounts,
    sharedState.ethBalance,
    sharedState.token_balance,
    sharedState.custom_token_balance,
    sharedState.selectedToken
  ]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mb-5 border-2 border-gray-700 rounded-lg overflow-hidden animate-fadeIn">
          <thead>
            <tr>
              <th className="bg-gray-700 text-gray-100 p-2.5 text-left text-base border border-gray-600">Recipient Address</th>
              <th className="bg-gray-700 text-gray-100 p-2.5 text-left text-base border border-gray-600">Amount ({sharedState.selectedToken === "CUSTOM" ? sharedState.custom_token_symbol : sharedState.selectedToken})</th>
              <th className="bg-gray-700 text-gray-100 p-2.5 text-left text-base border border-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {sharedState.addresses.map((recipient, index) => (
              <tr key={index} className="hover:bg-gray-600 transition-colors duration-200 animate-fadeInRow even:bg-gray-800">
                <td className="border border-gray-600 p-2.5 text-left text-base">{recipient.slice(0, 6)}.....{recipient.slice(-6)}</td>
                <td className="border border-gray-600 p-2.5 text-left text-base">{formatDisplayAmount(sharedState.amounts[index])}</td>
                <td className="border border-gray-600 p-2.5 text-left text-base">
                  <button
                    onClick={() => handleRemoveRecipient(index)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition-all duration-300 transform hover:scale-110"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sharedState.selectedToken != "ETH" && 
      <button className="bg-transparent text-white border border-yellow-400 py-2.5 px-5 text-base cursor-pointer rounded hover:bg-yellow-400 hover:text-black transition-all duration-300" onClick={approve_func} disabled={isLoading}>Approve</button>}
      {isLoading && <p className="text-red-500 mt-5">Approving...</p>}
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold text-gray-300 mt-5 mb-4">Transaction Summary</h2>
        <table className="w-full border-collapse mb-5 border-2 border-gray-700 rounded-lg overflow-hidden animate-fadeIn">
          <tbody>
            <tr className="hover:bg-gray-600 transition-colors duration-200">
              <td className="border border-gray-600 p-2.5 text-left text-base">Total number of addresses:</td>
              <td className="border border-gray-600 p-2.5 text-left text-base">{sharedState.addresses.length}</td>
            </tr>
            <tr className="hover:bg-gray-600 transition-colors duration-200 bg-gray-800">
              <td className="border border-gray-600 p-2.5 text-left text-base">Total number of tokens to be sent:</td>
              <td className="border border-gray-600 p-2.5 text-left text-base">{totalAmount} {sharedState.selectedToken === "CUSTOM" ? sharedState.custom_token_symbol : sharedState.selectedToken}</td>
            </tr>
            <tr className="hover:bg-gray-600 transition-colors duration-200">
              <td className="border border-gray-600 p-2.5 text-left text-base">Total number of transactions needed:</td>
              <td className="border border-gray-600 p-2.5 text-left text-base">1</td>
            </tr>
            <tr className="hover:bg-gray-600 transition-colors duration-200 bg-gray-800">
              <td className="border border-gray-600 p-2.5 text-left text-base">Your token balance:</td>
              <td className="border border-gray-600 p-2.5 text-left text-base">
                {sharedState.selectedToken === "ETH" && `${sharedState.ethBalance} `}
                {sharedState.selectedToken !== "ETH" && sharedState.selectedToken !== "CUSTOM" && `${sharedState.token_balance} ${sharedState.selectedToken}`}
                {sharedState.selectedToken === "CUSTOM" && `${sharedState.custom_token_balance} ${sharedState.custom_token_symbol}`}
              </td>
            </tr>
            <tr className="hover:bg-gray-600 transition-colors duration-200">
              <td className="border border-gray-600 p-2.5 text-left text-base">Approximate cost of operation:</td>
              <td className="border border-gray-600 p-2.5 text-left text-base">{sharedState.estimatedGas} Wei</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-transparent text-white border border-yellow-400 py-2.5 px-5 text-base cursor-pointer rounded hover:bg-yellow-400 hover:text-black transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!(sharedState.approved_i  &&  sufficientBalance)}
            className="flex-1 bg-transparent text-white border border-yellow-400 py-2.5 px-5 text-base cursor-pointer rounded hover:bg-yellow-400 hover:text-black transition-all duration-300 disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Next: Send
          </button>
        </div>
        
        {!sufficientBalance && (
          <div className="text-red-500 mt-5">Insufficient balance. Please check your token balance.</div>
        )}
      </div>
    </div>
  );
};

Step2.propTypes = {
  sharedState: PropTypes.object.isRequired,
  updateSharedState: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

export default Step2;
