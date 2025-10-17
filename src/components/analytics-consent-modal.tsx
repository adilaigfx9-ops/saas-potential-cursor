import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Shield, Cookie, BarChart3 } from 'lucide-react';
import { enableAnalytics, disableAnalytics, hasAnalyticsConsent } from '@/utils/analytics';

export function AnalyticsConsentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [performanceEnabled, setPerformanceEnabled] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = hasAnalyticsConsent();
    if (hasConsent !== null) {
      return; // User has already made a choice
    }

    // Show modal after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    if (analyticsEnabled) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    enableAnalytics();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    disableAnalytics();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-youtube-red" />
            <CardTitle>Privacy & Analytics</CardTitle>
          </div>
          <CardDescription>
            We respect your privacy. Please choose your preferences for data collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="analytics"
                checked={analyticsEnabled}
                onCheckedChange={(checked) => setAnalyticsEnabled(checked as boolean)}
              />
              <div className="space-y-1">
                <label htmlFor="analytics" className="text-sm font-medium cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics & Performance</span>
                  </div>
                </label>
                <p className="text-xs text-muted-foreground">
                  Help us improve our website by sharing anonymous usage data and performance metrics.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="performance"
                checked={performanceEnabled}
                onCheckedChange={(checked) => setPerformanceEnabled(checked as boolean)}
              />
              <div className="space-y-1">
                <label htmlFor="performance" className="text-sm font-medium cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Cookie className="h-4 w-4" />
                    <span>Essential Cookies</span>
                  </div>
                </label>
                <p className="text-xs text-muted-foreground">
                  Required for basic website functionality and user preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleAcceptAll}
              className="w-full bg-gradient-youtube hover:shadow-glow"
            >
              Accept All
            </Button>
            <Button
              onClick={handleAccept}
              variant="outline"
              className="w-full"
            >
              Save Preferences
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Reject All
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can change these settings anytime in your browser preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
