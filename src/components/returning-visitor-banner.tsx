import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Gift, Star } from 'lucide-react';
import { useAnalytics } from '@/utils/analytics';

export function ReturningVisitorBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenBanner, setHasSeenBanner] = useState(false);
  const analytics = useAnalytics();

  useEffect(() => {
    // Check if user has seen this banner before
    const seenBanner = localStorage.getItem('returning_visitor_banner_seen');
    if (seenBanner) {
      setHasSeenBanner(true);
      return;
    }

    // Check if user is a returning visitor (has visited before)
    const visitCount = parseInt(localStorage.getItem('visit_count') || '0');
    const isReturningVisitor = visitCount > 1;

    if (isReturningVisitor) {
      // Show banner after a delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        analytics.track('returning_visitor_banner_shown');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [analytics]);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenBanner(true);
    localStorage.setItem('returning_visitor_banner_seen', 'true');
    analytics.track('returning_visitor_banner_dismissed');
  };

  const handleClaimOffer = () => {
    analytics.track('returning_visitor_offer_claimed');
    window.location.href = '/contact?offer=returning-visitor';
  };

  if (!isVisible || hasSeenBanner) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right duration-500">
      <Card className="bg-gradient-to-r from-youtube-red to-red-600 text-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="h-5 w-5" />
                <h3 className="font-semibold text-sm">Welcome Back!</h3>
              </div>
              <p className="text-xs text-white/90 mb-3">
                Thanks for returning! Get 15% off your next project as a returning customer.
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleClaimOffer}
                  className="bg-white text-youtube-red hover:bg-white/90 text-xs font-medium"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Claim Offer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClose}
                  className="text-white hover:bg-white/10 p-1 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
