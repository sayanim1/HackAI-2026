import { useState } from 'react';
import { Send, Upload, ShieldAlert, TrendingUp, Activity, User, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AgentChat({ activeAgent }) {
  const [messages, setMessages] = useState({
    market: [
      { id: 1, role: 'system', text: 'Hello! I am your Market Analyst. I track momentum, news sentiment, and technicals. Which asset are you analyzing today?' }
    ],
    risk: [
      { id: 1, role: 'system', text: 'Risk Detective online. I monitor SEC filings, incident reports, and governance issues. What company should we look into?' }
    ],
    synthesis: [
      { id: 1, role: 'system', text: 'Synthesis Mode active. I will combine insights from both Market Analyst and Risk Detective to give you a balanced view. Ask me anything.' }
    ]
  });

  const [input, setInput] = useState('');

  const getAgentConfig = () => {
    switch (activeAgent) {
      case 'market':
        return { icon: TrendingUp, color: 'text-market-500', bg: 'bg-market-500/10', border: 'border-market-500/30', title: 'Market Analyst', glow: 'shadow-market-500/20' };
      case 'risk':
        return { icon: ShieldAlert, color: 'text-risk-500', bg: 'bg-risk-500/10', border: 'border-risk-500/30', title: 'Risk Detective', glow: 'shadow-risk-500/20' };
      case 'synthesis':
        return { icon: Activity, color: 'text-primary-500', bg: 'bg-primary-500/10', border: 'border-primary-500/30', title: 'Synthesis Mode', glow: 'shadow-primary-500/20' };
      default:
        return { icon: Sparkles, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', title: 'Select an Agent', glow: '' };
    }
  };

  const config = getAgentConfig();
  const Icon = config.icon;
  const currentMessages = messages[activeAgent] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || activeAgent === 'dashboard') return;

    const newMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], newMsg]
    }));
    setInput('');

    // Simulate response
    setTimeout(() => {
      let responseText = '';
      if (activeAgent === 'market') responseText = "Looking at recent data, there's strong bullish momentum. Volume is up 15%.";
      else if (activeAgent === 'risk') responseText = "Action required: I found 2 recent incident reports involving supply chain delays.";
      else responseText = "Synthesizing... While market momentum is bullish, the supply chain incidents present a moderate risk. Consider a smaller position.";
      
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], { id: Date.now(), role: 'system', text: responseText }]
      }));
    }, 1000);
  };

  if (activeAgent === 'dashboard') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center glass shadow-2xl">
          <Sparkles className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-light text-white">Welcome back, Alex.</h2>
        <p className="max-w-md text-slate-500">Pick an agent from the sidebar or select Synthesis mode to get a balanced view of your watchlist.</p>
        
        <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all cursor-pointer">
            <TrendingUp className="w-8 h-8 text-market-500 mb-4" />
            <h3 className="text-white font-medium mb-2">Check Market Trends</h3>
            <p className="text-sm text-slate-500">Analyze TechCorp's recent earnings momentum</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all cursor-pointer">
            <ShieldAlert className="w-8 h-8 text-risk-500 mb-4" />
            <h3 className="text-white font-medium mb-2">Scan Risk Factors</h3>
            <p className="text-sm text-slate-500">Review recent incident reports for TechCorp</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen relative overflow-hidden bg-slate-900/40">
      {/* Background Glow */}
      <div className={cn("absolute top-0 right-0 w-96 h-96 rounded-full blur-[128px] opacity-20 pointer-events-none transition-colors duration-700", config.bg)} />

      {/* Header */}
      <header className={cn("p-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10 transition-colors duration-300")}>
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all", config.bg, config.color, config.glow)}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">{config.title}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online and ready
            </p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors border border-slate-700">
          Clear Chat
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scroll-smooth">
        <AnimatePresence>
          {currentMessages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4 max-w-3xl",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md",
                msg.role === 'user' ? "bg-slate-700" : cn(config.bg, config.color)
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-300" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary-600 text-white rounded-tr-sm" 
                  : "bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm glass"
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/80 z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <div className={cn(
            "absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200",
            msg_glow(activeAgent)
          )}></div>
          <div className="relative flex items-center bg-slate-800 border border-slate-700 hover:border-slate-600 focus-within:border-slate-500 rounded-2xl overflow-hidden transition-all shadow-xl">
            <button type="button" className="p-4 text-slate-400 hover:text-white transition-colors">
              <Upload className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${config.title}...`}
              className="flex-1 bg-transparent py-4 outline-none text-slate-200 placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className={cn(
                "p-4 transition-colors",
                input.trim() ? config.color : "text-slate-600 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function msg_glow(agent) {
  switch (agent) {
    case 'market': return 'bg-market-500';
    case 'risk': return 'bg-risk-500';
    case 'synthesis': return 'bg-primary-500';
    default: return 'bg-slate-500';
  }
}
