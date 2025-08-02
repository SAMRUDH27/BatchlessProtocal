import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Enhanced Web3 Context with balance tracking
interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isEtherlink: boolean;
  balance: string | null;
  connectWallet: () => Promise<void>;
  switchToEtherlink: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (params: TransactionParams) => Promise<string>;
  getBalance: (address?: string) => Promise<string>;
  getTokenBalance: (tokenAddress: string, walletAddress?: string) => Promise<string>;
}

interface TransactionParams {
  to: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

// Etherlink network configuration
const ETHERLINK_NETWORK = {
  chainId: '0xa729', // 42793 in hex
  chainName: 'Etherlink Mainnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: ['https://node.mainnet.etherlink.com'],
  blockExplorerUrls: ['https://explorer.etherlink.com'],
  iconUrls: ['https://etherlink.com/favicon.ico']
};

// ERC-20 Token ABI for balance checking and transfers
const ERC20_ABI = [
  // balanceOf
  "function balanceOf(address owner) view returns (uint256)",
  // transfer
  "function transfer(address to, uint256 amount) returns (bool)",
  // approve
  "function approve(address spender, uint256 amount) returns (bool)",
  // allowance
  "function allowance(address owner, address spender) view returns (uint256)"
];

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  const isEtherlink = chainId === parseInt(ETHERLINK_NETWORK.chainId, 16);

  // Get native token balance
  const getBalance = async (address?: string): Promise<string> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    const targetAddress = address || account;
    if (!targetAddress) {
      throw new Error('No address provided');
    }

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [targetAddress, 'latest'],
      });
      
      // Convert from wei to ether
      const balanceInEther = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(6);
      return balanceInEther;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  };

  // Get ERC-20 token balance
  const getTokenBalance = async (tokenAddress: string, walletAddress?: string): Promise<string> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    const targetAddress = walletAddress || account;
    if (!targetAddress) {
      throw new Error('No wallet address provided');
    }

    try {
      // Encode the balanceOf function call
      const data = `0x70a08231${targetAddress.slice(2).padStart(64, '0')}`;
      
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: data
        }, 'latest'],
      });

      // Convert hex result to decimal
      const balanceInTokenUnits = parseInt(result, 16);
      
      // For most tokens, we assume 6 or 18 decimals
      // In a real implementation, you'd call the decimals() function
      const decimals = 6; // This should be fetched from the token contract
      const balance = (balanceInTokenUnits / Math.pow(10, decimals)).toFixed(6);
      
      return balance;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  };

  // Send transaction through MetaMask
  const sendTransaction = async (params: TransactionParams): Promise<string> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    if (!account) {
      throw new Error('No wallet connected');
    }

    try {
      const txParams = {
        from: account,
        to: params.to,
        value: params.value || '0x0',
        data: params.data || '0x',
        gas: params.gas || '0x5208', // Default gas limit
        gasPrice: params.gasPrice,
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setAccount(accounts[0]);
      setChainId(parseInt(chainId, 16));
      setIsConnected(true);

      // Get initial balance
      try {
        const balance = await getBalance(accounts[0]);
        setBalance(balance);
      } catch (error) {
        console.error('Failed to get initial balance:', error);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const switchToEtherlink = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ETHERLINK_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ETHERLINK_NETWORK],
          });
        } catch (addError) {
          console.error('Failed to add Etherlink network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch to Etherlink network:', switchError);
        throw switchError;
      }
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setBalance(null);
  };

  // Update balance when account or chain changes
  useEffect(() => {
    const updateBalance = async () => {
      if (account && isEtherlink) {
        try {
          const newBalance = await getBalance(account);
          setBalance(newBalance);
        } catch (error) {
          console.error('Failed to update balance:', error);
        }
      }
    };

    updateBalance();
  }, [account, chainId, isEtherlink]);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
          // Balance will be updated by the useEffect above
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            return window.ethereum.request({ method: 'eth_chainId' });
          }
        })
        .then((chainId: string) => {
          if (chainId) {
            setChainId(parseInt(chainId, 16));
          }
        })
        .catch(console.error);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const value: Web3ContextType = {
    account,
    chainId,
    isConnected,
    isEtherlink,
    balance,
    connectWallet,
    switchToEtherlink,
    disconnect,
    sendTransaction,
    getBalance,
    getTokenBalance,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Enhanced MetaMask type declarations
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      selectedAddress?: string;
      chainId?: string;
    };
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;