import { TrendingUp, AlertTriangle, ArrowRight, Sparkles, Globe } from 'lucide-react';
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
          Empower Decision-Making with <span className="text-agentbase-500">Specialized AI Agents</span>.
        </h1>

        <p className="text-lg text-slate-600 mb-16 max-w-2xl leading-relaxed">
          Our platform brings together distinct AI powerhouses. Analyze market trends, mitigate operational risks, and predict global supply chain disruptions—all from a single, unified interface.
        </p>

        {/* Cards container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              Analyze Incidents
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Supply Chain */}
          <div className="bg-white rounded-[2rem] p-10 card-shadow flex flex-col h-full border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8">
              <Globe className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-4">Supply Chain Domino</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Predict cascading global delays natively on an interactive world map utilizing real-time GDELT news ingestion.
            </p>

            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="mt-1 text-blue-600"><Sparkles className="w-4 h-4" /></div>
                Geographic topology highlights
              </li>
              <li className="flex items-start gap-3 text-slate-600 text-sm">
                <div className="mt-1 text-blue-600"><Sparkles className="w-4 h-4" /></div>
                Disruption threshold simulation
              </li>
            </ul>

            <button
              onClick={() => setActiveView('supply_chain')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              Predict Delays
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
