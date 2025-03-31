import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Step1 from "./Components/Step1/Step1";
import Step2 from "./Components/Step2/Step2";
import Step3 from "./Components/Step3/Step3";
import Footer from "./Components/Footer";
import Navbar from './Components/Navbar';
import LandingPage from './Components/LandingPage';
import { ethers } from "ethers";

const MultiSenderApp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [sharedState, setSharedState] = useState({
    walletAddress: "",
    addresses: [],
    amounts: [],
    selectedToken: "META",
    customTokenAddress: "",
    totalAmount: "0",
    estimatedGas: null,
    receipt: null,
    txnHash: null,
    errorMessage: "",
    custom_token_balance:"0",
    custom_token_symbol:"ERC20",
    token_balance:"0",
    provider: null,
    signer: null,
    contract: null,
    ethBalance: null,
    CONTRACT_ADDRESS:"0x41c108bba45ffc0ceee17a1dabaddd738bd3ab43", 
    approved_i:false,
  });

  const [set_faucet_txn_hash] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFaucetModalOpen, setFaucetModalOpen] = useState(false);

  const handleFaucetClick = () => {
    setFaucetModalOpen(true);
  };

  const closeFaucetModal = () => {
    setFaucetModalOpen(false);
  }



  useEffect(() => {
    balance_func();
    checkAndSwitchToSepolia();
  }, [isFaucetModalOpen]);
  

let balance_func =async()=>
{
  const contract = new ethers.Contract("0xd312f1C56bfe9be58a36C4747a945FC699a9C079" , [
    "function balanceOf(address) view returns (uint256)"
  ], sharedState.signer);

  let balance = await contract.balanceOf(sharedState.walletAddress);// Update the MetaToken balance after minting
  setSharedState((prevState) => ({...prevState,token_balance: ethers.utils.formatUnits(balance, 18)}));
}


  const mintMetaToken = async () => {
    try 
    {
        setIsLoading(true);
        const contract = new ethers.Contract("0xd312f1C56bfe9be58a36C4747a945FC699a9C079" , [
          "function faucet() external",
        ], sharedState.signer);
        
        let tx =await contract.faucet( { gasLimit: 210000 }); // Call the faucet function
        await tx.wait(); // Wait for the transaction to be mined
        set_faucet_txn_hash(tx.hash);
        setFaucetModalOpen(false); // Close the modal after minting
      
    } 
    catch (error) 
    {
      console.error("Error minting tokens:", error);
    }
    finally
    {setIsLoading(false);}
  };

  const updateSharedState = (updates) => {
    setSharedState(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const checkAndSwitchToSepolia = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.error("Metamask is not installed.");
        return;
      }
  
      const provider = new ethers.providers.Web3Provider(ethereum);
      const network = await provider.getNetwork();
  
      // Check if the network is Sepolia (chainId: 11155111)
      if (network.chainId !== 11155111) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xAA36A7" }], // Hexadecimal for 11155111
          });
        } catch (error) {
          // If the user doesn't have Sepolia, try adding it
          if (error.code === 4902) {
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0xAA36A7",
                    chainName: "Sepolia Testnet",
                    nativeCurrency: {
                      name: "Sepolia ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
            } catch (addError) {
              console.error("Error adding Sepolia network:", addError);
            }
          } else {
            console.error("Error switching network:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error checking or switching network:", error);
    }
  };




  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-['Source_Sans_Pro']">
      <Navbar 
        onFaucetClick={handleFaucetClick}
        showFaucet={sharedState.walletAddress && currentStep === 1}
      />
      <main className="flex-grow flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-8 gap-16">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center ${
                  currentStep === step ? "text-yellow-400" : "text-gray-400"
                } font-bold text-lg animate-bounceIn`}
              >
                <div
                  className={`${
                    currentStep === step
                      ? "bg-yellow-400 text-gray-800"
                      : "bg-gray-700 text-gray-200"
                  } w-[35px] h-[35px] rounded-full flex items-center justify-center mr-3 text-base font-bold animate-scaleUp`}
                >
                  {step}
                </div>
                Step {step}
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-400 p-8 rounded-xl shadow-xl animate-slideUp">
              {currentStep === 1 && (
                <Step1
                  sharedState={sharedState}
                  updateSharedState={updateSharedState}
                  onNext={handleNext}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  sharedState={sharedState}
                  updateSharedState={updateSharedState}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <Step3
                  sharedState={sharedState}
                  updateSharedState={updateSharedState}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </div>

        {isFaucetModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl border border-yellow-400/30 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">META Token Faucet</h2>
              <p className="mb-6 text-gray-300">
                Click the button below to receive META tokens for testing.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeFaucetModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={mintMetaToken}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:bg-gray-400 transition-all duration-300 shadow-lg hover:shadow-yellow-400/30"
                >
                  {isLoading ? "Minting..." : "Get Tokens"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<MultiSenderApp />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
