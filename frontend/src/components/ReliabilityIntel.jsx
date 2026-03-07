import { useState } from 'react';
import { AlertTriangle, Activity, Send, Terminal, Cpu } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const severityData = [
  { time: 'T-60', score: 20 },
  { time: 'T-45', score: 25 },
  { time: 'T-30', score: 40 },
  { time: 'T-15', score: 65 },
  { time: 'T-0', score: 92 },
];

export function ReliabilityIntel() {
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#fafafa]">
      
      {/* Header */}
      <div className="flex items-start justify-between p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 text-left">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900">Reliability Intel</h1>
            <p className="text-slate-500 text-sm mt-1">Chaos Coordinator: NLP-driven incident response and cluster detection.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-left">System Status</span>
            <span className="text-sm font-bold text-red-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse text-left" />
              Critical Alerts (1)
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-8 pb-8 min-h-0 overflow-y-auto">
        
        {/* Left Column (Clusters & Severity) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 card-shadow text-left">
              <div className="text-sm font-semibold text-slate-500 mb-1 text-left">Active Support Tickets</div>
              <div className="text-3xl font-bold text-slate-900">184</div>
              <div className="text-xs font-medium mt-2 text-orange-600 flex items-center gap-1">
                <Activity className="w-3 h-3 text-left" />
                +45 in last hour
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-2xl p-5 card-shadow shadow-red-500/5 border-b-4 border-b-red-500 text-left text-left">
              <div className="text-sm font-semibold text-slate-500 mb-1">Emergent Clusters</div>
              <div className="text-3xl font-bold text-red-600">3</div>
              <div className="text-xs font-medium mt-2 text-slate-500">Cross-departmental issues</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 card-shadow flex gap-4 items-center">
               <div className="flex-1 text-left">
                <div className="text-sm font-semibold text-slate-500 mb-1">Avg Resolution Time</div>
                <div className="text-3xl font-bold text-slate-900">2.4h</div>
                <div className="text-xs font-medium mt-2 text-emerald-600">-15% vs yesterday</div>
               </div>
               <div className="w-16 h-16 rounded-full border-4 border-orange-100 flex items-center justify-center text-orange-500">
                  <Cpu className="w-6 h-6" />
               </div>
            </div>
          </div>

          {/* Emergent Clusters Main Card */}
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 card-shadow flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                 <Terminal className="w-5 h-5 text-indigo-600" />
                 Active "Emergent Clusters" Flags
              </div>
              <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Draft Summaries
              </button>
            </div>

            <div className="space-y-4 text-left font-sans text-left">
              {/* Cluster Item 1 */}
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                <div className="flex justify-between items-start mb-4 text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded uppercase tracking-wider text-left">System-Wide Outage</span>
                      <h3 className="font-bold text-slate-900">Authentication / SSO Latency</h3>
                    </div>
                    <p className="text-sm text-slate-600 text-left">Identified via NLP tracking keywords: "login latency", "SSO error", "can't access dashboard".</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">92<span className="text-sm text-slate-400">/100</span></div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Severity Index</div>
                  </div>
                </div>

                <div className="flex items-end gap-6 text-left">
                  <div className="flex -space-x-2 text-left">
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">ENG</div>
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">HR</div>
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">SAL</div>
                  </div>
                  <div className="text-sm font-medium text-slate-600 text-left">
                    <strong className="text-slate-900 text-left">18</strong> isolated tickets linked to this cluster in the last 15 mins.
                  </div>
                  
                  <div className="flex-1 h-10 ml-auto max-w-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={severityData}>
                        <defs>
                          <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} fill="url(#colorSev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Cluster Item 2 */}
              <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-5 text-left text-left text-left">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">Degraded Performance</span>
                      <h3 className="font-bold text-slate-900">Database Query Timeout</h3>
                    </div>
                    <p className="text-sm text-slate-600">Mentions of "slow loading", "timeout error".</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-600">65<span className="text-sm text-slate-400">/100</span></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (Chat Agent) */}
        <div className="w-[340px] bg-white border border-gray-100 rounded-2xl card-shadow flex flex-col overflow-hidden text-left">
          <div className="p-4 border-b border-gray-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">Chaos Coordinator Active</h3>
            <p className="text-xs text-slate-500">Context: Incident Response, NLP Logs</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100/80 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-700 shadow-sm max-w-[85%] border border-gray-200/50">
                I'm monitoring cross-departmental logs. I've flagged a Severity 92 cluster on SSO Latency. Shall I draft a summary for the Engineering team?
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 ring-orange-500/20 focus-within:border-orange-300 transition-all">
              <input 
                type="text" 
                placeholder="Ask about an incident or draft report..."
                className="w-full bg-transparent text-sm py-3 pl-4 pr-10 outline-none placeholder:text-gray-400"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="absolute right-2 p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
