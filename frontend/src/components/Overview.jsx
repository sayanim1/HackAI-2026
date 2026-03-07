import { TrendingUp, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Overview({ setActiveView }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafa] p-12 relative animate-fade-in">
      <div className="max-w-5xl mx-auto pt-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3f0ff] border border-agentbase-500/10 mb-8">
          <Sparkles className="w-4 h-4 text-agentbase-600" />
          <span className="text-sm font-semibold text-agentbase-600">Next-Gen Intelligence Platform</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6 max-w-3xl">
          Analyze Markets and Mitigate <span className="text-agentbase-500">Incident Risks</span> with Specialized Agents.
        </h1>

        <p className="text-lg text-slate-600 mb-16 max-w-2xl leading-relaxed">
          Our platform brings together two distinct AI powerhouses. One to scan the markets and another to learn from corporate failures.
        </p>

        {/* Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Market Analyst */}
          <div className="bg-white rounded-[2rem] p-10 card-shadow flex flex-col h-full border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-8">
              <TrendingUp className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Market Intelligence Agent</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Real-time news processing combined with deep-stock analysis. Get sentiment scores and predictive insights for your portfolio.
            </p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="mt-1 text-agentbase-500"><Sparkles className="w-4 h-4" /></div>
                Instant news-to-ticker mapping
              </li>
              <li className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="mt-1 text-agentbase-500"><Sparkles className="w-4 h-4" /></div>
                Sentiment trend analysis
              </li>
            </ul>

            <button 
              onClick={() => setActiveView('market')}
              className="w-full bg-[#111111] hover:bg-black text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Enter Market Terminal
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Incident Risk */}
          <div className="bg-white rounded-[2rem] p-10 card-shadow flex flex-col h-full border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-8">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Incident Intelligence Agent</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Learn from the industry. We ingest and analyze post-mortems from top companies to help you avoid common operational pitfalls.
            </p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="mt-1 text-orange-500"><Sparkles className="w-4 h-4" /></div>
                Pattern detection in failures
              </li>
              <li className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="mt-1 text-orange-500"><Sparkles className="w-4 h-4" /></div>
                Historical post-mortem database
              </li>
            </ul>

            <button 
              onClick={() => setActiveView('reliability')}
              className="w-full bg-agentbase-500 hover:bg-agentbase-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-agentbase-500/20"
            >
              Analyze Incidents
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
