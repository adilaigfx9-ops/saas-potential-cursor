import { useState, useEffect } from 'react'

export interface ServicePackage {
  name: string
  price: string
  timeline: string
  features: string[]
  popular?: boolean
}

export interface PublicService {
  id: number
  title: string
  subtitle: string
  description: string
  icon: string
  packages: ServicePackage[]
  category?: string
  slug?: string
}

export function usePublicServices() {
  const [services, setServices] = useState<PublicService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/services.php`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Transform database services to match the expected format
        const transformedServices = (Array.isArray(data.data.services) ? data.data.services : []).map((service: any) => ({
          id: service.id,
          title: service.title || service.name,
          subtitle: service.subtitle || service.tagline || 'Professional Service',
          description: service.description,
          icon: service.icon || '🎨',
          packages: service.packages || service.pricing_tiers || [
            {
              name: `Basic ${service.name}`,
              price: `Starting at $${service.base_price || 99}`,
              timeline: service.delivery_time || '3-5 days',
              features: service.features || [
                'Professional design',
                'High quality output',
                '2 revisions included'
              ]
            }
          ],
          category: service.category_name,
          slug: service.slug,
          popular: service.popular
        }))
        
        setServices(transformedServices)
      } else {
        throw new Error(data.error || 'Failed to load services')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
      console.error('Services fetch error:', err)
      
      // Fallback to hardcoded services if API fails
      setServices([
        {
          id: 1,
          title: "Logo Design",
          subtitle: "Professional Brand Identity",
          description: "Create a memorable logo that builds trust and recognition for your brand.",
          icon: "🎨",
          packages: [
            {
              name: "Basic Logo",
              price: "Starting at $149",
              timeline: "2-3 days",
              features: [
                "1 Logo concept",
                "2 Revisions included",
                "PNG & JPG files",
                "Basic style guide"
              ]
            },
            {
              name: "Standard Logo",
              price: "Starting at $249",
              timeline: "3-5 days",
              features: [
                "3 Logo concepts",
                "5 Revisions included",
                "All file formats (PNG, JPG, SVG, PDF)",
                "Complete style guide",
                "Business card design"
              ],
              popular: true
            },
            {
              name: "Premium Logo",
              price: "Starting at $399",
              timeline: "5-7 days",
              features: [
                "5 Logo concepts",
                "Unlimited revisions",
                "All file formats + source files",
                "Complete brand identity package",
                "Business card + letterhead design",
                "Social media kit"
              ]
            }
          ]
        },
        {
          id: 2,
          title: "YouTube Thumbnails",
          subtitle: "High-Converting Designs",
          description: "Eye-catching thumbnails that increase your click-through rates and grow your channel.",
          icon: "📺",
          packages: [
            {
              name: "Single Thumbnail",
              price: "Starting at $49",
              timeline: "24-48 hours",
              features: [
                "1 Custom thumbnail",
                "2 Revisions included",
                "High-resolution (1920x1080)",
                "YouTube optimized"
              ]
            },
            {
              name: "Thumbnail Pack",
              price: "Starting at $199",
              timeline: "3-5 days",
              features: [
                "5 Custom thumbnails",
                "3 Revisions per thumbnail",
                "High-resolution files",
                "Consistent branding",
                "A/B testing variations"
              ],
              popular: true
            },
            {
              name: "Monthly Retainer",
              price: "Starting at $799",
              timeline: "Ongoing",
              features: [
                "20 Thumbnails per month",
                "Unlimited revisions",
                "Priority support",
                "Consistent branding",
                "Performance analytics",
                "Custom templates"
              ]
            }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return {
    services,
    loading,
    error,
    refetch: fetchServices
  }
}