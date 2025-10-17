import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalSettingsProvider } from "@/components/global-settings-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProtectedRoute } from "@/components/protected-route";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Chatbot } from "@/components/chatbot";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { ReturningVisitorBanner } from "@/components/returning-visitor-banner";
import { AnalyticsConsentModal } from "@/components/analytics-consent-modal";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { ScrollToTop } from "@/components/scroll-to-top";
import { DynamicPageRenderer } from "@/components/dynamic-page-renderer";
import { DynamicFavicon } from "@/components/dynamic-favicon"
import { DynamicTheme } from "@/components/DynamicTheme";
import { ApiTest } from "@/components/ApiTest";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { Login, Register, Dashboard as UserDashboard, Profile as UserProfile, Tokens } from "./user/pages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="adil-portfolio-theme">
        <GlobalSettingsProvider>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <DynamicFavicon />
              <DynamicTheme />
              <Navigation />
              <ReturningVisitorBanner />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<ProtectedRoute requiredRoles={['admin', 'editor', 'viewer']}><Dashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requiredRoles={['admin']}><Dashboard /></ProtectedRoute>} />
                <Route path="/user/login" element={<Login />} />
                <Route path="/user/register" element={<Register />} />
                <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/user/tokens" element={<ProtectedRoute><Tokens /></ProtectedRoute>} />
                <Route path="/api-test" element={<ApiTest />} />
                <Route path="/page/:slug" element={<DynamicPageRenderer />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
              <Chatbot />
              <FloatingWhatsApp />
              <ExitIntentPopup />
              <AnalyticsConsentModal />
            </BrowserRouter>
                </ErrorBoundary>
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </GlobalSettingsProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
