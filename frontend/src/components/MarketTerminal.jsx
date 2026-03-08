import { useState, useEffect, useRef } from 'react';
import { TrendingUp, FileText, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export function MarketTerminal() {
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: "Hello! I am your Market Intelligence Agent. Which stock or sector would you like me to analyze today?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const fetchMarketData = async (query = '') => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/market${query ? `?q=${query}` : ''}`);
      const result = await response.json();
      if (result.success) {
        setMarketData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData(); 
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/market/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });

      const result = await response.json();
      const replyText = result.reply || result.message || "I've processed your request. See the updated dashboard.";
      setMessages(prev => [...prev, { id: Date.now(), role: 'system', text: replyText }]);

      if (result.data) {
        setMarketData(result.data);
      } else if (result.financials && result.news) {
        setMarketData(result);
      } else if (result.action) {
        if (result.action.startsWith('LOAD_')) {
          fetchMarketData(result.action.replace('LOAD_', '').toLowerCase());
        } else {
          fetchMarketData(result.action.toLowerCase());
        }
      } else if (result.ticker) {
        fetchMarketData(result.ticker);
      }
    } catch (error) {
      console.error("Error talking to agent:", error);
      setMessages(prev => [...prev, { id: Date.now(), role: 'system', text: "Sorry, I am currently unable to reach the Market Intelligence servers." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!marketData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 rounded-full border-4 border-market-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const isPositive = marketData.change.startsWith('+');

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
              <div className="flex gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-agentbase-600 text-white flex flex-col items-center justify-center font-bold text-xl shadow-lg shadow-agentbase-600/20">
                    {(marketData.ticker || '??').slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{marketData.companyName || 'Unknown Company'}</h2>
                    <p className="text-slate-500 text-sm font-medium">{marketData.ticker || 'Unknown Ticker'}</p>
                  </div>
                </div>

                {/* Agent Signal UI */}
                <div className={cn(
                  "px-4 py-2 rounded-xl border shadow-sm flex items-center gap-3",
                  marketData.financials.signal === "BUY" ? "bg-emerald-50 border-emerald-100" :
                  marketData.financials.signal === "SELL" ? "bg-red-50 border-red-100" :
                  "bg-orange-50 border-orange-100"
                )}>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Signal</div>
                  <div className={cn("text-lg font-black",
                    marketData.financials.signal === "BUY" ? "text-emerald-700" :
                    marketData.financials.signal === "SELL" ? "text-red-700" :
                    "text-orange-700"
                  )}>{marketData.financials.signal}</div>
                  <div className="text-xs font-semibold text-slate-500">{marketData.financials.confidence} Conf.</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">${marketData.price.toFixed(2)}</div>
                <div className={cn("flex items-center font-medium text-sm gap-1 justify-end", isPositive ? "text-market-600" : "text-red-600")}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                  {marketData.change} ({marketData.changeAmount})
                </div>
              </div>
            </div>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData.chart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#059669" : "#dc2626"} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={isPositive ? "#059669" : "#dc2626"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="price" stroke={isPositive ? "#059669" : "#dc2626"} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
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
                {marketData.news.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-snug">{item.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{item.time}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded text-left", item.impactClass)}>
                          {item.impact}
                        </span>
                      </div>
                    </div>
                    <div className={cn("text-sm font-bold", item.priceEffect.startsWith('+') ? "text-market-600" : "text-red-600")}>
                      {item.priceEffect}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Metrics Card (Replaced Volume Card) */}
            <div className="bg-white border text-left border-gray-100 rounded-2xl p-6 card-shadow flex flex-col justify-center">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Market Cap</div>
                    <div className="text-xl font-black text-slate-900">{marketData.financials.marketCap}</div>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">P/E Ratio</div>
                    <div className="text-xl font-black text-slate-900">{marketData.financials.peRatio}</div>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Div Yield</div>
                    <div className="text-xl font-black text-slate-900">{marketData.financials.dividendYield}</div>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">52W High/Low</div>
                    <div className="text-md font-bold text-slate-900 mt-1">${marketData.financials.wkHigh52} / ${marketData.financials.wkLow52}</div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column (Chat Agent) */}
        <div className="w-[340px] bg-white border border-gray-100 rounded-2xl card-shadow flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">AI Analyst Active</h3>
            <p className="text-xs text-slate-500">Context: {marketData.ticker}, Market Trends</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto w-full">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "rounded-2xl p-4 text-sm shadow-sm max-w-[85%] border",
                  msg.role === 'user'
                    ? "bg-agentbase-50 text-agentbase-900 rounded-tr-sm ml-auto border-agentbase-100"
                    : "bg-gray-100/80 text-slate-700 rounded-tl-sm border-gray-200/50"
                )}>
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="bg-gray-100/80 text-slate-700 rounded-2xl rounded-tl-sm p-4 text-sm shadow-sm max-w-[85%] border border-gray-200/50 flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleSendMessage} className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 ring-agentbase-500/20 focus-within:border-agentbase-300 transition-all">
              <input 
                type="text" 
                placeholder="Ask about a ticker or news event..."
                className="w-full bg-transparent text-sm py-3 pl-4 pr-10 outline-none placeholder:text-gray-400"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className={cn("absolute right-2 p-1.5 rounded-lg transition-colors border-none bg-transparent hover:cursor-pointer",
                  chatInput.trim() && !isChatLoading ? "text-agentbase-500 hover:bg-agentbase-50" : "text-gray-300"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
