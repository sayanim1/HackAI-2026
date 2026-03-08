import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, AlertTriangle, Activity, Send, Search, MapPin } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export function SupplyChainDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCountry, setActiveCountry] = useState(null);

  const [statusLogs, setStatusLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const wsRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const clientId = `client_sc_${Math.random().toString(36).substring(2, 9)}`;
    const ws = new WebSocket(`ws://localhost:8000/api/supply_chain/ws/${clientId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setStatusLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: data.message }]);
      } else if (data.type === 'complete') {
        const finalData = data.data;
        setReport(finalData);
        setIsProcessing(false);
        setStatusLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "Domino analysis complete." }]);

        if (finalData.disruption_index > 0.75) {
          setTimeout(() => {
            setShowEmailModal(true);
          }, 1000);
        }
      }
    };

    wsRef.current = { ws, clientId };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [statusLogs]);

  const handleRunPredictor = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || !wsRef.current) return;

    const targetCountry = searchQuery.trim();
    setActiveCountry(targetCountry);
    setIsProcessing(true);
    setReport(null);
    setShowEmailModal(false);
    setStatusLogs([{ time: new Date().toLocaleTimeString(), msg: `Initiating Domino Predictor for ${targetCountry}...` }]);

    try {
      await fetch("http://localhost:8000/api/supply_chain/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hub: targetCountry, client_id: wsRef.current.clientId }),
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsProcessing(false);
      setStatusLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "Error establishing connection to backend." }]);
    }
  };

  const isCritical = report && report.disruption_index > 0.75;
  const indexColor = !report ? "text-slate-300" : isCritical ? "text-red-500" : "text-emerald-500";

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#f0f2f5] relative">
      <div className="flex items-start justify-between p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Supply Chain Domino</h1>
            <p className="text-slate-500 text-sm mt-1">Predicting cascading global delays mapping actual countries.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-8 pb-8 min-h-0 overflow-hidden relative">
        {/* Left Column (Controls & Feed) */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              Target Location
            </h3>

            <form onSubmit={handleRunPredictor} className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search a country (e.g. Singapore, China)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={!searchQuery.trim() || isProcessing}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2 ${!searchQuery.trim() || isProcessing ? 'bg-slate-300 text-slate-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'}`}
              >
                {isProcessing ? <Activity className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                {isProcessing ? "Analyzing..." : "Run Domino Predictor"}
              </button>
            </form>
          </div>

          {/* Live Feed */}
          <div className="flex-1 bg-[#0b1120] rounded-2xl p-5 shadow-lg flex flex-col overflow-hidden relative border border-slate-800">
            <div className="font-bold text-white text-md flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-400" />
              Intelligence Feed
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2">
              {statusLogs.length === 0 && <span className="text-slate-500 italic">Awaiting initiation...</span>}
              {statusLogs.map((log, idx) => (
                <div key={idx} className="flex gap-3 text-slate-300">
                  <span className="text-blue-500/70 shrink-0">[{log.time}]</span>
                  <span className="break-words">{log.msg}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Right Column (Map & Results) */}
        <div className="flex-1 flex flex-col gap-6 relative">

          {/* Main Map Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex-1 flex flex-col relative overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-widest text-left">Global Risk Surface</h3>

            {/* Interactive Typology Map */}
            <div className="flex-1 bg-[#f8fafc] rounded-xl border border-slate-100 relative mb-6 overflow-hidden flex items-center justify-center shadow-inner cursor-crosshair">
              <ComposableMap projectionConfig={{ scale: 130 }} className="w-full h-full">
                <Sphere stroke="#e2e8f0" strokeWidth={0.5} />
                <Graticule stroke="#e2e8f0" strokeWidth={0.5} />
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const geoName = geo.properties.name || "";
                      const isMatch = activeCountry && geoName.toLowerCase().includes(activeCountry.toLowerCase());

                      let fillColors = { default: "#e2e8f0", hover: "#cbd5e1" };

                      if (isMatch) {
                        if (isCritical) {
                          fillColors = { default: "#ef4444", hover: "#dc2626" };
                        } else if (report && !isCritical) {
                          fillColors = { default: "#10b981", hover: "#059669" };
                        } else {
                          // Being searched, but not yet analyzed
                          fillColors = { default: "#3b82f6", hover: "#2563eb" };
                        }
                      }

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: { fill: fillColors.default, outline: "none", transition: "all 250ms" },
                            hover: { fill: fillColors.hover, outline: "none", transition: "all 250ms" },
                            pressed: { fill: fillColors.hover, outline: "none" }
                          }}
                          stroke="#cbd5e1"
                          strokeWidth={0.5}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {/* Overlay pulsing for critical targets using absolute positioning. Since the map is projection-based, attaching it directly to the geo requires coordinate projection (complex). 
                    As an alternative, we highlight the whole country polygon (done above using geography fill)!
                */}
            </div>

            {/* Disruption Insights & Baseline */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[18rem] pr-2 shrink-0">
              {/* Disruption Insights */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex gap-6 shrink-0">
                <div className="flex flex-col min-w-[120px]">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Index</span>
                  <div className={`text-5xl font-black mt-2 ${indexColor}`}>
                    {report ? report.disruption_index : "---"}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Agent Analysis</span>
                  <p className="text-sm font-medium text-slate-700 mt-2 leading-relaxed">
                    {report ? report.analysis_reasoning : "Awaiting analysis..."}
                  </p>
                  {isCritical && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg uppercase">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Risk Detected
                    </div>
                  )}
                </div>
              </div>

              {/* Baseline Comparison */}
              {report && report.baseline_comparison && report.baseline_comparison !== "N/A" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm shrink-0">
                  <span className="text-xs font-bold text-yellow-700 uppercase tracking-widest text-left flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Baseline vs. AI Approach
                  </span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    <span className="font-bold text-yellow-800">Keyword Scan Baseline:</span> {report.baseline_alert ? "ALERT" : "CLEAR"}
                    <span className="text-slate-500 italic ml-2">({report.baseline_reasoning})</span>
                  </p>
                  <div className="mt-3 p-3 bg-white/60 rounded-lg text-sm text-slate-800 leading-relaxed border border-yellow-100">
                    {report.baseline_comparison}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Modal Overlay */}
        <AnimatePresence>
          {showEmailModal && report && (
            <div className="absolute inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
              >
                <div className="bg-red-500 p-5 text-white flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-lg">Automated Sourcing Alert Triggered</h3>
                    <p className="text-red-100 text-sm">Disruption index exceeded 0.75 threshold.</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-medium border-b pb-4">
                    <span>To:</span> <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">procurement@nexusflow.ai</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium text-sm">Subject: URGENT: Re-routing Required - {activeCountry} Disruption</p>
                    <div className="p-4 bg-slate-50 text-slate-600 text-sm font-mono whitespace-pre-wrap rounded-xl border border-slate-100 leading-relaxed">
                      {`Team,\n\nThe Supply Chain agent has detected severe disruption noise in ${activeCountry} with an index of ${report.disruption_index}.\n\nPrimary Action:\n${report.recommended_action}\n\nPlease action immediately to mitigate impact.`}
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
                    >
                      <Send className="w-4 h-4" /> Approve Re-route
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
