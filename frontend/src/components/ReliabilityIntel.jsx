import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Activity, Terminal, Upload, FileText, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export function ReliabilityIntel() {
  const [incidentText, setIncidentText] = useState('');
  const [statusLogs, setStatusLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [incidentData, setIncidentData] = useState(null);
  const wsRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Generate a unique client ID for this session
    const clientId = `client_${Math.random().toString(36).substring(2, 9)}`;
    const ws = new WebSocket(`ws://localhost:8000/api/incident/ws/${clientId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setStatusLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: data.message }]);
      } else if (data.type === 'complete') {
        setIncidentData(data.data);
        setIsProcessing(false);
        const thoughtProcess = data.data.llm_thought_process || "";
        const summary = thoughtProcess.length > 200 ? thoughtProcess.substring(0, 200) + "..." : thoughtProcess;
        setStatusLogs(prev => [
          ...prev, 
          { time: new Date().toLocaleTimeString(), msg: "Incident analysis complete." },
          { time: new Date().toLocaleTimeString(), msg: `Agent Summary: ${summary}` }
        ]);
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

  const handleAnalyze = async () => {
    if (!incidentText.trim()) return;
    
    setIsProcessing(true);
    setIncidentData(null);
    setStatusLogs([{ time: new Date().toLocaleTimeString(), msg: "Initiating Chaos Coordinator pipeline on text input..." }]);

    try {
      const response = await fetch("http://localhost:8000/api/incident/analyze_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: incidentText, client_id: wsRef.current.clientId }),
      });
      
      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error("API returned failure");
      }
      // Note: Data and status logs are populated via WebSocket events defined in the useEffect hook.
    } catch (error) {
      console.error("Analysis failed:", error);
      setStatusLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "Error establishing connection to backend." }]);
      setIsProcessing(false);
    }
  };

  // Determine severity and corresponding animation
  const isCritical = incidentData?.severity?.toLowerCase().includes("critical") || incidentData?.severity?.toLowerCase().includes("high");
  const severityColor = isCritical ? "text-red-500" : incidentData ? "text-orange-500" : "text-slate-300";
  const gaugeColor = isCritical ? "bg-red-500" : incidentData ? "bg-orange-500" : "bg-slate-200";

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#fafafa]">
      
      {/* Header */}
      <div className="flex items-start justify-between p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Reliability Intel</h1>
            <p className="text-slate-500 text-sm mt-1">Chaos Coordinator: NLP-driven incident response and cluster detection.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-left">System Status</span>
            <span className="text-sm font-bold text-red-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse text-left" />
              Monitoring
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-8 pb-8 min-h-0 overflow-hidden">
        
        {/* Left Column (Live Feed & Upload) */}
        <div className="w-1/3 flex flex-col gap-6">
          
          {/* Text Input Section */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 card-shadow flex flex-col">
            <div className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              Input Incident Text
            </div>
            
            <div className="flex-1 relative">
               <textarea 
                 value={incidentText}
                 onChange={(e) => setIncidentText(e.target.value)}
                 placeholder="Paste the incident report, Slack logs, or raw telemetry here..."
                 className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none text-sm text-slate-700"
               />
            </div>
            
            <button 
              onClick={handleAnalyze} 
              disabled={!incidentText.trim() || isProcessing}
              className={`mt-4 w-full py-3 rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2 ${!incidentText.trim() || isProcessing ? 'bg-slate-200 text-slate-400 border-none' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'}`}
            >
              {isProcessing ? <Activity className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
              {isProcessing ? "Processing..." : "Analyze Incident"}
            </button>
          </div>

          {/* Live Feed (Playback Status) */}
          <div className="flex-1 bg-slate-900 rounded-2xl p-6 card-shadow flex flex-col overflow-hidden relative">
            <div className="font-bold text-white text-lg flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Live Feed
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-sm pr-2">
              {statusLogs.length === 0 && <span className="text-slate-500 italic">Awaiting input...</span>}
              {statusLogs.map((log, idx) => (
                <div key={idx} className="flex gap-3 text-slate-300">
                  <span className="text-emerald-500/70 shrink-0">[{log.time}]</span>
                  <span className="break-words">{log.msg}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>

        {/* Right Column (Agentic Insights) */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
          
          {/* Framer Motion Animated Severity Gauge */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 card-shadow">
             <div className="flex justify-between items-center text-left">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-widest text-left">Severity Index</h3>
                  <div className={`text-4xl font-black ${severityColor}`}>{incidentData ? incidentData.severity : "--"}</div>
                </div>
                
                {/* Gauge Animation Triggered if Critical */}
                <motion.div 
                  initial={{ scale: 1 }}
                  animate={isCritical ? {
                    x: [-4, 4, -4, 4, 0],
                    transition: { repeat: Infinity, repeatDelay: 2, duration: 0.4 }
                  } : {}}
                  className="w-24 h-24 rounded-full border-8 border-slate-50 relative flex items-center justify-center shadow-inner"
                >
                   <div className={`absolute inset-0 rounded-full border-4 ${isCritical ? 'border-red-500' : 'border-slate-200'} opacity-30`} />
                   <motion.div 
                     initial={{ height: "0%" }}
                     animate={{ height: incidentData ? "100%" : "0%" }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className={`absolute bottom-0 w-full ${gaugeColor} rounded-full opacity-20`} 
                   />
                   <AlertTriangle className={`w-10 h-10 ${severityColor} relative z-10`} />
                </motion.div>
             </div>
          </div>

          {/* Chaos Summary */}
          {incidentData && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="bg-white border border-gray-100 rounded-2xl p-6 card-shadow flex flex-col flex-1"
             >
                <div className="flex items-center gap-3 mb-6">
                   <div className={`px-3 py-1 bg-orange-100 ${severityColor} text-xs font-bold rounded uppercase tracking-wider`}>Agent Insight</div>
                   <h2 className="text-xl font-bold text-slate-900">{incidentData.incident_type}</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 text-left">
                   <div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Affected Systems</div>
                     <div className="flex flex-wrap gap-2">
                       {incidentData.affected_systems?.length > 0 ? incidentData.affected_systems.map((sys, idx) => (
                         <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">{sys}</span>
                       )) : <span className="text-sm text-slate-500">None detected</span>}
                     </div>
                   </div>
                   <div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Timeline Summary</div>
                     <p className="text-sm text-slate-700 leading-relaxed font-medium">{incidentData.timeline}</p>
                   </div>
                </div>

                <div className="mb-8">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-left">Predicted Root Causes</div>
                   <div className="space-y-3">
                     {incidentData.root_causes?.map((causeObj, idx) => (
                       <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                          <span className="text-sm font-semibold text-slate-800 text-left">{causeObj?.cause || typeof causeObj === 'string' ? causeObj?.cause || causeObj : JSON.stringify(causeObj)}</span>
                          {causeObj?.confidence && (
                            <span className="text-xs font-bold bg-white text-orange-600 px-2 py-1 rounded shadow-sm border border-slate-100">{causeObj.confidence}% Conf.</span>
                          )}
                       </div>
                     ))}
                     {(!incidentData.root_causes || incidentData.root_causes.length === 0) && (
                        <span className="text-sm text-slate-500">No root causes identified.</span>
                     )}
                   </div>
                </div>

                <div className="flex-1">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-left">Engineering Brief</div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed text-left">
                     {incidentData.engineering_summary}
                   </div>
                </div>

             </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
