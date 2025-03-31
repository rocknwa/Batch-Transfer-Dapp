import { useEffect } from "react";
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

const CONTRACT_ABI = 
[
  "function batchSendETH(address[] calldata recipients, uint256[] calldata amounts) external payable",
  "function batchSendERC20(address token, address[] calldata recipients, uint256[] calldata amounts) external",
];

const Step1 = ({ sharedState, updateSharedState, onNext }) => {
  const connectToMetaMask = async () => {
    if (window.ethereum) 
    {
      try 
      {
        let accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let signer = provider.getSigner();
        let network = await provider.getNetwork();
        let contract = new ethers.Contract(sharedState.CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        let balance = await signer.getBalance();

        updateSharedState({
          walletAddress: accounts[0],
          provider: provider,
          signer: signer,
          contract: contract,
          ethBalance: ethers.utils.formatEther(balance) + " ETH",
          network: network
        });

      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      console.error("Metamask not detected");
      updateSharedState({ errorMessage: "Metamask not detected" });
    }
  };

  useEffect(() => 
  {
    connectToMetaMask();
  }, []);

  useEffect(() => 
  {
    updateSharedState({
      addresses: [],
      amounts: [],
      errorMessage: ''
    });
  }, []);

  useEffect(() =>
  {
    if (sharedState.CONTRACT_ADDRESS) 
    {
      connectToMetaMask();  // Only call after CONTRACT_ADDRESS has been updated
    }
  }, [sharedState.CONTRACT_ADDRESS]);  // Dependency on CONTRACT_ADDRESS
  
  const handleCustomTokenChange = async (event) => {

      updateSharedState({approved_i:false});
    let tokenAddress = event.target.value;
    updateSharedState({ customTokenAddress: tokenAddress });

    if (!ethers.utils.isAddress(tokenAddress)) {
      updateSharedState({ errorMessage: "Invalid token address" });
      return;
    }

    try 
    {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let contract = new ethers.Contract(tokenAddress, [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)" // Add the decimals function
    ], provider);

      let symbol = await contract.symbol();
      let balance = await contract.balanceOf(sharedState.walletAddress);
      let decimals = await contract.decimals(); // Get the decimal value for the token

      let formattedBalance = ethers.utils.formatUnits(balance, decimals);
      updateSharedState({ custom_token_balance: formattedBalance });
      updateSharedState({ custom_token_symbol: symbol });
      updateSharedState({ errorMessage:""})
    } catch (error) {
      console.error("Error fetching custom token details:", error);
      updateSharedState({ errorMessage: "Error fetching custom token details: " + error.message });
    }
  };



  const handleTokenChange = async (i) => 
  {
    if(i !="ETH")
    {
      updateSharedState({approved_i:false});
    }
    if(i != "CUSTOM" &&  i != "ETH"  )
    {
      try 
      {
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let contract = new ethers.Contract(tokenContracts[i], [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)" // Add the decimals function
        ], provider);
        
        // Fetch token detail
        let balance = await contract.balanceOf(sharedState.walletAddress);
        let decimals = await contract.decimals(); // Get the decimal value for the token
        let formattedBalance = ethers.utils.formatUnits(balance, decimals);
        updateSharedState({ token_balance: formattedBalance });
        
      } 
      catch (error) 
      {
        console.error("Error fetching  token details:", error);
        updateSharedState({ errorMessage: "Error fetching token details: " + error.message });
      }
    }
  };


  const handleInputChange = (e) => {
    const input = e.target.value;
    const lines = input.split('\n').filter(line => line.trim());
    const addresses = [];
    const amounts = [];
    let hasError = false;

    lines.forEach(line => {
      const [address, amount] = line.split(',').map(item => item.trim());
      
      if (!address || !amount) {
        hasError = true;
        updateSharedState({ 
          errorMessage: 'Invalid format. Please use: address, amount',
          addresses: [],
          amounts: []
        });
        return;
      }

      if (!ethers.utils.isAddress(address)) {
        hasError = true;
        updateSharedState({ 
          errorMessage: `Invalid Ethereum address: ${address}`,
          addresses: [],
          amounts: []
        });
        return;
      }

      try {
        const parsedAmount = ethers.utils.parseUnits(amount, 18);
        if (parsedAmount.lte(0)) {
          throw new Error('Amount must be greater than 0');
        }
        addresses.push(address);
        amounts.push(parsedAmount.toString());
      } catch (error) {
        hasError = true;
        updateSharedState({ 
          errorMessage: `Invalid amount: ${amount}. Error: ${error.message}`,
          addresses: [],
          amounts: []
        });
        return;
      }
    });

    if (!hasError) {
      updateSharedState({
        addresses,
        amounts,
        errorMessage: ''
      });
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n').filter(line => line.trim());
      const addresses = [];
      const amounts = [];
      let hasError = false;

      lines.forEach((line, index) => {
        const [address, amount] = line.split(',').map(item => item.trim());

        if (!address || !amount) {
          hasError = true;
          updateSharedState({ 
            errorMessage: `Invalid format at line ${index + 1}. Please use: address, amount`,
            addresses: [],
            amounts: []
          });
          return;
        }

        if (!ethers.utils.isAddress(address)) {
          hasError = true;
          updateSharedState({ 
            errorMessage: `Invalid Ethereum address at line ${index + 1}: ${address}`,
            addresses: [],
            amounts: []
          });
          return;
        }

        try {
          const parsedAmount = ethers.utils.parseUnits(amount, 18);
          if (parsedAmount.lte(0)) {
            throw new Error('Amount must be greater than 0');
          }
          addresses.push(address);
          amounts.push(parsedAmount.toString());
        } catch (error) {
          hasError = true;
          updateSharedState({ 
            errorMessage: `Invalid amount at line ${index + 1}: ${amount}. Error: ${error.message}`,
            addresses: [],
            amounts: []
          });
          return;
        }
      });

      if (!hasError) {
        updateSharedState({
          addresses,
          amounts,
          errorMessage: ''
        });
        // Reset file input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full">
      <h3 className="text-left">Connect Wallet</h3>
      <button
        onClick={connectToMetaMask}
        disabled={sharedState.walletAddress}
        className="w-full bg-transparent text-white border border-yellow-400 py-2.5 px-5 text-base cursor-pointer rounded hover:bg-yellow-400 hover:text-black transition-all duration-300 disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed mb-2.5"
      >
        {sharedState.walletAddress
          ? `Connected: ${sharedState.walletAddress.slice(0, 6)}...${sharedState.walletAddress.slice(-4)}`
          : "Connect Wallet"}
      </button>

      <h3 className="text-left">Select Network</h3>
      <select
  value={sharedState.CONTRACT_ADDRESS}
  onChange={(e) => {
    updateSharedState({ CONTRACT_ADDRESS: e.target.value })
  }}
  className="w-full py-2.5 px-2.5 text-sm my-2.5 border border-gray-300 rounded bg-gray-100 text-black transition-all duration-200 focus:border-yellow-400 focus:outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] bg-[length:12px]"
      >
        <option value="0x41c108bba45ffc0ceee17a1dabaddd738bd3ab43">Ethereum Sepolia Testnet</option>
</select>

      <h3 className="text-left">Select Token</h3>
      <select 
        value={sharedState.selectedToken} 
        onChange={(e) => 
          {
            updateSharedState({ selectedToken: e.target.value })
            handleTokenChange(e.target.value)   
          }}
        className="w-full py-2.5 px-2.5 text-sm my-2.5 border border-gray-300 rounded bg-gray-100 text-black transition-all duration-200 focus:border-yellow-400 focus:outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] bg-[length:12px]"
      >
       <option value="ETH">Sepolia ETH</option>
       <option value="META">Sepoila META</option>
        <option value="CUSTOM">Custom Token</option>
      </select>

      {sharedState.selectedToken === "CUSTOM" && (
        <div>
          <input 
            type="text" 
            placeholder="Enter custom token address" 
            value={sharedState.customTokenAddress} 
            onChange={handleCustomTokenChange} 
            className="w-full py-2.5 px-2.5 text-sm my-2.5 border border-gray-300 rounded bg-gray-100 text-black transition-all duration-200 focus:border-yellow-400 focus:outline-none placeholder:text-gray-600"
          />
        </div>
      )}
      <textarea 
        rows={10} 
        cols={50} 
        placeholder="Enter addresses and amounts (e.g., 0x123...,1.0)" 
        onChange={handleInputChange}
        className="w-full min-h-[150px] py-2.5 px-2.5 text-sm my-2.5 border border-gray-300 rounded bg-gray-100 text-black font-mono resize-y transition-all duration-200 focus:border-yellow-400 focus:outline-none placeholder:text-gray-600"
      />
      <input type="file" accept=".csv" onChange={handleCSVUpload} className="w-full py-2.5 px-2.5 my-2.5 border border-dashed border-gray-300 rounded bg-transparent text-gray-400 cursor-pointer transition-all duration-200 hover:border-yellow-400" />
      {sharedState.errorMessage && (
        <div className="text-red-500 mt-5">{sharedState.errorMessage}</div>
      )}
      
      <button 
        onClick={onNext} 
        disabled={!sharedState.walletAddress || !sharedState.addresses.length || !sharedState.amounts.length || sharedState.errorMessage}
        className="w-full bg-yellow-400 text-black py-3 px-4 text-base font-medium rounded-lg hover:bg-yellow-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-400/30 mt-6"
      >
        Next
      </button>
    </div>
  );
};

Step1.propTypes = {
  sharedState: PropTypes.object.isRequired,
  updateSharedState: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

export default Step1;
