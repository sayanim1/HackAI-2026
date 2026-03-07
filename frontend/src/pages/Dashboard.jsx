import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Overview } from '../components/Overview';
import { MarketTerminal } from '../components/MarketTerminal';
import { ReliabilityIntel } from '../components/ReliabilityIntel';

export function Dashboard() {
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="flex h-screen bg-[#fafafa] text-slate-900 overflow-hidden font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      {activeView === 'overview' && <Overview setActiveView={setActiveView} />}
      {activeView === 'market' && <MarketTerminal />}
      {activeView === 'reliability' && <ReliabilityIntel />}
    </div>
  );
}
