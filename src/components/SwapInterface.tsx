import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "../App";
import TokenSelector, { Token } from "./TokenSelector";
import WalletConnection from "./WalletConnection";
import { 
  ArrowUpDown, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  RefreshCw,
  Settings,
  Info,
  TrendingUp,
  Shield,
  Sparkles,
  Send,
  Copy,
  Wallet,
  User,
  ArrowDown,
  Coins
} from "lucide-react";

export type TransferStatus = 'idle' | 'approval-needed' | 'approving' | 'transferring' | 'success' | 'error';

interface TransferStats {
  gasEstimate: string;
  gasCost: string;
  estimatedTime: string;
  networkFee: string;
}

const SwapInterface = () => {
  const { toast } = useToast();
  const { account, isConnected, isEtherlink } = useWeb3();
  
  // Transfer state
  const [transferStatus, setTransferStatus] = useState<TransferStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState<string>();
  
  // Transfer data
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferNote, setTransferNote] = useState('');
  
  // Enhanced token list with Etherlink tokens and real balances simulation
  const tokens: Token[] = [
    { 
      symbol: 'XTZ', 
      name: 'Tezos', 
      address: 'native', 
      decimals: 18, 
      balance: '15.75',
      logoUrl: 'https://cryptologos.cc/logos/tezos-xtz-logo.png',
      isNative: true,
      price: 1.25
    },
    { 
      symbol: 'USDT', 
      name: 'Tether USD', 
      address: '0xa0b86a33e6b8c6b6c6b6c6b6c6b6c6b6c6b6c6b6', 
      decimals: 6, 
      balance: '1,250.50',
      logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      price: 1.00
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      address: '0xb1c7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7', 
      decimals: 6, 
      balance: '890.25',
      logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      price: 1.00
    },
    { 
      symbol: 'DAI', 
      name: 'Dai Stablecoin', 
      address: '0xc2d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8', 
      decimals: 18, 
      balance: '500.00',
      logoUrl: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
      price: 1.00
    },
    { 
      symbol: 'WETH', 
      name: 'Wrapped Ether', 
      address: '0xd3e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9e9', 
      decimals: 18, 
      balance: '2.5',
      logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      price: 2400.00
    },
  ];

  const [transferStats, setTransferStats] = useState<TransferStats>({
    gasEstimate: '21000',
    gasCost: '0.002',
    estimatedTime: '~30s',
    networkFee: '$0.003'
  });

  // Validate Ethereum address
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Handle recipient address input
  const handleRecipientChange = (value: string) => {
    setRecipientAddress(value);
    if (value && !isValidAddress(value)) {
      // Could add real-time validation feedback here
    }
  };

  // Copy recipient address
  const handleCopyRecipient = () => {
    if (recipientAddress) {
      navigator.clipboard.writeText(recipientAddress);
      toast({
        title: "Address Copied",
        description: "Recipient address copied to clipboard",
      });
    }
  };

  // Handle ERC-20 token approval
  const handleApproval = async () => {
    if (!selectedToken || selectedToken.isNative) return;
    
    setTransferStatus('approving');
    setProgress(0);
    
    try {
      // Simulate MetaMask approval transaction
      const approvalTx = {
        to: selectedToken.address,
        data: `0x095ea7b3${recipientAddress.slice(2).padStart(64, '0')}${'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'}`, // approve max
        from: account,
      };

      toast({
        title: "Approval Required",
        description: "Please approve the transaction in MetaMask",
      });

      // Simulate MetaMask popup
      const txHash = await window.ethereum?.request({
        method: 'eth_sendTransaction',
        params: [approvalTx],
      });

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTransferStatus('idle');
            toast({
              title: "Approval Successful ✅",
              description: `${selectedToken.symbol} spending approved`,
            });
            return 100;
          }
          return prev + 25;
        });
      }, 500);

    } catch (error: any) {
      setTransferStatus('error');
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve token spending",
        variant: "destructive",
      });
      setTimeout(() => setTransferStatus('idle'), 3000);
    }
  };

  // Handle transfer execution
  const handleTransfer = async () => {
    if (!selectedToken || !amount || !recipientAddress || !isValidAddress(recipientAddress)) {
      toast({
        title: "Invalid Input",
        description: "Please check all fields are correctly filled",
        variant: "destructive",
      });
      return;
    }

    setTransferStatus('transferring');
    setProgress(0);
    
    try {
      let transferTx;
      
      if (selectedToken.isNative) {
        // Native XTZ transfer
        const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString(16);
        transferTx = {
          to: recipientAddress,
          value: `0x${amountInWei}`,
          from: account,
          gas: '0x5208', // 21000 in hex
        };
      } else {
        // ERC-20 token transfer
        const amountInTokenUnits = (parseFloat(amount) * Math.pow(10, selectedToken.decimals)).toString(16).padStart(64, '0');
        const recipientPadded = recipientAddress.slice(2).padStart(64, '0');
        
        transferTx = {
          to: selectedToken.address,
          data: `0xa9059cbb${recipientPadded}${amountInTokenUnits}`, // transfer(to, amount)
          from: account,
          gas: '0x15f90', // 90000 in hex for ERC-20 transfer
        };
      }

      toast({
        title: "Transfer Initiated",
        description: "Please confirm the transaction in MetaMask",
      });

      // Send transaction via MetaMask
      const txHash = await window.ethereum?.request({
        method: 'eth_sendTransaction',
        params: [transferTx],
      });

      setTxHash(txHash);

      // Simulate transaction progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTransferStatus('success');
            
            // Update local balance (simulation)
            const currentBalance = parseFloat(selectedToken.balance?.replace(/,/g, '') || '0');
            const newBalance = currentBalance - parseFloat(amount);
            selectedToken.balance = newBalance.toLocaleString();
            
            toast({
              title: "Transfer Successful! 🎉",
              description: `Sent ${amount} ${selectedToken.symbol} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
              action: txHash ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://explorer.etherlink.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                    View Transaction
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              ) : undefined,
            });
            
            // Reset form after success
            setTimeout(() => {
              setTransferStatus('idle');
              setAmount('');
              setRecipientAddress('');
              setTransferNote('');
              setProgress(0);
              setTxHash(undefined);
            }, 5000);
            
            return 100;
          }
          return prev + 20;
        });
      }, 300);

    } catch (error: any) {
      setTransferStatus('error');
      if (error.code === 4001) {
        toast({
          title: "Transaction Cancelled",
          description: "User cancelled the transaction",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transfer Failed",
          description: error.message || "Failed to complete transfer",
          variant: "destructive",
        });
      }
      setTimeout(() => setTransferStatus('idle'), 3000);
    }
  };

  // Update gas estimates when amount or token changes
  useEffect(() => {
    if (selectedToken && amount) {
      const isNative = selectedToken.isNative;
      setTransferStats({
        gasEstimate: isNative ? '21,000' : '65,000',
        gasCost: isNative ? '0.0021' : '0.0065',
        estimatedTime: '~30s',
        networkFee: isNative ? '$0.003' : '$0.008'
      });
    }
  }, [selectedToken, amount]);

  const isTransferReady = isConnected && isEtherlink && selectedToken && amount && recipientAddress && 
                         parseFloat(amount) > 0 && isValidAddress(recipientAddress);
  const needsApproval = isTransferReady && !selectedToken?.isNative;
  const showApprovalButton = needsApproval && (transferStatus === 'idle' || transferStatus === 'approving');
  const hasInsufficientBalance = selectedToken?.balance && amount && 
                                parseFloat(amount) > parseFloat(selectedToken.balance.replace(/,/g, ''));

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
            <Send className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
            Send Tokens
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Send any token directly to another wallet on Etherlink
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-blue-500" />
            <span>Direct Transfer</span>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <WalletConnection />

      {/* Transfer Interface */}
      <Card className="p-6 space-y-6 shadow-xl border-0 bg-gradient-to-br from-background via-accent/5 to-background">
        {/* Token Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-muted-foreground">Select Token to Send</Label>
          <TokenSelector
            label="Send Token"
            value={selectedToken?.symbol || ''}
            onValueChange={() => {}}
            amount={amount}
            onAmountChange={setAmount}
            tokens={tokens}
            selectedToken={selectedToken}
            onTokenSelect={setSelectedToken}
            className="border-primary/20 hover:border-primary/40 transition-colors"
          />
          
          {hasInsufficientBalance && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>Insufficient balance for this transaction</span>
            </div>
          )}
        </div>

        {/* Recipient Address */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Recipient Address
          </Label>
          <div className="relative">
            <Input
              placeholder="0x742d35cc6634c0532925a3b8d406c55cc71b8d00"
              value={recipientAddress}
              onChange={(e) => handleRecipientChange(e.target.value)}
              className={`pr-10 ${
                recipientAddress && !isValidAddress(recipientAddress) 
                ? 'border-red-500 focus:border-red-500' 
                : recipientAddress && isValidAddress(recipientAddress)
                ? 'border-green-500 focus:border-green-500'
                : ''
              }`}
            />
            {recipientAddress && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyRecipient}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </div>
          {recipientAddress && !isValidAddress(recipientAddress) && (
            <p className="text-xs text-red-500">Please enter a valid Ethereum address</p>
          )}
          {recipientAddress && isValidAddress(recipientAddress) && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Valid address format
            </p>
          )}
        </div>

        {/* Token Transfer Type Display */}
        {selectedToken && recipientAddress && isValidAddress(recipientAddress) && (
          <Card className="p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-600" />
                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Token Transfer Details</Label>
              </div>
              
              <div className="flex items-center justify-center space-y-3">
                <div className="text-center">
                  {/* From MetaMask */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Wallet className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">From: MetaMask Wallet</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Your Wallet'}
                      </p>
                    </div>
                  </div>

                  {/* Transfer Arrow and Token Info */}
                  <div className="flex items-center justify-center gap-3 my-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                      {selectedToken.logoUrl && (
                        <img 
                          src={selectedToken.logoUrl} 
                          alt={selectedToken.symbol} 
                          className="w-5 h-5 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="text-center">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                          {amount || '0'} {selectedToken.symbol}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedToken.name}
                        </p>
                      </div>
                    </div>
                    <ArrowDown className="w-5 h-5 text-blue-500" />
                  </div>

                  {/* To Recipient */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">To: Recipient Wallet</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Token Type Information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">Token Type:</p>
                  <Badge variant={selectedToken.isNative ? "default" : "secondary"} className="text-xs">
                    {selectedToken.isNative ? "Native Token" : "ERC-20 Token"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">Network:</p>
                  <Badge variant="outline" className="text-xs">
                    <div className="w-2 h-2 bg-primary rounded-full mr-1" />
                    Etherlink
                  </Badge>
                </div>
                {!selectedToken.isNative && (
                  <>
                    <div className="space-y-1">
                      <p className="text-gray-600 dark:text-gray-400">Contract:</p>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {selectedToken.address.slice(0, 8)}...
                      </code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-600 dark:text-gray-400">Decimals:</p>
                      <span className="text-xs font-medium">{selectedToken.decimals}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Transfer Method Info */}
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <Info className="w-3 h-3 inline mr-1" />
                  {selectedToken.isNative 
                    ? "This will be a direct native token transfer via MetaMask"
                    : `This will be an ERC-20 token transfer requiring ${needsApproval ? 'approval + ' : ''}transaction confirmation in MetaMask`
                  }
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Transfer Note (Optional) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Note (Optional)
          </Label>
          <Input
            placeholder="Payment for services, gift, etc..."
            value={transferNote}
            onChange={(e) => setTransferNote(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            This note is for your records only and won't be sent on-chain
          </p>
        </div>

        {/* Transfer Summary */}
        {isTransferReady && (
          <Card className="p-4 bg-gradient-to-r from-muted/30 to-accent/20 border-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transfer Summary</span>
                <Button variant="ghost" size="sm" className="p-1">
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{amount} {selectedToken?.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium font-mono text-xs">
                    {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-medium text-green-600">{transferStats.networkFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Est. Time
                  </span>
                  <span className="font-medium text-primary">{transferStats.estimatedTime}</span>
                </div>
              </div>

              <Separator />
              
              <div className="flex justify-between text-sm font-medium">
                <span>Total Cost</span>
                <span>{amount} {selectedToken?.symbol} + {transferStats.networkFee}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Bar */}
        {(transferStatus === 'approving' || transferStatus === 'transferring') && (
          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    {transferStatus === 'approving' ? 'Approving Token Access...' : 'Processing Transfer...'}
                  </span>
                </div>
                <span className="text-sm text-primary font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {txHash && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Transaction:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </code>
                  <Button variant="ghost" size="sm" className="p-1 h-4" asChild>
                    <a href={`https://explorer.etherlink.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Success State */}
        {transferStatus === 'success' && (
          <Card className="p-4 border-success/20 bg-success/5">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-success">Transfer Completed!</h3>
                <p className="text-sm text-muted-foreground">
                  Successfully sent {amount} {selectedToken?.symbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  to {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                </p>
              </div>
              {txHash && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://explorer.etherlink.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                    View Transaction
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Error State */}
        {transferStatus === 'error' && (
          <Card className="p-4 border-red-500/20 bg-red-50 dark:bg-red-950/20">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-red-500">Transfer Failed</h3>
                <p className="text-sm text-muted-foreground">
                  The transaction could not be completed
                </p>
              </div>
              <Button variant="outline" onClick={() => setTransferStatus('idle')}>
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Approval Button */}
          {showApprovalButton && (
            <Button
              onClick={handleApproval}
              variant="outline"
              className="w-full h-12 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              disabled={transferStatus !== 'idle' || hasInsufficientBalance}
            >
              {transferStatus === 'approving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving {selectedToken?.symbol}...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve {selectedToken?.symbol} Transfer
                </>
              )}
            </Button>
          )}

          {/* Main Transfer Button */}
          <Button
            onClick={handleTransfer}
            variant={transferStatus === 'success' ? 'success' : 'glow'}
            className="w-full h-14 text-lg font-semibold"
            disabled={
              !isConnected || 
              !isEtherlink || 
              !isTransferReady || 
              hasInsufficientBalance ||
              (needsApproval && transferStatus === 'idle') || 
              transferStatus === 'approving' || 
              transferStatus === 'transferring'
            }
          >
            {!isConnected ? (
              <>
                <Wallet className="w-5 h-5" />
                Connect Wallet First
              </>
            ) : !isEtherlink ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Switch to Etherlink
              </>
            ) : hasInsufficientBalance ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Insufficient Balance
              </>
            ) : transferStatus === 'transferring' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Transfer...
              </>
            ) : transferStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Transfer Complete!
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {needsApproval && transferStatus === 'idle' ? 'Approve Token First' : 'Send Transfer'}
              </>
            )}
          </Button>

          {/* Gas Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Gas Estimate: {transferStats.gasEstimate}</span>
            <span>Network Fee: {transferStats.networkFee}</span>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Security Notice</p>
              <p>Always verify the recipient address before sending. Transactions are irreversible.</p>
            </div>
          </div>
        </Card>

        {/* Powered by */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Powered by</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="w-2 h-2 bg-primary rounded-full mr-1" />
              Etherlink Network
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Send className="w-3 h-3 mr-1" />
              Batchless Protocol
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SwapInterface;