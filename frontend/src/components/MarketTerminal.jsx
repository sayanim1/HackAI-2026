import { useState } from 'react';
import { TrendingUp, FileText, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const stockData = [
  { time: '09:30', price: 156.95 },
  { time: '10:00', price: 158.20 },
  { time: '11:00', price: 156.40 },
  { time: '12:00', price: 159.10 },
  { time: '13:00', price: 160.50 },
  { time: '14:00', price: 159.80 },
  { time: '15:00', price: 160.90 },
  { time: '16:00', price: 161.40 },
];

const volumeData = [
  { name: '1', uv: 2000 },
  { name: '2', uv: 3000 },
  { name: '3', uv: 2500 },
  { name: '4', uv: 4000 },
  { name: '5', uv: 5000 },
  { name: '6', uv: 4500 },
  { name: '7', uv: 6000 },
];

export function MarketTerminal() {
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#fafafa]">
      
      {/* Header */}
      <div className="flex items-start justify-between p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-market-500 text-white flex items-center justify-center shadow-lg shadow-market-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Market Terminal</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time analysis of equity markets and sentiment shifts.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Market Open</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-8 pb-8 min-h-0 overflow-y-auto">
        
        {/* Left Column (Charts & Data) */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Main Chart Card */}
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-6 card-shadow">
            <div className="flex items-start justify-between mb-8 text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-agentbase-600 text-white flex flex-col text-left items-center justify-center font-bold text-xl shadow-lg shadow-agentbase-600/20">
                  NV
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">NVIDIA Corp.</h2>
                  <p className="text-slate-500 text-sm font-medium">NASDAQ: NVDA</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">$161.40</div>
                <div className="flex items-center text-market-600 font-medium text-sm gap-1 justify-end">
                  <TrendingUp className="w-4 h-4" />
                  +2.84% (+$4.45)
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a34e8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4a34e8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#4a34e8" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {/* Intel Card */}
            <div className="bg-white border text-left border-gray-100 rounded-2xl p-6 card-shadow flex flex-col">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-6">
                <FileText className="w-5 h-5 text-agentbase-500 text-left" />
                Latest Intelligence
              </div>
              <div className="space-y-6">
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">NVIDIA announces next-gen H200 architecture</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">10M AGO</span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-left">HIGH IMPACT</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-market-600">+4.2%</div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">Fed signals potential rate cuts in late 2026</h4>
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-xs text-slate-400">45M AGO</span>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">MED IMPACT</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-market-600">+1.1%</div>
                </div>

                <div className="flex gap-4 text-left">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">Global supply chain logistics show improvement</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">2H AGO</span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">LOW IMPACT</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-market-600">+0.3%</div>
                </div>

              </div>
            </div>

            {/* Volume Card */}
            <div className="bg-white border text-left border-gray-100 rounded-2xl p-6 card-shadow flex flex-col">
              <div className="font-bold text-slate-900 mb-6 text-left">Volume Distribution</div>
              <div className="flex-1 w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <Bar dataKey="uv" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Chat Agent) */}
        <div className="w-[340px] bg-white border border-gray-100 rounded-2xl card-shadow flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">AI Analyst Active</h3>
            <p className="text-xs text-slate-500">Context: NVDA, Market Trends</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100/80 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-700 shadow-sm max-w-[85%] border border-gray-200/50">
                Hello! I am your Market Intelligence Agent. Which stock or sector would you like me to analyze today?
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 ring-agentbase-500/20 focus-within:border-agentbase-300 transition-all">
              <input 
                type="text" 
                placeholder="Ask about a ticker or news event..."
                className="w-full bg-transparent text-sm py-3 pl-4 pr-10 outline-none placeholder:text-gray-400"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="absolute right-2 p-1.5 text-agentbase-500 hover:bg-agentbase-50 rounded-lg transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
