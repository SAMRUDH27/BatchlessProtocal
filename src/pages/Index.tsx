import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SwapInterface from "@/components/SwapInterface";
import { useWeb3 } from "../App";
import { 
  Moon, 
  Sun, 
  Settings, 
  HelpCircle, 
  Activity,
  Users,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isConnected } = useWeb3();

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Check system theme on mount
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Batchless Protocol
                </h1>
                <p className="text-xs text-muted-foreground">Powered by Etherlink</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDarkMode}
                className="p-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Stats */}
            <div className="space-y-6">
              {/* Protocol Stats */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Protocol Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">$2.4M</div>
                      <div className="text-xs text-muted-foreground">24h Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">1,247</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">99.9%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">0.3%</div>
                      <div className="text-xs text-muted-foreground">Avg Fee</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Features */}
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Why Choose Batchless?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-primary/10 rounded">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Lightning Fast</div>
                        <div className="text-xs text-muted-foreground">
                          Sub-second swaps with instant confirmation
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-green-500/10 rounded">
                        <Shield className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Secure & Non-custodial</div>
                        <div className="text-xs text-muted-foreground">
                          Your keys, your tokens. Always in control
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-500/10 rounded">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Best Rates</div>
                        <div className="text-xs text-muted-foreground">
                          Intelligent routing for optimal prices
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-purple-500/10 rounded">
                        <Users className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Community Driven</div>
                        <div className="text-xs text-muted-foreground">
                          Built by developers, for developers
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Network Status */}
              <Card className="p-4 border-success/20 bg-success/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Etherlink Network</span>
                  </div>
                  <Badge variant="default" className="text-xs bg-success/10 text-success border-success/20">
                    Operational
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Block height: 2,847,392 • Gas price: 0.1 gwei
                </div>
              </Card>
            </div>

            {/* Center Column - Main Swap Interface */}
            <div className="lg:col-span-1">
              <SwapInterface />
            </div>

            {/* Right Column - Recent Activity & Info */}
            <div className="space-y-6">
              {/* Recent Swaps */}
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Swaps
                  </h3>
                  <div className="space-y-3">
                    {[
                      { from: 'USDT', to: 'XTZ', amount: '100.00', time: '2s ago' },
                      { from: 'DAI', to: 'USDC', amount: '250.50', time: '15s ago' },
                      { from: 'XTZ', to: 'WETH', amount: '50.25', time: '32s ago' },
                      { from: 'USDC', to: 'LINK', amount: '75.00', time: '1m ago' },
                    ].map((swap, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {swap.from}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {swap.to}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${swap.amount}</div>
                          <div className="text-xs text-muted-foreground">{swap.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Supported Tokens */}
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Supported Tokens</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { symbol: 'XTZ', name: 'Tezos', native: true },
                      { symbol: 'USDT', name: 'Tether USD' },
                      { symbol: 'USDC', name: 'USD Coin' },
                      { symbol: 'DAI', name: 'Dai Stablecoin' },
                      { symbol: 'WETH', name: 'Wrapped Ether' },
                      { symbol: 'LINK', name: 'Chainlink' },
                    ].map((token) => (
                      <div key={token.symbol} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{token.symbol}</span>
                            {token.native && (
                              <Badge variant="secondary" className="text-xs">Native</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {token.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Help & Support */}
              <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-200/50">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    Need Help?
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      📖 Read Documentation
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      💬 Join Discord Community
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      🐛 Report Bug
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-primary/20 to-secondary/20 rounded">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold">Batchless</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The fastest way to swap tokens on Etherlink. Built for speed, security, and simplicity.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Protocol</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Documentation</div>
                <div>Whitepaper</div>
                <div>Audit Reports</div>
                <div>Bug Bounty</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Community</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Discord</div>
                <div>Twitter</div>
                <div>Telegram</div>
                <div>GitHub</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Terms of Service</div>
                <div>Privacy Policy</div>
                <div>Cookie Policy</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
            <div>© 2024 Batchless Protocol. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Made with ❤️ for Etherlink</span>
              <Badge variant="outline" className="text-xs">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;