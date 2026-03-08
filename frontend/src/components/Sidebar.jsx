import { LayoutDashboard, TrendingUp, AlertTriangle, Settings, Brain, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'market', icon: TrendingUp, label: 'Market Analyst', color: 'text-market-600' },
    { id: 'reliability', icon: AlertTriangle, label: 'Reliability Intel', color: 'text-risk-600' },
    { id: 'supply_chain', icon: Globe, label: 'Supply Chain Domino', color: 'text-blue-600' },
  ];

  return (
    <div className="w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col relative z-20">
      <div className="p-6 pt-8 pb-10">
        <h1 className="text-xl font-bold flex items-center gap-3 text-slate-900">
          <div className="w-10 h-10 rounded-xl bg-agentbase-500 flex items-center justify-center text-white shadow-xl shadow-agentbase-500/20">
            <Brain className="w-6 h-6" />
          </div>
          AgentBase
        </h1>
      </div>

      <div className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group overflow-hidden",
                isActive 
                  ? "text-agentbase-700 bg-agentbase-50/80" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-agentbase-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="relative z-10">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="p-4 mt-auto border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group">
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          Settings
        </button>
      </div>
    </div>
  );
}
