import { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'

function AnalysisPage() {
  const location = useLocation()
  const repoUrl = location.state?.repoUrl || ''
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: `Analysis of ${repoUrl || 'the repository'} complete. How can I help you understand the codebase?` }
  ])
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newUserMsg = { id: messages.length + 1, role: 'user', text: inputValue }
    setMessages([...messages, newUserMsg])
    setInputValue('')

    // Mock bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        role: 'assistant',
        text: `I've analyzed the architecture related to "${inputValue}". The primary data flow involves the main controller and its associated middleware layers.`
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#000000] text-white font-inter overflow-hidden">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Section: Visualizations Area (70%) */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-white/5 relative z-10">
        <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
            </Link>
            <h2 className="text-lg font-semibold tracking-tight">
              Architecture <span className="text-blue-500">Explorer</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {repoUrl ? repoUrl.replace('https://github.com/', '') : 'repository'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
          {/* Mock Graph Containers */}
          <div className="w-full aspect-video bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="text-blue-500/20 text-8xl mb-4 font-bold select-none">FLOW</div>
            <h3 className="text-xl font-bold mb-2">System Architecture Flow</h3>
            <p className="text-gray-500 text-sm max-w-md text-center">Interactive mapping of service communications and data pipelines.</p>
          </div>

          <div className="w-full aspect-video bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="text-purple-500/20 text-8xl mb-4 font-bold select-none">TREE</div>
            <h3 className="text-xl font-bold mb-2">Dependency Tree</h3>
            <p className="text-gray-500 text-sm max-w-md text-center">Hierarchical visualization of internal modules and third-party libraries.</p>
          </div>

          <div className="w-full aspect-square md:aspect-video bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="text-cyan-500/20 text-8xl mb-4 font-bold select-none">LOGIC</div>
            <h3 className="text-xl font-bold mb-2">Business Logic Map</h3>
            <p className="text-gray-500 text-sm max-w-md text-center">Tracing functional execution paths and state transitions.</p>
          </div>
        </main>
      </div>

      {/* Right Section: Chatbot Panel (30% / 350px on desktop) */}
      <div className="w-full md:w-[380px] flex flex-col h-[500px] md:h-screen bg-[#050505] relative z-10 border-l border-white/5">
        <header className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Codebase AI</h2>
        </header>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#080808] border-t border-white/5">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about this repository..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
          <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-tighter">Powered by Codebase GPS Engine</p>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
