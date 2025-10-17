import { useState } from "react"
import { Calculator, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePricingServices } from "@/hooks/usePricingServices"
import { useSiteLinks } from "@/hooks/useSiteLinks"

export function PricingEstimator() {
  const { services, loading, error } = usePricingServices()
  const { links, externalLinks } = useSiteLinks()
  const [selectedService, setSelectedService] = useState("0")
  const [selectedVariation, setSelectedVariation] = useState("0")
  const [urgency, setUrgency] = useState([1])
  const [complexity, setComplexity] = useState([1])
  const [isExpanded, setIsExpanded] = useState(false)

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-subtle border-2 border-youtube-red/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-youtube-red" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    )
  }

  if (error || services.length === 0) {
    return (
      <Card className="p-6 bg-gradient-subtle border-2 border-youtube-red/20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calculator className="h-6 w-6 text-youtube-red" />
          <h3 className="text-xl font-semibold text-foreground">Pricing Calculator</h3>
        </div>
        <p className="text-muted-foreground mb-4">Calculator temporarily unavailable. Please contact us for a custom quote.</p>
        <Button onClick={() => window.location.href = links.contact}>
          Get Custom Quote
        </Button>
      </Card>
    )
  }

  const serviceIndex = parseInt(selectedService) || 0
  const variationIndex = parseInt(selectedVariation) || 0
  
  const currentService = services[serviceIndex]
  const currentVariation = currentService?.variations[variationIndex]

  if (!currentService || !currentVariation) {
    return null
  }

  // Calculate price
  const basePrice = currentService.basePrice * currentVariation.multiplier
  const urgencyMultiplier = urgency[0] === 2 ? 1.5 : urgency[0] === 3 ? 2 : 1
  const complexityMultiplier = 1 + (complexity[0] - 1) * 0.3
  const estimatedPrice = Math.round(basePrice * urgencyMultiplier * complexityMultiplier)

  const handleGetQuote = () => {
    const urgencyText = urgency[0] === 1 ? 'Standard' : urgency[0] === 2 ? 'Rush (+50%)' : 'Emergency (+100%)'
    const complexityText = complexity[0] === 1 ? 'Simple' : complexity[0] === 2 ? 'Medium' : complexity[0] === 3 ? 'Complex' : 'Very Complex'
    
    const message = `🚀 **Smart Quote Request**\n\nHi Adil! I used your AI-powered price estimator:\n\n**Project:** ${currentService.name} - ${currentVariation.name}\n**Estimate:** $${estimatedPrice}\n**Urgency:** ${urgencyText}\n**Complexity:** ${complexityText}\n\nI'd love to discuss this project with you!`
    const whatsappUrl = `${externalLinks.whatsapp}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Card className="p-6 bg-gradient-subtle border-2 border-youtube-red/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-youtube-red" />
          <h3 className="text-xl font-semibold text-foreground">Pricing Calculator</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-youtube-red hover:text-youtube-red/80"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Estimate */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-youtube-red mb-2">
          ${estimatedPrice}
        </div>
        <p className="text-sm text-muted-foreground">
          Estimated price for {currentService.name} - {currentVariation.name}
        </p>
      </div>

      {/* Basic Options */}
      <div className="space-y-4">
        {/* Service Selection */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Service Type</Label>
          <RadioGroup value={selectedService} onValueChange={setSelectedService}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`service-${index}`} />
                  <Label htmlFor={`service-${index}`} className="text-sm cursor-pointer">
                    {service.name}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Variation Selection */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Package Type</Label>
          <RadioGroup value={selectedVariation} onValueChange={setSelectedVariation}>
            <div className="space-y-2">
              {currentService.variations.map((variation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`variation-${index}`} />
                    <Label htmlFor={`variation-${index}`} className="text-sm cursor-pointer">
                      {variation.name}
                    </Label>
                  </div>
                  <div className="text-sm font-medium text-youtube-red">
                    ${Math.round(currentService.basePrice * variation.multiplier)}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Advanced Options */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t space-y-4">
          {/* Urgency */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Urgency Level: {urgency[0] === 1 ? 'Standard' : urgency[0] === 2 ? 'Rush (+50%)' : 'Emergency (+100%)'}
            </Label>
            <Slider
              value={urgency}
              onValueChange={setUrgency}
              max={3}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Standard</span>
              <span>Rush</span>
              <span>Emergency</span>
            </div>
          </div>

          {/* Complexity */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Complexity Level: {complexity[0] === 1 ? 'Simple' : complexity[0] === 2 ? 'Medium' : complexity[0] === 3 ? 'Complex' : 'Very Complex'}
            </Label>
            <Slider
              value={complexity}
              onValueChange={setComplexity}
              max={4}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Simple</span>
              <span>Medium</span>
              <span>Complex</span>
              <span>Very Complex</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-6 pt-6 border-t">
        <Button 
          onClick={handleGetQuote}
          className="w-full bg-gradient-youtube hover:shadow-glow font-medium"
          size="lg"
        >
          Get Accurate Quote via WhatsApp
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          This is an estimate. Final price may vary based on specific requirements.
        </p>
      </div>
    </Card>
  )
}