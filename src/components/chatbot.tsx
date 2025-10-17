import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X, User, Bot, Star, FileText, Phone, Sparkles, Zap, Lightbulb, TrendingUp, Clock, CheckCircle, ArrowRight, ExternalLink, Mic, MicOff, Camera, Image, Download, Share2, Heart, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAnalytics } from "@/utils/analytics"

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
  quickReplies?: string[]
  type?: 'text' | 'image' | 'video' | 'file' | 'pricing' | 'portfolio' | 'booking'
  metadata?: any
  suggestions?: string[]
  actions?: ChatAction[]
}

interface ChatAction {
  label: string
  action: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

interface LeadData {
  name?: string
  email?: string
  whatsapp?: string
  project?: string
  budget?: string
  timeline?: string
  experience?: string
}

interface ChatbotProps {
  className?: string
}

const ENHANCED_BOT_RESPONSES = {
  greeting: {
    text: "🚀 **Welcome to Adil GFX!** I'm your AI-powered creative assistant, enhanced with advanced capabilities to help you succeed.\n\nI can help you with:\n• **Smart Project Planning** - AI-powered project recommendations\n• **Dynamic Pricing** - Real-time cost calculations\n• **Portfolio Analysis** - Personalized design suggestions\n• **Growth Strategy** - YouTube & social media optimization\n• **Instant Quotes** - Get accurate estimates in seconds\n\nWhat would you like to explore today?",
    quickReplies: ["Get Smart Quote", "View Portfolio", "Project Planning", "Growth Strategy", "Book Consultation"],
    type: 'text'
  },
  
  smartQuote: {
    text: "💰 **Smart Pricing Calculator**\n\nI'll analyze your project requirements and provide the most accurate pricing based on:\n• Project complexity & scope\n• Current market rates\n• Your specific needs\n• Timeline requirements\n\nLet me gather some details to give you the best quote possible!",
    quickReplies: ["Logo Design", "YouTube Thumbnails", "Video Editing", "Complete Branding", "Channel Setup"],
    type: 'pricing'
  },

  portfolio: {
    text: "🎨 **Portfolio Showcase**\n\nHere are some of my recent high-converting designs:\n\n**🔥 Top Performers:**\n• YouTube Thumbnail - 2.3M views\n• Logo Design - Generated $50K+ revenue\n• Video Edit - 500K+ engagement\n\n**📊 Success Metrics:**\n• 98% client satisfaction rate\n• Average 340% ROI increase\n• 24-48 hour delivery\n\nWould you like to see specific examples or case studies?",
    quickReplies: ["Show Thumbnails", "Logo Examples", "Video Samples", "Case Studies", "Success Stories"],
    type: 'portfolio'
  },

  projectPlanning: {
    text: "📋 **AI Project Planning**\n\nI'll create a personalized project roadmap for you:\n\n**🎯 What I'll analyze:**\n• Your brand goals & objectives\n• Target audience & market\n• Competitor analysis\n• Content strategy\n• Timeline optimization\n\n**📈 Expected outcomes:**\n• 3x faster project completion\n• 40% higher engagement rates\n• Professional brand consistency\n\nReady to start your project planning?",
    quickReplies: ["Start Planning", "Brand Analysis", "Content Strategy", "Timeline Planning", "Competitor Research"],
    type: 'text'
  },

  growthStrategy: {
    text: "📈 **Growth Strategy Consultation**\n\n**🚀 Proven Growth Methods:**\n• YouTube SEO optimization\n• Thumbnail A/B testing\n• Content calendar planning\n• Audience engagement tactics\n• Revenue optimization\n\n**📊 Track Record:**\n• 500+ channels grown\n• Average 300% subscriber increase\n• 2.5M+ total views generated\n• $1M+ revenue created for clients\n\nLet's discuss your growth goals!",
    quickReplies: ["YouTube Growth", "Content Strategy", "SEO Optimization", "Revenue Growth", "Audience Building"],
    type: 'text'
  },

  booking: {
    text: "📅 **Book Your Free Consultation**\n\n**🎯 What you'll get:**\n• 30-minute strategy session\n• Personalized growth plan\n• Project timeline & pricing\n• Exclusive design samples\n• Priority support access\n\n**⏰ Available slots:**\n• Today: 2 PM, 4 PM, 6 PM\n• Tomorrow: 10 AM, 2 PM, 4 PM\n• This week: Multiple slots\n\n**🎁 Bonus:** Free brand audit worth $299!",
    quickReplies: ["Book Today", "Schedule Tomorrow", "View Calendar", "Quick Call", "WhatsApp Chat"],
    type: 'booking'
  }
}

const SMART_SUGGESTIONS = [
  "Show me your best YouTube thumbnails",
  "What's the cost for a complete brand identity?",
  "How can I grow my YouTube channel?",
  "I need a logo for my startup",
  "What's your turnaround time?",
  "Can you help with video editing?",
  "Show me your portfolio",
  "I want to book a consultation"
]

const QUICK_ACTIONS = [
  { label: "Smart Quote", action: "smart_quote", icon: "Zap", variant: "primary" as const },
  { label: "Portfolio", action: "portfolio", icon: "Image", variant: "secondary" as const },
  { label: "Book Call", action: "booking", icon: "Phone", variant: "outline" as const },
  { label: "Growth Plan", action: "growth_strategy", icon: "TrendingUp", variant: "outline" as const }
]

export function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: ENHANCED_BOT_RESPONSES.greeting.text,
      isBot: true,
      timestamp: new Date(),
      quickReplies: ENHANCED_BOT_RESPONSES.greeting.quickReplies,
      type: 'text',
      suggestions: SMART_SUGGESTIONS.slice(0, 4)
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [leadData, setLeadData] = useState<LeadData>({})
  const [collectingLead, setCollectingLead] = useState(false)
  const [leadStep, setLeadStep] = useState<'name' | 'email' | 'whatsapp' | 'project' | 'budget' | 'timeline' | 'complete'>('name')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [typingProgress, setTypingProgress] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [chatHistory, setChatHistory] = useState<string[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { trackEvent } = useAnalytics()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const addMessage = (text: string, isBot: boolean = false, options: Partial<Message> = {}) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isBot,
      timestamp: new Date(),
      type: 'text',
      ...options
    }
    setMessages(prev => [...prev, newMessage])
    
    // Track message analytics
    if (isBot) {
      trackEvent('chatbot_response', { message_type: options.type || 'text' })
    } else {
      trackEvent('user_message', { message_length: text.length })
    }
  }

  const simulateTyping = async (response: any, delay: number = 1000) => {
    setIsTyping(true)
    setTypingProgress(0)
    
    // Simulate typing progress
    for (let i = 0; i <= 100; i += 10) {
      setTypingProgress(i)
      await new Promise(resolve => setTimeout(resolve, delay / 10))
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    addMessage(response.text, true, {
      quickReplies: response.quickReplies,
      type: response.type,
      suggestions: response.suggestions,
      actions: response.actions
    })
    
    setIsTyping(false)
    setTypingProgress(0)
  }

  const getEnhancedBotResponse = (userMessage: string): any => {
    const message = userMessage.toLowerCase()
    
    // Smart keyword detection with enhanced responses
    if (message.includes('quote') || message.includes('price') || message.includes('cost') || message.includes('budget')) {
      return ENHANCED_BOT_RESPONSES.smartQuote
    }
    
    if (message.includes('portfolio') || message.includes('work') || message.includes('example') || message.includes('show')) {
      return ENHANCED_BOT_RESPONSES.portfolio
    }
    
    if (message.includes('plan') || message.includes('strategy') || message.includes('project')) {
      return ENHANCED_BOT_RESPONSES.projectPlanning
    }
    
    if (message.includes('grow') || message.includes('growth') || message.includes('youtube') || message.includes('channel')) {
      return ENHANCED_BOT_RESPONSES.growthStrategy
    }
    
    if (message.includes('book') || message.includes('call') || message.includes('consultation') || message.includes('meeting')) {
      return ENHANCED_BOT_RESPONSES.booking
    }
    
    if (message.includes('start') || message.includes('begin') || message.includes('hire') || message.includes('work with')) {
      setCollectingLead(true)
      setLeadStep('name')
      return { 
        text: "🚀 **Excellent choice!** Let's get you started with a personalized approach.\n\nI'll need a few quick details to provide you with the most accurate quote and recommendations:\n\n**First, what's your name?**",
        quickReplies: undefined,
        type: 'text'
      }
    }
    
    // Default enhanced response
    return {
      text: "🤖 **I'm here to help!** I can assist you with:\n\n**💡 Smart Features:**\n• AI-powered project recommendations\n• Real-time pricing calculations\n• Personalized portfolio suggestions\n• Growth strategy planning\n• Instant consultation booking\n\n**🎯 Quick Actions:**",
      quickReplies: ["Get Smart Quote", "View Portfolio", "Project Planning", "Book Consultation"],
      type: 'text',
      actions: QUICK_ACTIONS
    }
  }

  const handleLeadCollection = (userMessage: string) => {
    switch (leadStep) {
      case 'name':
        setLeadData(prev => ({ ...prev, name: userMessage }))
        setLeadStep('email')
        addMessage(`**Great to meet you, ${userMessage}!** 📧\n\nWhat's your email address? I'll send you a detailed project proposal and exclusive design samples.`, true)
        break
        
      case 'email':
        setLeadData(prev => ({ ...prev, email: userMessage }))
        setLeadStep('whatsapp')
        addMessage("**Perfect!** 📱\n\nWhat's your WhatsApp number? This helps me send quick updates, share files, and provide instant support during your project.", true)
        break
        
      case 'whatsapp':
        setLeadData(prev => ({ ...prev, whatsapp: userMessage }))
        setLeadStep('project')
        addMessage("**Awesome!** 🎨\n\nTell me about your project. What type of design work do you need? Be as specific as possible - this helps me give you the most accurate quote!", true, {
          quickReplies: ["Logo Design", "YouTube Thumbnails", "Video Editing", "Complete Branding", "Channel Setup"]
        })
        break
        
      case 'project':
        setLeadData(prev => ({ ...prev, project: userMessage }))
        setLeadStep('budget')
        addMessage("**Excellent choice!** 💰\n\nWhat's your budget range for this project? This helps me recommend the perfect package for your needs.", true, {
          quickReplies: ["Under $500", "$500-$1000", "$1000-$2500", "$2500+", "Not sure"]
        })
        break
        
      case 'budget':
        setLeadData(prev => ({ ...prev, budget: userMessage }))
        setLeadStep('timeline')
        addMessage("**Perfect!** ⏰\n\nWhen do you need this project completed? I offer flexible timelines to match your schedule.", true, {
          quickReplies: ["ASAP (Rush)", "Within 1 week", "1-2 weeks", "2-4 weeks", "Flexible"]
        })
        break
        
      case 'timeline':
        setLeadData(prev => ({ ...prev, timeline: userMessage }))
        setLeadStep('complete')
        setCollectingLead(false)
        
        const finalMessage = `**🎉 Perfect! Here's your personalized project summary:**

**👤 Client:** ${leadData.name}
**📧 Email:** ${leadData.email}
**📱 WhatsApp:** ${leadData.whatsapp}
**🎨 Project:** ${userMessage}
**💰 Budget:** ${leadData.budget}
**⏰ Timeline:** ${userMessage}

**🚀 Next Steps:**
• I'll send you a detailed proposal within 2 hours
• You'll receive exclusive design samples
• We'll schedule a free 30-minute strategy call
• You'll get priority support throughout the project

**🎁 Bonus:** Free brand audit worth $299 included!

Would you like to schedule your free consultation call now?`
        
        addMessage(finalMessage, true, {
          quickReplies: ["Schedule Call", "View Portfolio", "WhatsApp Me", "Send Proposal", "I'm Ready"],
          actions: [
            { label: "Book Consultation", action: "book_call", icon: "Phone", variant: "primary" },
            { label: "View Portfolio", action: "portfolio", icon: "Image", variant: "secondary" },
            { label: "WhatsApp Chat", action: "whatsapp", icon: "MessageCircle", variant: "outline" }
          ]
        })
        break
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    addMessage(inputValue, false)
    setChatHistory(prev => [...prev, inputValue])
    setShowSuggestions(false)
    
    if (collectingLead) {
      handleLeadCollection(inputValue)
    } else {
      setTimeout(async () => {
        const response = getEnhancedBotResponse(inputValue)
        await simulateTyping(response, 1500)
      }, 500)
    }
    
    setInputValue("")
  }

  const handleQuickReply = (reply: string) => {
    addMessage(reply, false)
    setShowSuggestions(false)
    
    if (collectingLead) {
      handleLeadCollection(reply)
    } else {
      setTimeout(async () => {
        const response = getEnhancedBotResponse(reply)
        await simulateTyping(response, 1000)
      }, 300)
    }
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'smart_quote':
        handleQuickReply('Get Smart Quote')
        break
      case 'portfolio':
        handleQuickReply('Show Portfolio')
        break
      case 'booking':
        handleQuickReply('Book Consultation')
        break
      case 'growth_strategy':
        handleQuickReply('Growth Strategy')
        break
      case 'book_call':
        window.open('https://calendly.com/adilgfx/consultation', '_blank')
        break
      case 'whatsapp':
        window.open('https://wa.me/1234567890?text=Hi%20Adil!%20I%20want%20to%20discuss%20my%20project.', '_blank')
        break
      case 'portfolio':
        window.open('/portfolio', '_blank')
        break
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
  }

  return (
    <>
      {/* Enhanced Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[600px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col animate-fade-in">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold text-sm">Adil's AI Assistant</div>
                <div className="text-xs opacity-90 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Enhanced with AI
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs ${message.isBot ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-lg p-3 ${
                    message.isBot 
                      ? 'bg-white border border-gray-200 shadow-sm' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                  }`}>
                    <div className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ 
                      __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                    
                    {message.type === 'pricing' && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <div className="flex items-center text-yellow-800">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          Smart pricing activated
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {message.quickReplies && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs h-6 px-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}

                  {message.actions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant || "outline"}
                          size="sm"
                          onClick={() => handleAction(action.action)}
                          className="text-xs h-8 px-3"
                        >
                          {action.icon && <FileText className="h-3 w-3 mr-1" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {message.suggestions && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-6 px-2 text-gray-600 hover:bg-gray-100"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`flex items-end ${message.isBot ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isBot ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gray-200'
                  }`}>
                    {message.isBot ? (
                      <Sparkles className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">AI is thinking...</div>
                      <Progress value={typingProgress} className="h-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showSuggestions && messages.length === 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-800 mb-2 font-medium">💡 Try asking:</div>
                <div className="flex flex-wrap gap-1">
                  {SMART_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-6 px-2 text-blue-700 hover:bg-blue-100"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about design, pricing, or growth..."
                  className="pr-10 text-sm"
                />
                {inputValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputValue("")}
                    className="absolute right-1 top-1 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Voice
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Image className="h-3 w-3 mr-1" />
                  Image
                </Button>
              </div>
              <div className="text-xs text-gray-400">
                Powered by AI • Enhanced responses
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Floating Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-2xl transition-all duration-300 hover:scale-110 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Sparkles className="h-6 w-6 text-white" />
          )}
        </Button>
        
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
        )}
        
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
        )}
      </div>
    </>
  )
}
