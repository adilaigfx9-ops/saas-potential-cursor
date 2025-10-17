/**
 * Service Pricing Calculator Component
 * Interactive calculator for service pricing estimation
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, CheckCircle } from 'lucide-react';
import { useAnalytics } from '@/utils/analytics';
import { useSiteLinks } from '@/hooks/useSiteLinks';

interface PricingCalculatorProps {
  className?: string;
}

const serviceOptions = [
  { value: 'logo', label: 'Logo Design', basePrice: 149, description: 'Professional brand identity' },
  { value: 'thumbnails', label: 'YouTube Thumbnails', basePrice: 49, description: 'High-converting designs' },
  { value: 'video', label: 'Video Editing', basePrice: 299, description: 'Professional post-production' },
  { value: 'branding', label: 'Complete Branding', basePrice: 399, description: 'Full brand identity package' },
  { value: 'channel', label: 'YouTube Channel Setup', basePrice: 599, description: 'Complete channel optimization' },
  { value: 'social', label: 'Social Media Package', basePrice: 249, description: 'Multi-platform content' },
];

const complexityMultipliers = [
  { value: 1, label: 'Basic' },
  { value: 1.5, label: 'Standard' },
  { value: 2, label: 'Advanced' },
  { value: 3, label: 'Premium' },
];

export function PricingCalculator({ className }: PricingCalculatorProps) {
  const analytics = useAnalytics();
  const [service, setService] = useState('logo');
  const [quantity, setQuantity] = useState(1);
  const [complexity, setComplexity] = useState(1);
  const [turnaround, setTurnaround] = useState(7);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Track calculator usage
    analytics.track(analytics.events.CALCULATOR_USE, {
      service,
      quantity,
      complexity,
      turnaround,
    });
  }, []);

  useEffect(() => {
    calculatePrice();
  }, [service, quantity, complexity, turnaround]);

  const calculatePrice = () => {
    const selectedService = serviceOptions.find(s => s.value === service);
    if (!selectedService) return;

    let basePrice = selectedService.basePrice;
    
    // Apply quantity
    basePrice *= quantity;
    
    // Apply complexity multiplier
    basePrice *= complexity;
    
    // Rush delivery fee (under 3 days = +50%)
    if (turnaround <= 3) {
      basePrice *= 1.5;
    }
    
    setTotalPrice(Math.round(basePrice));
  };

  const handleSubmit = () => {
    analytics.track(analytics.events.CALCULATOR_SUBMIT, {
      service,
      quantity,
      complexity,
      turnaround,
      totalPrice,
    });
    
    // Redirect to contact with pre-filled data
    window.location.href = `/contact?service=${service}&estimated_price=${totalPrice}`;
  };

  const selectedServiceData = serviceOptions.find(s => s.value === service);
  const complexityLabel = complexityMultipliers.find(c => c.value === complexity)?.label || 'Basic';

  return (
    <Card className={`card-premium ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-youtube rounded-lg flex items-center justify-center">
          <Calculator className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Pricing Calculator</h3>
          <p className="text-sm text-muted-foreground">Get an instant estimate for your project</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Service Selection */}
        <div>
          <Label htmlFor="service" className="text-foreground mb-2 block">
            Service Type *
          </Label>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {serviceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} (from ${option.basePrice})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div>
          <Label htmlFor="quantity" className="text-foreground mb-2 block">
            Quantity: {quantity}
          </Label>
          <Slider
            id="quantity"
            min={1}
            max={20}
            step={1}
            value={[quantity]}
            onValueChange={(values) => setQuantity(values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        {/* Complexity */}
        <div>
          <Label htmlFor="complexity" className="text-foreground mb-2 block">
            Complexity: {complexityLabel}
          </Label>
          <Slider
            id="complexity"
            min={1}
            max={3}
            step={0.5}
            value={[complexity]}
            onValueChange={(values) => setComplexity(values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Basic</span>
            <span>Standard</span>
            <span>Advanced</span>
            <span>Premium</span>
          </div>
        </div>

        {/* Turnaround */}
        <div>
          <Label htmlFor="turnaround" className="text-foreground mb-2 block">
            Turnaround: {turnaround} days
          </Label>
          <Slider
            id="turnaround"
            min={1}
            max={14}
            step={1}
            value={[turnaround]}
            onValueChange={(values) => setTurnaround(values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 day</span>
            <span>7 days</span>
            <span>14 days</span>
          </div>
          {turnaround <= 3 && (
            <p className="text-xs text-youtube-red mt-1">
              Rush delivery (+50% fee)
            </p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="bg-gradient-subtle rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price:</span>
            <span className="font-medium text-foreground">
              ${selectedServiceData?.basePrice} × {quantity}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Complexity ({complexityLabel}):</span>
            <span className="font-medium text-foreground">×{complexity}</span>
          </div>
          {turnaround <= 3 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rush Delivery:</span>
              <span className="font-medium text-youtube-red">+50%</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Estimated Total:</span>
              <span className="text-2xl font-bold text-gradient-youtube">
                ${totalPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Features Included */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">What's Included:</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-youtube-red" />
              <span>Professional design</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-youtube-red" />
              <span>Revisions included</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-youtube-red" />
              <span>All source files</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-youtube-red" />
              <span>Commercial usage rights</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold"
          size="lg"
        >
          Get Started with This Quote
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Final pricing may vary based on specific requirements. Get a personalized quote by contacting us.
        </p>
      </div>
    </Card>
  );
}
