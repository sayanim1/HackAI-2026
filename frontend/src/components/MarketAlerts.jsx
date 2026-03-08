import { useState, useEffect } from 'react';
import { Bell, Mail, RefreshCcw, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function MarketAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // 'success' | 'error' | null

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/market/alerts');
      const result = await response.json();
      if (result.success) {
        setAlerts(result.alerts);
        setLastUpdated(result.last_updated);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const response = await fetch('http://localhost:8000/api/market/alerts/send-email', {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        setEmailStatus('success');
        setTimeout(() => setEmailStatus(null), 3000);
      } else {
        setEmailStatus('error');
      }
    } catch (error) {
      console.error("Error triggering email:", error);
      setEmailStatus('error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'SELL': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-orange-500" />;
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return "text-emerald-700 bg-emerald-50 border-emerald-100";
      case 'SELL': return "text-red-700 bg-red-50 border-red-100";
      default: return "text-orange-700 bg-orange-50 border-orange-100";
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-start justify-between p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-agentbase-500 text-white flex items-center justify-center shadow-lg shadow-agentbase-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sector Intelligence Alerts</h1>
            <p className="text-slate-500 text-sm mt-1">Twice-daily automated market sentiment and sector shift reports.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAlerts}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </button>
          
          <button 
            onClick={handleSendEmail}
            disabled={isSendingEmail || isLoading}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg",
              emailStatus === 'success' ? "bg-emerald-500 text-white shadow-emerald-500/20" :
              emailStatus === 'error' ? "bg-red-500 text-white shadow-red-500/20" :
              "bg-agentbase-500 text-white shadow-agentbase-500/20 hover:bg-agentbase-600"
            )}
          >
            {isSendingEmail ? (
               <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : emailStatus === 'success' ? (
               <CheckCircle2 className="w-4 h-4" />
            ) : emailStatus === 'error' ? (
               <AlertCircle className="w-4 h-4" />
            ) : (
               <Mail className="w-4 h-4" />
            )}
            {isSendingEmail ? "Sending..." : emailStatus === 'success' ? "Report Sent" : emailStatus === 'error' ? "Failed" : "Send Report Now"}
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        {isLoading && alerts.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-4 border-agentbase-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl">
            {/* Summary Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 card-shadow flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Update</div>
                <div className="text-lg font-bold text-slate-900">
                  {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Monitors</div>
                <div className="text-lg font-bold text-slate-900">{alerts.length} Sectors</div>
              </div>
            </div>

            {/* Sector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 card-shadow flex flex-col hover:border-agentbase-200 transition-all group overflow-hidden relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{alert.sector}</h3>
                    <div className={cn("px-3 py-1 rounded-lg border text-xs font-bold tracking-wide flex items-center gap-2", getSignalColor(alert.signal))}>
                      {getSignalIcon(alert.signal)}
                      {alert.signal}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                    {alert.reasoning}
                  </p>

                  <div className="pt-4 border-t border-slate-50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Top Sector Headlines</div>
                    <div className="space-y-2">
                       {alert.headlines?.slice(0, 2).map((h, i) => (
                         <div key={i} className="text-xs text-slate-500 line-clamp-1 flex gap-2">
                           <span className="text-agentbase-400">•</span> {h}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!isLoading && alerts.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center card-shadow">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Alerts</h3>
                <p className="text-slate-500">Click refresh to trigger the initial sector scan.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
