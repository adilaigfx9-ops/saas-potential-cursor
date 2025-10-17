import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Gift, Clock, Users } from 'lucide-react';
import { useAnalytics } from '@/utils/analytics';

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  const analytics = useAnalytics();

  useEffect(() => {
    // Check if user has seen this popup before
    const seenPopup = localStorage.getItem('exit_intent_popup_seen');
    if (seenPopup) {
      setHasSeenPopup(true);
      return;
    }

    // Track mouse movement to detect exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving towards the top of the page
      if (e.clientY <= 0) {
        setIsVisible(true);
        analytics.track('exit_intent_triggered');
      }
    };

    // Add event listener after a delay to avoid immediate triggers
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [analytics]);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenPopup(true);
    localStorage.setItem('exit_intent_popup_seen', 'true');
    analytics.track('exit_intent_dismissed');
  };

  const handleClaimOffer = () => {
    analytics.track('exit_intent_offer_claimed');
    window.location.href = '/contact?offer=exit-intent';
  };

  const handleStayOnSite = () => {
    analytics.track('exit_intent_stay_on_site');
    handleClose();
  };

  if (!isVisible || hasSeenPopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-300">
        <CardHeader className="text-center">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-youtube-red to-red-600 rounded-full flex items-center justify-center">
              <Gift className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Wait! Don't Go Yet!</CardTitle>
          <CardDescription className="text-base">
            Get 20% off your first project when you book today!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Limited Time Offer
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  Valid for the next 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Trusted by 500+ Clients
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Join our satisfied customers
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleClaimOffer}
              className="w-full bg-gradient-youtube hover:shadow-glow text-lg py-6"
            >
              <Gift className="h-5 w-5 mr-2" />
              Claim 20% Discount
            </Button>
            <Button
              onClick={handleStayOnSite}
              variant="outline"
              className="w-full"
            >
              Continue Browsing
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            No spam, just great deals delivered to your inbox.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
