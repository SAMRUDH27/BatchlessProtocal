import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "../App";
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  LogOut,
  Loader2,
  Shield,
  RefreshCw,
  Eye,
  DollarSign
} from "lucide-react";

const WalletConnection = () => {
  const { toast } = useToast();
  const { 
    account, 
    chainId, 
    isConnected, 
    isEtherlink, 
    balance,
    connectWallet, 
    switchToEtherlink, 
    disconnect,
    getBalance
  } = useWeb3();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const handleConnect = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" asChild>
            <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
              Install MetaMask
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        ),
      });
      return;
    }

    setIsConnecting(true);
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected! 🎉",
        description: "Successfully connected to your MetaMask wallet",
      });
    } catch (error: any) {
      let errorMessage = "Failed to connect wallet";
      
      if (error.code === 4001) {
        errorMessage = "Connection request was rejected";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending in MetaMask";
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      await switchToEtherlink();
      toast({
        title: "Network Switched! 🌐",
        description: "Successfully connected to Etherlink network",
      });
    } catch (error: any) {
      let errorMessage = "Failed to switch to Etherlink network";
      
      if (error.code === 4001) {
        errorMessage = "Network switch was rejected";
      } else if (error.code === 4902) {
        errorMessage = "Etherlink network not found in MetaMask";
      }
      
      toast({
        title: "Network Switch Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!account) return;
    
    setIsRefreshing(true);
    try {
      await getBalance(account);
      toast({
        title: "Balance Updated",
        description: "Successfully refreshed your wallet balance",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to update balance",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from wallet",
    });
  };

  const getNetworkName = () => {
    if (!chainId) return 'Unknown Network';
    if (isEtherlink) return 'Etherlink Mainnet';
    
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
    };
    
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const formatBalance = (balance: string | null) => {
    if (!balance) return '0.000000';
    const num = parseFloat(balance);
    if (num < 0.000001) return '< 0.000001';
    return num.toFixed(6);
  };

  // Not connected state
  if (!isConnected) {
    return (
      <Card className="p-6 border-2 border-dashed border-muted hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Connect with MetaMask to start sending tokens on Etherlink network
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secure • Non-custodial • Your keys, your crypto</span>
          </div>

          <Button
            onClick={handleConnect}
            variant="glow"
            size="lg"
            className="w-full"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect MetaMask
              </>
            )}
          </Button>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Don't have MetaMask? 
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Download here
                <ExternalLink className="w-3 h-3 inline ml-1" />
              </a>
            </p>
            
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✓ Free to use</span>
              <span>✓ Secure</span>
              <span>✓ No registration</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Wrong network state
  if (!isEtherlink) {
    return (
      <Card className="p-4 border-warning/20 bg-warning/5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Wrong Network</p>
                <p className="text-xs text-muted-foreground">
                  Connected to {getNetworkName()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please switch to Etherlink network to continue with token transfers
            </p>
            <Button
              onClick={handleSwitchNetwork}
              variant="gradient"
              className="w-full"
              disabled={isSwitching}
            >
              {isSwitching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Switching Network...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Switch to Etherlink
                </>
              )}
            </Button>
            
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <strong>Note:</strong> Etherlink will be automatically added to your MetaMask if not present
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Connected and correct network state
  return (
    <Card className="p-4 border-success/20 bg-gradient-to-r from-success/5 to-primary/5">
      <div className="space-y-4">
        {/* Main wallet info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Wallet Connected</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="p-1 h-6 w-6"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
              <div className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse" />
              Etherlink
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-muted-foreground hover:text-foreground p-1 h-6 w-6"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Balance display */}
        <Card className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">XTZ Balance</p>
                <div className="flex items-center gap-2">
                  {showBalance ? (
                    <p className="text-lg font-bold text-primary">
                      {formatBalance(balance)} XTZ
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-primary">••••••</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 h-6 w-6"
                  >
                    <Eye className={`w-3 h-3 ${showBalance ? 'text-primary' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
              className="p-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {balance && parseFloat(balance) < 0.001 && (
            <div className="mt-2 text-xs text-warning bg-warning/10 p-2 rounded">
              ⚠️ Low balance: You may need XTZ for transaction fees
            </div>
          )}
        </Card>

        {/* Network and explorer links */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Network: {getNetworkName()}</span>
            <div className="w-1 h-1 bg-success rounded-full" />
            <span className="text-success">Active</span>
          </div>
          <a
            href={`https://explorer.etherlink.com/address/${account}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            View on Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
            <ExternalLink className="w-3 h-3 mr-1" />
            Add Token
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WalletConnection;