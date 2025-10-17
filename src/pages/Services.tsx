import { CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PricingCalculator } from "@/components/pricing-calculator"
import { SEOHead } from "@/components/seo-head"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalytics } from "@/utils/analytics"
import { usePublicServices } from "@/hooks/usePublicServices"
import { useSiteLinks } from "@/hooks/useSiteLinks"

export default function Services() {
  const { services, loading, error } = usePublicServices()
  const { links } = useSiteLinks()
  const { trackEvent } = useAnalytics()

  const handlePackageClick = (serviceName: string, packageName: string) => {
    trackEvent('service_package_click', {
      service: serviceName,
      package: packageName
    })
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Services & Pricing - Professional Design Services | Adil GFX"
          description="Professional logo design, YouTube thumbnails, video editing, and branding services. Transparent pricing, fast delivery, and unlimited revisions."
          url="https://adilgfx.com/services"
        />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Skeleton className="h-12 w-96 mx-auto mb-4" />
              <Skeleton className="h-6 w-[600px] mx-auto" />
            </div>
            <div className="space-y-20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-8">
                  <Skeleton className="h-8 w-64 mx-auto" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-96 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  if (error || services.length === 0) {
    return (
      <>
        <SEOHead 
          title="Services & Pricing - Professional Design Services | Adil GFX"
          description="Professional logo design, YouTube thumbnails, video editing, and branding services. Transparent pricing, fast delivery, and unlimited revisions."
          url="https://adilgfx.com/services"
        />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <h1 className="text-4xl font-bold text-foreground mb-4">Services Coming Soon</h1>
              <p className="text-muted-foreground mb-8">We're updating our services. Please check back later or contact us directly.</p>
              <Button onClick={() => window.location.href = links.contact}>Contact Us</Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <SEOHead
        title="Services & Pricing - Professional Design Services | Adil GFX"
        description="Transparent pricing for logo design, YouTube thumbnails, video editing, and complete branding. Choose packages that fit your budget or get a custom quote."
        keywords="logo design pricing, YouTube thumbnail service, video editing rates, branding packages"
        url="https://adilgfx.com/services"
      />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Services & <span className="text-gradient-youtube">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transparent pricing, no hidden fees. Choose the package that fits your needs or get a custom quote for larger projects.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-20">
            {services.map((service, index) => (
              <div key={service.id || index} className="space-y-8">
                {/* Service Header */}
                <div className="text-center">
                  <div className="text-6xl mb-4">{service.icon}</div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">{service.title}</h2>
                  <p className="text-lg text-muted-foreground mb-4">{service.subtitle}</p>
                  <p className="text-muted-foreground max-w-2xl mx-auto">{service.description}</p>
                </div>

                {/* Packages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {service.packages?.map((pkg, pkgIndex) => (
                    <div 
                      key={pkgIndex}
                      className={`relative bg-card rounded-xl border p-8 transition-all duration-300 hover:shadow-premium ${
                        pkg.popular ? 'ring-2 ring-youtube-red shadow-premium' : 'hover:border-youtube-red/30'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-youtube text-white px-4 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">{pkg.name}</h3>
                        <div className="text-3xl font-bold text-youtube-red mb-2">${pkg.price}</div>
                        <div className="flex items-center justify-center text-muted-foreground text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {pkg.duration || pkg.timeline}
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {pkg.features?.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-youtube-red mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className={`w-full font-medium ${
                          pkg.popular 
                            ? 'bg-gradient-youtube hover:shadow-glow' 
                            : 'bg-muted hover:bg-muted-foreground/10'
                        }`}
                        onClick={() => handlePackageClick(service.title, pkg.name)}
                      >
                        Get Started
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculator */}
          <div className="mt-20 bg-gradient-subtle rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Not Sure What You Need?
              </h2>
              <p className="text-muted-foreground">
                Use our pricing calculator to get an instant estimate for your project.
              </p>
            </div>
            <PricingCalculator />
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-card rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have questions about our services or need a custom package? Let's discuss your project and find the perfect solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-youtube hover:shadow-glow font-medium px-8"
                onClick={() => window.location.href = links.contact}
              >
                Start Your Project
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-medium px-8"
                onClick={() => window.location.href = links.portfolio}
              >
                View Portfolio
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}