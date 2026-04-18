import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()

  const handleAnalyze = () => {
    if (!repoUrl) return

    // Extract repo name from URL
    const parts = repoUrl.split('/')
    let repoName = parts[parts.length - 1] || parts[parts.length - 2]
    
    // Simple cleaning
    if (repoName.endsWith('.git')) {
      repoName = repoName.slice(0, -4)
    }

    if (!repoName) repoName = 'unknown-repo'

    // Mock data for preview
    setPreview({
      name: repoName,
      stars: Math.floor(Math.random() * 10000) + 100,
      language: 'JavaScript'
    })

    // Navigate to analysis page after a short delay to show the preview card (optional)
    // Or navigate immediately as per request
    setTimeout(() => {
        navigate('/analysis', { state: { repoUrl } })
    }, 800)
  }

  return (
    <div className="relative flex flex-col w-full min-h-screen bg-[#000000] text-white font-inter selection:bg-blue-500/30 overflow-hidden">
      {/* Subtle Background Glow (Lowered Intensity) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/2 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/2 rounded-full blur-[120px] pointer-events-none delay-700"></div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between w-full px-8 py-6 border-b border-white/10 backdrop-blur-sm">
        <div className="text-xl font-bold tracking-tight">
          Codebase <span className="text-blue-500">GPS</span>
        </div>
        <div className="ml-auto flex gap-6 items-center">
          <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Demo
          </button>
          <button className="px-6 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
            GitHub
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center w-full px-6 relative z-10">
        <div className="max-w-3xl w-full text-center mx-auto">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 text-white leading-[1.1]">
            Understand Any Codebase <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Instantly
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed text-center">
            Paste a GitHub repository and visualize its architecture, flows, and dependencies in seconds.
          </p>

          {/* Repo Input Component */}
          <div className="relative w-full max-w-2xl mx-auto group">
            <div className="flex flex-col md:flex-row gap-2 p-2 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/40 transition-all duration-300 justify-center items-center">
              <div className="flex-1 flex items-center px-4 w-full">
                <span className="text-xl mr-3 opacity-30">🔗</span>
                <input
                  type="text"
                  placeholder="Paste GitHub repo URL..."
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 py-3 text-center md:text-left"
                />
              </div>
              <button
                onClick={handleAnalyze}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 active:scale-95 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/10"
              >
                Analyze
              </button>
            </div>
          </div>

          {/* Repo Preview Card */}
          {preview && (
            <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-700 ease-out w-full flex justify-center">
              <div className="w-full max-w-md p-8 bg-[#111111] border border-white/10 rounded-3xl text-left shadow-2xl relative overflow-hidden group mx-auto">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{preview.name}</h3>
                    <div className="flex items-center gap-5">
                      <span className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        {preview.language}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-gray-400">
                        ⭐ {preview.stars.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-bold tracking-widest rounded-full border border-white/10">
                    PUBLIC
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[70%]"></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                    <span>Architecture Mapped</span>
                    <span className="text-blue-400">70%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default HomePage
