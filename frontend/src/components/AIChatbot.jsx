import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Bot, User, Sparkles, Search, Globe } from 'lucide-react'

const INITIAL_MESSAGE = {
  id: 1,
  text: "Hello! I'm your PESITM Campus Assistant. How can I help you navigate or optimize your day today?",
  sender: 'bot',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const KNOWLEDGE_BASE = [
  { keywords: ["block a", "cse"], response: "Block A (CSE Wing) is located near the Main Entrance. It houses the Computer Science labs and the Department Office. I can open the Navigator for you to see the exact route!" },
  { keywords: ["energy", "save", "kwh"], response: "We've saved 128 kWh today! That's equivalent to planting 6 trees. Most of the savings came from the HVAC optimization in Block B. You can see the full breakdown in the Impact Dashboard." },
  { keywords: ["study", "quiet", "spot", "focus"], response: "Currently, Room A-207 and B-105 are 'Deep Work' zones with low noise and optimal CO2 levels (<600ppm). Would you like me to show you the way?" },
  { keywords: ["maintenance", "ac", "fault", "repair", "fix"], response: "I've flagged this for the Facility team. Please go to the 'Maintenance' page to track the status of your request." },
  { keywords: ["iot", "sensor", "device", "connectivity"], response: "Our campus has 30 IoT sensors active. Currently, 28 are online. Sensor PSTM-PIR-1002 in Block A is reporting high occupancy. You can monitor live readings in the 'IoT Sensors' tab." },
  { keywords: ["gate", "entrance", "sagar road"], response: "The main entrance is the Sagar Road Gate. It's the starting point for all our navigation routes." },
  { keywords: ["canteen", "food", "cafeteria"], response: "The campus canteen is located behind the Admin Block. It's currently showing moderate crowd levels." },
]

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (text = input) => {
    if (!text.trim()) return
    
    const userMsg = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const response = getAIResponse(text)
      const botMsg = {
        id: Date.now() + 1,
        ...response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 800)
  }

  const getAIResponse = (query) => {
    const q = query.toLowerCase()
    
    // Check knowledge base
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(k => q.includes(k))) {
        return { text: item.response, sender: 'bot' }
      }
    }

    if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
      return { text: "Hi there! I'm your digital twin assistant. How can I assist you with PESITM resources today?", sender: 'bot' }
    }

    // Default Fallback with "Google Suggestions" simulation
    return { 
      text: "I'm not entirely sure about that specific query. However, I've found some related suggestions for you:", 
      sender: 'bot',
      suggestions: [
        { label: `Search Google for "${query}"`, icon: Globe, link: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
        { label: "View Campus Map", icon: Map, internal: "/twin" },
        { label: "Contact Admin", icon: User, internal: "/settings" }
      ]
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border border-gray-100">
          {/* Header */}
          <div className="bg-navy p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center text-white shadow-inner">
                <Bot size={22} />
              </div>
              <div>
                <p className="text-body font-bold text-white leading-none">Campus AI Assistant</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-white/70 uppercase font-bold tracking-widest">Digital Twin Active</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white p-1 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-page/30 no-scrollbar">
            {messages.map(m => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-body shadow-sm ${
                  m.sender === 'user' 
                    ? 'bg-orange text-white rounded-tr-none' 
                    : 'bg-white text-navy border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  
                  {/* Internal Suggestions (buttons) */}
                  {m.suggestions && (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      {m.suggestions.map((s, idx) => (
                        <button 
                          key={idx}
                          onClick={() => s.link ? window.open(s.link, '_blank') : null}
                          className="w-full flex items-center gap-2 p-2 bg-page hover:bg-orange/5 text-navy text-label rounded-lg transition-colors border border-transparent hover:border-orange/20"
                        >
                          <s.icon size={14} className="text-orange" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className={`text-[10px] mt-1 ${m.sender === 'user' ? 'text-white/70' : 'text-textmute'}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange/40 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <span className="w-1.5 h-1.5 bg-orange/40 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <span className="w-1.5 h-1.5 bg-orange/40 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-50 bg-white">
            {["Find Room", "Energy Stats", "IoT Status", "Report Fix"].map(btn => (
              <button 
                key={btn}
                onClick={() => handleSend(btn)}
                className="whitespace-nowrap px-3 py-1 bg-page text-navy rounded-full text-label border border-gray-100 hover:border-orange/40 hover:text-orange transition-all font-medium"
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              className="flex-1 h-10 px-4 bg-page rounded-pill text-body focus:outline-none focus:ring-1 focus:ring-orange shadow-inner"
              placeholder="Type your campus query..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              className="w-10 h-10 bg-orange text-white rounded-full flex items-center justify-center hover:bg-orange/90 shadow-lg transition-all active:scale-90"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 ${
          isOpen ? 'bg-white text-navy rotate-90 border-2 border-navy' : 'bg-navy text-white hover:bg-navy/90 hover:scale-105'
        }`}
      >
        {isOpen ? <X size={28} /> : (
          <div className="relative">
            <Sparkles size={28} className="text-orange animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-navy rounded-full" />
          </div>
        )}
      </button>
    </div>
  )
}
