import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronDown, 
  DollarSign, 
  Coins, 
  Star, 
  TrendingUp, 
  Copy,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "../App";

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  balance?: string;
  isNative?: boolean;
  price?: number;
  change24h?: number;
}

interface TokenSelectorProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  tokens: Token[];
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  isReadOnly?: boolean;
  className?: string;
}

const TokenSelector = ({
  label,
  value,
  onValueChange,
  amount,
  onAmountChange,
  tokens,
  selectedToken,
  onTokenSelect,
  isReadOnly = false,
  className = "",
}: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [realTimeBalance, setRealTimeBalance] = useState<string | null>(null);
  const { toast } = useToast();
  const { account, getBalance, getTokenBalance, isConnected, isEtherlink } = useWeb3();

  // Load real-time balance when token is selected
  useEffect(() => {
    const loadTokenBalance = async () => {
      if (!selectedToken || !account || !isConnected || !isEtherlink) {
        setRealTimeBalance(null);
        return;
      }

      setIsLoadingBalance(true);
      try {
        let balance: string;
        
        if (selectedToken.isNative) {
          balance = await getBalance(account);
        } else {
          balance = await getTokenBalance(selectedToken.address, account);
        }
        
        setRealTimeBalance(balance);
        
        // Update the token object with real balance
        if (selectedToken.balance !== balance) {
          selectedToken.balance = parseFloat(balance).toLocaleString();
        }
      } catch (error) {
        console.error('Failed to load token balance:', error);
        toast({
          title: "Balance Load Failed",
          description: `Could not load ${selectedToken.symbol} balance`,
          variant: "destructive",
        });
      } finally {
        setIsLoadingBalance(false);
      }
    };

    loadTokenBalance();
  }, [selectedToken, account, isConnected, isEtherlink]);

  const handleTokenSelect = (tokenSymbol: string) => {
    const token = tokens.find(t => t.symbol === tokenSymbol);
    if (token) {
      onTokenSelect(token);
      onValueChange(tokenSymbol);
      setRealTimeBalance(null); // Reset balance, will be loaded by useEffect
    }
    setIsOpen(false);
  };

  const handleMaxClick = () => {
    const balance = realTimeBalance || selectedToken?.balance?.replace(/,/g, '');
    if (balance) {
      // For native tokens, leave a small amount for gas fees
      if (selectedToken?.isNative) {
        const maxAmount = Math.max(0, parseFloat(balance) - 0.001);
        onAmountChange(maxAmount.toString());
      } else {
        onAmountChange(balance);
      }
    }
  };

  const handleRefreshBalance = async () => {
    if (!selectedToken || !account) return;
    
    setIsLoadingBalance(true);
    try {
      let balance: string;
      
      if (selectedToken.isNative) {
        balance = await getBalance(account);
      } else {
        balance = await getTokenBalance(selectedToken.address, account);
      }
      
      setRealTimeBalance(balance);
      selectedToken.balance = parseFloat(balance).toLocaleString();
      
      toast({
        title: "Balance Updated",
        description: `${selectedToken.symbol} balance refreshed`,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not update balance",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedToken?.address && selectedToken.address !== 'native') {
      navigator.clipboard.writeText(selectedToken.address);
      toast({
        title: "Address Copied",
        description: `${selectedToken.symbol} contract address copied`,
      });
    }
  };

  const getTokenIcon = (token: Token) => {
    if (token.logoUrl) {
      return (
        <img 
          src={token.logoUrl} 
          alt={token.symbol}
          className="w-6 h-6 rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
        <DollarSign className="w-3 h-3 text-primary" />
      </div>
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return price < 0.01 ? price.toExponential(2) : price.toFixed(2);
  };

  const getUSDValue = () => {
    if (!amount || !selectedToken?.price) return null;
    const value = parseFloat(amount) * selectedToken.price;
    return value.toFixed(2);
  };

  const getCurrentBalance = () => {
    return realTimeBalance || selectedToken?.balance?.replace(/,/g, '') || '0';
  };

  const hasInsufficientBalance = () => {
    if (!amount || !selectedToken) return false;
    const balance = getCurrentBalance();
    return parseFloat(amount) > parseFloat(balance);
  };

  const getBalanceDisplay = () => {
    const balance = getCurrentBalance();
    if (isLoadingBalance) return 'Loading...';
    return parseFloat(balance).toLocaleString();
  };

  return (
    <Card className={`p-4 border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {label}
            {selectedToken?.isNative && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                Native
              </Badge>
            )}
          </Label>
          {selectedToken && isConnected && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="text-xs hover:bg-accent cursor-pointer flex items-center gap-1" 
                onClick={handleMaxClick}
              >
                {isLoadingBalance ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>Balance: {getBalanceDisplay()} {selectedToken.symbol}</>
                )}
              </Badge>
              {!isReadOnly && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMaxClick}
                    className="text-xs h-6 px-2 text-primary hover:text-primary/80"
                    disabled={isLoadingBalance}
                  >
                    MAX
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefreshBalance}
                    className="text-xs h-6 px-1 text-muted-foreground hover:text-foreground"
                    disabled={isLoadingBalance}
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Main Input Area */}
        <div className="grid grid-cols-5 gap-3">
          {/* Token Selector */}
          <div className="col-span-2">
            <Select value={value} onValueChange={handleTokenSelect} open={isOpen} onOpenChange={setIsOpen}>
              <SelectTrigger className="h-14 bg-muted/50 border-muted hover:bg-muted transition-colors">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {selectedToken ? (
                      <>
                        {getTokenIcon(selectedToken)}
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">{selectedToken.symbol}</span>
                          {selectedToken.price && (
                            <span className="text-xs text-muted-foreground">
                              ${formatPrice(selectedToken.price)}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <Coins className="w-5 h-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Select Token</span>
                      </>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg max-h-80">
                {tokens.map((token) => (
                  <SelectItem 
                    key={token.symbol} 
                    value={token.symbol} 
                    className="focus:bg-accent p-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {getTokenIcon(token)}
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{token.symbol}</span>
                            {token.isNative && (
                              <Star className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{token.name}</span>
                          {token.price && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">${formatPrice(token.price)}</span>
                              {token.change24h && (
                                <span className={`flex items-center gap-1 ${
                                  token.change24h > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  <TrendingUp className={`w-3 h-3 ${
                                    token.change24h < 0 ? 'rotate-180' : ''
                                  }`} />
                                  {Math.abs(token.change24h).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {token.balance && (
                        <Badge variant="outline" className="text-xs">
                          {parseFloat(token.balance.replace(/,/g, '')).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="col-span-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                disabled={isReadOnly}
                className={`h-14 text-right text-xl font-semibold bg-muted/50 border-muted focus:bg-background transition-colors pr-16 ${
                  hasInsufficientBalance() ? 'border-red-500 focus:border-red-500' : ''
                }`}
                step="any"
                min="0"
              />
              {amount && selectedToken?.price && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                  ~${getUSDValue()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token Details */}
        {selectedToken && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{selectedToken.name}</span>
              <div className="flex items-center gap-2">
                {amount && selectedToken.price && (
                  <span className="font-medium">≈ ${getUSDValue()} USD</span>
                )}
                {selectedToken.change24h && (
                  <span className={`flex items-center gap-1 ${
                    selectedToken.change24h > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${
                      selectedToken.change24h < 0 ? 'rotate-180' : ''
                    }`} />
                    {selectedToken.change24h > 0 ? '+' : ''}{selectedToken.change24h.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            
            {selectedToken.address !== 'native' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Contract:</span>
                <div className="flex items-center gap-1">
                  <code className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs">
                    {selectedToken.address.slice(0, 6)}...{selectedToken.address.slice(-4)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="p-1 h-6 w-6 hover:bg-accent"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-accent"
                    asChild
                  >
                    <a 
                      href={`https://explorer.etherlink.com/address/${selectedToken.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Balance warnings */}
            {selectedToken.isNative && amount && parseFloat(amount) > parseFloat(getCurrentBalance()) - 0.001 && (
              <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>Keep some XTZ for transaction fees</span>
              </div>
            )}
          </div>
        )}

        {/* Amount Validation */}
        {hasInsufficientBalance() && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>Insufficient balance - Available: {getBalanceDisplay()} {selectedToken?.symbol}</span>
          </div>
        )}

        {/* Connection prompt */}
        {!isConnected && selectedToken && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>Connect wallet to see real-time balance</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TokenSelector;