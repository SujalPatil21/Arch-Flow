import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  useReactFlow 
} from 'reactflow'
import { Search, Send, ArrowLeft, Cpu, Terminal, Sparkles } from 'lucide-react'
import { mockAnalysis } from './data/mockAnalysis'
import { analyzeRepository, queryCodebase } from './services/api'

const DEFAULT_NODE_STYLE = {
  background: '#111111',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '10px',
  fontSize: '12px',
  width: 150,
  textAlign: 'center',
  transition: 'all 0.3s ease'
};

const HIGHLIGHT_NODE_STYLE = {
  background: 'rgba(59, 130, 246, 0.2)',
  color: '#fff',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '10px',
  fontSize: '12px',
  width: 150,
  textAlign: 'center',
  boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
  transition: 'all 0.3s ease'
};

function AnalysisPage() {
  const location = useLocation()
  const repoUrl = location.state?.repoUrl || ''
  const { setCenter } = useReactFlow()
  
  // 1. Core State
  const [analysisResult, setAnalysisResult] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(true) 
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // 2. Refs for Stale State Protection
  const nodesRef = useRef(nodes)
  const scrollRef = useRef(null)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  // 3. Graph Synchronization Logic
  const syncGraph = useCallback((result) => {
    if (!result || !result.graph) return;

    const rfNodes = result.graph.nodes.map(node => ({
      id: node.id,
      position: node.position || { x: 0, y: 0 },
      data: { label: node.label },
      style: DEFAULT_NODE_STYLE
    }));

    const rfEdges = result.graph.edges.map((edge, idx) => ({
      id: `e-${edge.source}-${edge.target}-${idx}`,
      source: edge.source,
      target: edge.target,
      animated: true,
      style: { stroke: 'rgba(255, 255, 255, 0.1)' }
    }));

    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [setNodes, setEdges]);

  // Initial Analysis Trigger
  useEffect(() => {
    const triggerAnalysis = async () => {
      try {
        setError(null);
        setIsLoading(true);
        setShowSuccess(false);
        const result = await analyzeRepository(repoUrl);
        
        if (result.error) {
          setError(result.message || "Unable to access this repository. Please check if it is public or try another link.");
          setIsLoading(false);
          return;
        }

        setAnalysisResult(result);
        syncGraph(result);
        
        // Success Moment
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        setMessages([
          { id: 1, role: 'assistant', text: `Analysis of ${repoUrl || 'the repository'} complete. I've mapped the core architecture. How can I help you explore it?` }
        ]);
      } catch (err) {
        console.error("Initial Analysis Error:", err);
        setError("Unable to access this repository. Please check if it is public or try another link.");
      } finally {
        setIsLoading(false);
      }
    };

    triggerAnalysis();
  }, [repoUrl, syncGraph]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 4. Query & UI Logic
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userQuery = inputValue
    const newUserMsg = { id: Date.now(), role: 'user', text: userQuery }
    setMessages(prev => [...prev, newUserMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      // API Call to Backend
      const response = await queryCodebase(userQuery, analysisResult);

      const botResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.answer
      }
      setMessages(prev => [...prev, botResponse])

      // 5. Highlight Logic (Refined)
      setNodes((nds) => nds.map(node => {
        const isHighlighted = response.highlightNodes.includes(node.id);
        return {
          ...node,
          style: isHighlighted ? HIGHLIGHT_NODE_STYLE : DEFAULT_NODE_STYLE
        };
      }));

      // 6. Zoom Logic (50ms Tactical Delay)
      if (response.focusNode) {
        setTimeout(() => {
          const targetNode = nodesRef.current.find(n => n.id === response.focusNode);
          if (targetNode) {
            setCenter(targetNode.position.x + 75, targetNode.position.y + 25, { 
              zoom: 1.5, 
              duration: 800 
            });
          }
        }, 50);
      }

    } catch (error) {
      console.error("Query Error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: "I encountered an issue connecting to the analysis engine. However, I can still show you the primary entry points of the system."
      }
      setMessages(prev => [...prev, errorMsg])
      
      // Fallback Highlights
      const fallbackNodes = analysisResult.views.entryPoints;
      setNodes(nds => nds.map(n => ({
        ...n,
        style: fallbackNodes.includes(n.id) ? HIGHLIGHT_NODE_STYLE : DEFAULT_NODE_STYLE
      })));
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-transparent text-white font-inter overflow-hidden">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Section: Visualizations Area (70%) */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-white/5 relative z-10">
        <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between backdrop-blur-md bg-black/20">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            </Link>
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              Architecture <span className="text-blue-500">Explorer</span>
            </h2>
          </div>
          <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
            {repoUrl ? repoUrl.replace('https://github.com/', '') : 'DEMO_MODE'}
          </div>
        </header>

        <main className={`flex-1 relative transition-all duration-700 ${isLoading || error ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {/* Muted Info Bar */}
          {analysisResult && !error && !isLoading && (
            <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center py-3 bg-black/40 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 uppercase tracking-widest">
                <span>{analysisResult.metadata.totalFiles} Files</span>
                <span className="opacity-30">•</span>
                <span>{Object.keys(analysisResult.views.byFolder || {}).length} Folders</span>
              </div>
              {analysisResult.metadata.totalFiles > 1500 && (
                <span className="text-[9px] text-gray-600 mt-1">Large repository detected — showing key files for performance</span>
              )}
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            style={{ background: 'transparent' }}
          >
            <Background color="#333" gap={20} />
            <Controls />
          </ReactFlow>
          
          {/* Overlay info */}
          <div className="absolute bottom-8 right-8 z-20 flex gap-4">
               <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-gray-400 font-mono uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Direct Map: 100%
               </div>
          </div>
        </main>

        {/* LOADING OVERLAY */}
        {isLoading && (
          <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-xl flex items-center justify-center transition-opacity duration-500">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-medium tracking-tight text-white/90">Analyzing repository...</h3>
              <p className="text-gray-500 text-sm mt-2">Mapping architectural dependencies</p>
            </div>
          </div>
        )}

        {/* SUCCESS BANNER */}
        <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-[110] transition-all duration-500 pointer-events-none ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="px-6 py-3 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl shadow-blue-500/40 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Architecture successfully mapped
          </div>
        </div>

        {/* ERROR STATE */}
        {error && !isLoading && (
          <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-8 transition-all duration-500">
            <div className="text-center max-w-md animate-entrance">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Terminal className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Analysis Halted</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {error}
              </p>
              <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full text-sm font-bold transition-all hover:bg-gray-200 active:scale-95">
                <ArrowLeft className="w-4 h-4" /> Try Another Repository
              </Link>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {analysisResult && nodes.length === 0 && !error && !isLoading && (
          <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-8 transition-all duration-500">
            <div className="text-center max-w-md animate-entrance">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Terminal className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Results Found</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                This repository does not contain analyzable source files.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full text-sm font-bold transition-all hover:bg-gray-200 active:scale-95">
                <ArrowLeft className="w-4 h-4" /> Try Another Repository
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Chatbot Panel */}
      <div className="w-full md:w-[380px] flex flex-col h-[500px] md:h-screen bg-[#050505] relative z-10 border-l border-white/5 shadow-2xl">
        <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Architecture AI</h2>
          </div>
          <Sparkles className="w-4 h-4 text-gray-600" />
        </header>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20' 
                : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                         <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#080808] border-t border-white/5">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Query system structure..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-500 pr-12"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all active:scale-95 ${
                isLoading ? 'bg-gray-800 text-gray-600' : 'bg-white text-black hover:bg-blue-500 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
               <Terminal className="w-3 h-3 text-gray-600" />
               <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Deterministic GPU Engine</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
