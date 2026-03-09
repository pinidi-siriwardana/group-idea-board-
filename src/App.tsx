import { useState, useEffect } from 'react'

interface Idea {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

function App() {
  const [members, setMembers] = useState<string[]>(['John Doe', 'Jane Smith']);
  const [newMember, setNewMember] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaText, setIdeaText] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedIdeas = localStorage.getItem('group-ideas');
    const savedMembers = localStorage.getItem('group-members');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedIdeas) setIdeas(JSON.parse(savedIdeas));
    if (savedMembers) setMembers(JSON.parse(savedMembers));
    if (savedTheme) setDarkMode(savedTheme === 'dark');
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('group-ideas', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem('group-members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const addIdea = () => {
    if (ideaText.trim() && selectedMember) {
      const newIdea: Idea = {
        id: crypto.randomUUID(),
        text: ideaText.trim(),
        author: selectedMember,
        timestamp: Date.now(),
      };
      setIdeas([newIdea, ...ideas]);
      setIdeaText('');
    }
  };

  const clearIdeas = () => {
    if (confirm('Are you sure you want to clear all ideas?')) {
      setIdeas([]);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/70 border-gray-200'
      }`}>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
              G
            </div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Group Idea Board
            </h1>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-md ${
              darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-indigo-600 hover:bg-gray-100'
            }`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707MD12 5a7 7 0 000 14 7 7 0 000-14z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Management */}
          <div className="space-y-6">
            <section className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-100'
            }`}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Team Members
              </h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New member name..."
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMember()}
                  className={`flex-grow px-4 py-2 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 outline-none ${
                    darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}
                />
                <button
                  onClick={addMember}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  Add
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {members.map((member, index) => (
                  <div 
                    key={index} 
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-indigo-50'
                    }`}
                  >
                    {member}
                  </div>
                ))}
              </div>
            </section>

            <section className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-100'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Statistics
                </h2>
                <button 
                  onClick={clearIdeas}
                  className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex items-center justify-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-inner">
                <div className="text-center">
                  <div className="text-4xl font-black mb-1">{ideas.length}</div>
                  <div className="text-xs uppercase tracking-widest opacity-80">Total Ideas</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Idea Input & List */}
          <div className="lg:col-span-2 space-y-6">
            <section className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ${
              darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-100'
            }`}>
              <h2 className="text-lg font-bold mb-4">What's on your mind?</h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow">
                    <label className="block text-xs font-semibold mb-1 opacity-60 ml-1">Select Member</label>
                    <select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm appearance-none transition-all focus:ring-2 focus:ring-indigo-500 outline-none ${
                        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <option value="">-- Who are you? --</option>
                      {members.map((member, index) => (
                        <option key={index} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1 opacity-60 ml-1">Your Brilliant Idea</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your idea here..."
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${
                      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  ></textarea>
                </div>

                <button
                  onClick={addIdea}
                  disabled={!ideaText.trim() || !selectedMember}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${
                    !ideaText.trim() || !selectedMember 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25 hover:scale-[1.01]'
                  }`}
                >
                  Submit Idea
                </button>
              </div>
            </section>

            <div className="space-y-4">
              <h2 className="text-xl font-bold px-1">Board Feed</h2>
              {ideas.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border-2 border-dashed transition-colors ${
                  darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                  No ideas yet. Be the first to share!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {ideas.map((idea) => (
                    <div 
                      key={idea.id}
                      className={`p-5 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 border-l-4 border-indigo-500 animate-in fade-in slide-in-from-bottom-2 ${
                        darkMode ? 'bg-gray-800/60' : 'bg-white'
                      }`}
                    >
                      <p className="text-base mb-3 leading-relaxed">
                        {idea.text}
                      </p>
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1 dark:border-gray-700">
                        <span className="italic opacity-70 text-sm font-medium">
                          — {idea.author}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider opacity-40">
                          {new Date(idea.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-8 text-center border-t transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-white border-gray-200 text-gray-400'
      }`}>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Group Idea Board. Sparking creativity together.
        </p>
      </footer>
    </div>
  )
}

export default App
