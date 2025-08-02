import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-lg">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Error Details */}
        <Card className="p-4 bg-muted/30 border-0">
          <div className="text-sm text-muted-foreground">
            <strong>Requested URL:</strong>
            <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">
              {location.pathname}
            </code>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            asChild 
            variant="glow" 
            className="w-full"
          >
            <a href="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </a>
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button 
              variant="outline" 
              asChild
              className="w-full"
            >
              <a href="/help">
                <HelpCircle className="w-4 h-4 mr-2" />
                Get Help
              </a>
            </Button>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">
            Popular pages:
          </p>
          <div className="space-y-2 text-sm">
            <a href="/" className="block text-primary hover:underline">
              🏠 Home - Swap Interface
            </a>
            <a href="/docs" className="block text-primary hover:underline">
              📖 Documentation
            </a>
            <a href="/support" className="block text-primary hover:underline">
              💬 Support & Community
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 text-xs text-muted-foreground">
          If you believe this is an error, please contact our support team.
        </div>
      </Card>
    </div>
  );
};

export default NotFound;