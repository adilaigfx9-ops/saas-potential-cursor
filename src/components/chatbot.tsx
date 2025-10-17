import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X, User, Bot, Star, FileText, Phone, Sparkles, Zap, Lightbulb, TrendingUp, Clock, CheckCircle, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
  quickReplies?: string[]
}

interface LeadData {
  name?: string
  email?: string
  whatsapp?: string
  project?: string
  budget?: string
}

const botResponses = {
  greeting: "👋 Hi! I'm Adi's Creative Assistant. I'm here to help you with any questions about design services, pricing, or getting started. What brings you here today?",
  services: "🎨 I offer these design services:\n\n• Logo Design (from $149)\n• YouTube Thumbnails (from $49)\n• Video Editing (from $299)\n• Complete Branding Packages\n• YouTube Channel Setup & SEO\n\nWhich service interests you most?",
  pricing: "💰 Pricing depends on your specific project requirements. I offer:\n\n• Basic packages starting from $49\n• Custom quotes for larger projects\n• Bundle discounts for multiple services\n\nWhat type of project are you working on?",
  process: "⚡ Here's how we work together:\n\n1. Free consultation call\n2. Project scope & timeline discussion\n3. 50% deposit to start\n4. Design phase with unlimited revisions\n5. Final delivery in all formats\n\nTypical delivery: 24-48 hours. Ready to start?",
  portfolio: "🏆 Check out my work:\n\n• 500+ happy clients worldwide\n• Projects that generated millions in revenue\n• 5-star rating on all platforms\n\nView my full portfolio at /portfolio or would you like me to show you specific examples?",
  contact: "📞 Let's connect! I can help you through:\n\n• WhatsApp: Quick chat and file sharing\n• Email: Detailed project discussions\n• Zoom call: Free 15-min consultation\n\nWhat works best for you?",
  default: "I'm here to help! You can ask me about:\n\n• Services & pricing\n• Portfolio examples\n• How we work together\n• Getting started\n\nWhat would you like to know?"
}

const quickReplies = {
  initial: ["View Services", "See Pricing", "Check Portfolio", "Start Project"],
  services: ["Logo Design", "YouTube Thumbnails", "Video Editing", "Get Quote"],
  pricing: ["Basic Package", "Custom Quote", "View Examples", "Contact Me"],
  contact: ["WhatsApp Chat", "Schedule Call", "Send Email", "Get Started"]
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: botResponses.greeting,
      isBot: true,
      timestamp: new Date(),
      quickReplies: quickReplies.initial
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [leadData, setLeadData] = useState<LeadData>({})
  const [collectingLead, setCollectingLead] = useState(false)
  const [leadStep, setLeadStep] = useState<'name' | 'email' | 'whatsapp' | 'project' | 'complete'>('name')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const addMessage = (text: string, isBot: boolean = false, quickReplies?: string[]) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isBot,
      timestamp: new Date(),
      quickReplies: isBot ? quickReplies : undefined
    }
    setMessages(prev => [...prev, newMessage])
  }

  const getBotResponse = (userMessage: string): { text: string; quickReplies?: string[] } => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('service') || message.includes('what do you') || message.includes('offer')) {
      return { text: botResponses.services, quickReplies: quickReplies.services }
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('budget') || message.includes('quote')) {
      return { text: botResponses.pricing, quickReplies: quickReplies.pricing }
    }
    
    if (message.includes('portfolio') || message.includes('work') || message.includes('example')) {
      return { text: botResponses.portfolio, quickReplies: ["View Portfolio", "See Case Studies", "Get Quote"] }
    }
    
    if (message.includes('process') || message.includes('how') || message.includes('work together')) {
      return { text: botResponses.process, quickReplies: ["Start Project", "Get Quote", "Schedule Call"] }
    }
    
    if (message.includes('contact') || message.includes('reach') || message.includes('call') || message.includes('whatsapp')) {
      return { text: botResponses.contact, quickReplies: quickReplies.contact }
    }
    
    if (message.includes('start') || message.includes('begin') || message.includes('hire') || message.includes('work with')) {
      setCollectingLead(true)
      setLeadStep('name')
      return { 
        text: "🚀 Excellent! Let's get you started. I'll need a few details to provide you with the best service.\n\nFirst, what's your name?", 
        quickReplies: undefined 
      }
    }
    
    return { text: botResponses.default, quickReplies: quickReplies.initial }
  }

  const handleLeadCollection = (userMessage: string) => {
    switch (leadStep) {
      case 'name':
        setLeadData(prev => ({ ...prev, name: userMessage }))
        setLeadStep('email')
        addMessage(`Great to meet you, ${userMessage}! 📧 What's your email address?`, true)
        break
        
      case 'email':
        setLeadData(prev => ({ ...prev, email: userMessage }))
        setLeadStep('whatsapp')
        addMessage("Perfect! 📱 What's your WhatsApp number? (This helps me send quick updates)", true)
        break
        
      case 'whatsapp':
        setLeadData(prev => ({ ...prev, whatsapp: userMessage }))
        setLeadStep('project')
        addMessage("Awesome! 🎨 Tell me about your project. What type of design work do you need?", true, ["Logo Design", "YouTube Thumbnails", "Video Editing", "Complete Branding"])
        break
        
      case 'project':
        setLeadData(prev => ({ ...prev, project: userMessage }))
        setLeadStep('complete')
        setCollectingLead(false)
        
        const finalMessage = `✨ Perfect! Here's what I've noted:
        
👤 Name: ${leadData.name}
📧 Email: ${leadData.email}
📱 WhatsApp: ${leadData.whatsapp}
🎨 Project: ${userMessage}

I'll reach out within 2 hours with a custom quote and next steps. In the meantime, feel free to check out my portfolio!

Would you like to schedule a free 15-minute consultation call?`
        
        addMessage(finalMessage, true, ["Schedule Call", "View Portfolio", "WhatsApp Me", "I'm Ready"])
        break
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    addMessage(inputValue, false)
    
    if (collectingLead) {
      handleLeadCollection(inputValue)
    } else {
      setTimeout(() => {
        const response = getBotResponse(inputValue)
        addMessage(response.text, true, response.quickReplies)
      }, 1000)
    }
    
    setInputValue("")
  }

  const handleQuickReply = (reply: string) => {
    addMessage(reply, false)
    
    if (collectingLead) {
      handleLeadCollection(reply)
    } else {
      setTimeout(() => {
        const response = getBotResponse(reply)
        addMessage(response.text, true, response.quickReplies)
      }, 500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-80 h-96 bg-card border border-border rounded-xl shadow-glow z-50 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-youtube text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Adi's Creative Assistant</div>
                <div className="text-xs opacity-90">Usually replies instantly</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs ${message.isBot ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-lg p-3 ${
                    message.isBot 
                      ? 'bg-muted text-foreground' 
                      : 'bg-gradient-youtube text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                  
                  {message.quickReplies && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs h-6 px-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`flex items-end ${message.isBot ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.isBot ? 'bg-gradient-youtube' : 'bg-muted'
                  }`}>
                    {message.isBot ? (
                      <Bot className="h-3 w-3 text-white" />
                    ) : (
                      <User className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gradient-youtube hover:shadow-glow"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 hover:scale-110 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Bot className="h-6 w-6 text-white" />
          )}
        </Button>
        
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
        )}
      </div>
    </>
  )
}