import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Clock,
  Zap,
  Loader2,
  BarChart3,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// API Endpoints
const API_BASE = `${import.meta.env.VITE_API}/schedule`;
const HEATMAP_API = `${import.meta.env.VITE_API}/heatmap`;


export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "heatmap" | "routes">("overview");
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [heatmaps, setHeatmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  
  // Heatmap View Toggle
  const [isVisualMode, setIsVisualMode] = useState(false);

  // Modals & Forms
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showSmartGenModal, setShowSmartGenModal] = useState(false);
  
  const [newBusData, setNewBusData] = useState({ 
    busNumber: "", 
    capacity: 40, 
    routeId: "", 
    type: "NON_AC" 
  });

  const [smartGenData, setSmartGenData] = useState({ 
    routeId: "", 
    numberOfBuses: 2, 
    startTime: "08:00", 
    endTime: "20:00", 
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [schRes, routeRes, heatRes] = await Promise.all([
        fetch(`${API_BASE}/all`),
        fetch(`${API_BASE}/routes`),
        fetch(HEATMAP_API),
        
      ]);
      const bussRes = await fetch(`${API_BASE}/buses`);
      const schData = await schRes.json();
      const routeData = await routeRes.json();
      const heatData = await heatRes.json();
      
      setSchedules(schData.schedules || []);
      setRoutes(routeData.data || []); 
      setHeatmaps(heatData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async () => {
    if (!newBusData.routeId || !newBusData.busNumber) {
        alert("Please fill in Bus Number and Route");
        return;
    }

    try {
      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBusData),
      });
      const result = await res.json();
      if (result.success) {
        setShowAddBusModal(false);
        fetchInitialData();
        setNewBusData({ busNumber: "", capacity: 40, routeId: "", type: "NON_AC" });
      } else {
        alert(result.message || "Error adding bus");
      }
    } catch (err) {
      alert("Server connection failed");
    }
  };

  const handleSmartGenerate = async () => {
    try {
      const res = await fetch(`${API_BASE}/auto-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smartGenData),
      });
      if (res.ok) {
        alert("Smart schedules generated!");
        setShowSmartGenModal(false);
        fetchInitialData();
      }
    } catch (err) {
      alert("Smart generation failed");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background">
        <motion.div 
           animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        </motion.div>
        <p className="text-foreground/50 tracking-[0.2em] font-black text-xs uppercase animate-pulse">Syncing Network Telemetry...</p>
    </div>
  );

  const tabVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    enter: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.2 } }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container py-12 relative"
      >
        {/* Glow */}
        <div className="absolute top-0 right-10 w-[500px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <h1 className="text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 drop-shadow-sm">System Command</h1>
            <p className="text-foreground/60 font-medium tracking-wide">Global overview of matrix metrics and demand topology.</p>
          </motion.div>

          <motion.button 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(249, 115, 22, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSmartGenModal(true)}
            className="bg-gradient-to-br from-orange-400 to-red-500 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 transition-all tracking-wider shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-5 h-5 fill-white" /> SMART AUTO-GEN
          </motion.button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Active Matrices", val: schedules.length, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Network Paths", val: routes.length, icon: MapPin, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
            { label: "Fleet Capacity", val: buses.length || "0", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`bg-card/40 backdrop-blur-xl border ${stat.border} rounded-[2rem] p-6 shadow-xl relative overflow-hidden group`}
            >
               <div className={`absolute -right-10 -top-10 w-32 h-32 ${stat.bg} rounded-full blur-[40px] group-hover:blur-[50px] transition-all`} />
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground">{stat.label}</h3>
                  <div className={`${stat.bg} p-2.5 rounded-xl`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
               </div>
               <div className={`text-5xl font-black ${stat.color} relative z-10 drop-shadow-sm`}>{stat.val}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-muted/50 p-2 rounded-2xl backdrop-blur-md w-max border border-border/50 shadow-inner">
          {["overview", "heatmap", "routes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-6 py-2.5 font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-300 ${
                selectedTab === tab ? "bg-background text-primary shadow-md border-border/50" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT SECTIONS --- */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {selectedTab === "overview" && (
              <motion.div key="overview" variants={tabVariants} initial="hidden" animate="enter" exit="exit" className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-[2.5rem] p-8 shadow-2xl relative">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                  <h2 className="text-3xl font-black flex items-center gap-3">
                     <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-500/20" />
                     Live Schedule Feed
                  </h2>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddBusModal(true)}
                    className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-5 py-2.5 rounded-xl font-black tracking-wide text-xs flex items-center gap-2 transition-colors uppercase shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Entity
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {schedules.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
                      <p className="text-foreground/40 font-black tracking-widest text-xs uppercase">Matrix Empty. Request Auto-Gen.</p>
                    </div>
                  ) : (
                    schedules.map((sch: any, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={sch._id} 
                        className="bg-background/60 border border-border/60 rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all group overflow-hidden relative"
                      >
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-center pl-2">
                          <div className="flex items-center gap-5">
                            <div className="bg-primary/10 p-3 rounded-xl border border-primary/10 group-hover:scale-110 transition-transform"><Clock className="text-primary w-5 h-5" /></div>
                            <div>
                              <div className="font-black text-lg text-foreground tracking-tight">{sch.bus?.busNumber || "UNASSIGNED"}</div>
                              <div className="text-xs font-bold text-muted-foreground flex items-center gap-2 mt-1">
                                <MapPin size={12} className="text-blue-500" />
                                {sch.route?.source} <span className="text-border mx-1">→</span> {sch.route?.destination}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">
                                {new Date(sch.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className={`text-[10px] uppercase tracking-widest font-black mt-1 px-2 py-0.5 rounded-md inline-block ${sch.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                              {sch.status}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {selectedTab === "routes" && (
              <motion.div key="routes" variants={tabVariants} initial="hidden" animate="enter" exit="exit" className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-[2.5rem] p-8 shadow-2xl">
                <h2 className="text-3xl font-black flex items-center gap-3 mb-8">
                   <span className="w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-cyan-500/20" />
                   Network Paths
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {routes.length === 0 ? (
                    <div className="col-span-2 text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
                        <p className="text-foreground/40 font-black tracking-widest text-xs uppercase">No active paths initialized.</p>
                    </div>
                  ) : (
                    routes.map((route: any, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={route._id} 
                        className="bg-background/50 border border-border/60 rounded-3xl p-6 hover:border-cyan-500/40 hover:shadow-lg transition-all relative overflow-hidden group"
                      >
                         <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500/5 rounded-full blur-[30px] group-hover:bg-cyan-500/10 transition-colors" />
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <h4 className="font-black text-xl text-foreground tracking-tight drop-shadow-sm">{route.name}</h4>
                            <div className="flex items-center gap-3 mt-3 text-sm">
                              <span className="font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded truncate max-w-[120px]">{route.source}</span>
                              <span className="text-cyan-500">→</span>
                              <span className="font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded truncate max-w-[120px]">{route.destination}</span>
                            </div>
                          </div>
                          <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-lg uppercase shadow-sm">
                            {route.stops?.length || 0} Nodes
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {selectedTab === "heatmap" && (
              <motion.div key="heatmap" variants={tabVariants} initial="hidden" animate="enter" exit="exit" className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <h2 className="text-3xl font-black flex items-center gap-3">
                     <span className="w-3 h-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20" />
                     Demand Synthesis
                  </h2>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsVisualMode(!isVisualMode)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border/80 hover:border-border rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                  >
                    {isVisualMode ? <LayoutGrid size={16} className="text-primary"/> : <BarChart3 size={16} className="text-primary" />}
                    {isVisualMode ? "Data Matrix" : "Graph Visualization"}
                  </motion.button>
                </div>

                {isVisualMode ? (
                  /* --- BAR CHART VISUALIZATION --- */
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                    <div className="flex items-end justify-between h-56 gap-3 border-b-2 border-border/50 pb-2 px-4 relative">
                       {/* Background Grid Lines */}
                       <div className="absolute inset-0 flex flex-col justify-between -z-10 opacity-10 pointer-events-none">
                         {[...Array(5)].map((_, i) => <div key={i} className="w-full border-b border-dashed border-foreground" />)}
                       </div>

                      {heatmaps.slice(0, 12).map((heat: any, i) => (
                        <div key={heat._id} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                          <div className="relative w-full flex justify-center h-full items-end">
                             <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.min(heat.count, 100)}%` }}
                              transition={{ delay: i * 0.05, duration: 0.8, type: "spring", damping: 12 }}
                              className={`w-4/5 rounded-t-xl transition-colors ${heat.count > 45 ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover/90 backdrop-blur-md text-popover-foreground text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-xl transform group-hover:-translate-y-2 pointer-events-none">
                              {heat.count} Units
                            </div>
                          </div>
                          <span className="text-[10px] font-black tracking-widest text-muted-foreground">{heat.hour}:00</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Peak Overload</div>
                      <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> Nominal Load</div>
                    </div>
                  </motion.div>
                ) : (
                  /* --- DATA GRID MODE --- */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {heatmaps.length === 0 ? (
                      <p className="col-span-full text-center py-20 text-foreground/40 font-black tracking-widest text-xs uppercase border border-dashed border-border/50 rounded-3xl">Scan Failed. No Telemetry.</p>
                    ) : (
                      heatmaps.map((heat: any, i) => (
                        <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.05 }}
                           key={heat._id} 
                           className="bg-background/50 border border-border/60 rounded-3xl p-5 relative overflow-hidden group hover:shadow-lg transition-all"
                        >
                          {heat.count > 45 && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-[100px] flex items-start justify-end p-3 text-red-500"><AlertTriangle size={18} className="animate-pulse"/></div>}
                          <div className="flex justify-between items-start mb-6">
                            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-500 p-2.5 rounded-xl"><TrendingUp size={18} /></div>
                            <div className={`text-3xl font-black drop-shadow-md ${heat.count > 45 ? 'text-red-500' : 'text-primary'}`}>{heat.count}</div>
                          </div>
                          <div className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-1.5">Sector Path</div>
                          <div className="text-sm font-bold truncate mb-5 text-foreground drop-shadow-sm">{heat.source} → {heat.destination}</div>
                          <div className="flex justify-between items-center pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-muted-foreground bg-muted/50 px-2 py-1 rounded-md"><Clock size={12} /> {heat.hour}:00</div>
                            <span className={`text-[9px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase border ${heat.count > 45 ? 'border-red-500/30 text-red-500 shadow-sm shadow-red-500/10' : 'border-blue-500/30 text-blue-500 shadow-sm shadow-blue-500/10'}`}>
                              {heat.count > 45 ? 'Critical' : 'Stable'}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>

      {/* --- ANIMATED MODALS --- */}
      <AnimatePresence>
        {showAddBusModal && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              className="bg-background/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
              <h2 className="text-3xl font-black mb-2 relative z-10 text-foreground">Register Entity</h2>
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-8 relative z-10">Add matrix node to fleet array.</p>
              
              <div className="space-y-5 mb-8 relative z-10">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-1.5 block">Entity ID</label>
                  <input
                    type="text"
                    placeholder="e.g., MTX-01"
                    className="w-full px-5 py-3 border border-border/50 rounded-xl bg-muted/20 outline-none focus:ring-2 focus:ring-primary font-mono text-sm shadow-inner transition-shadow"
                    value={newBusData.busNumber}
                    onChange={(e) => setNewBusData({...newBusData, busNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-1.5 block">Assign Path</label>
                  <select
                    className="w-full px-5 py-3 border border-border/50 rounded-xl bg-muted/20 outline-none focus:ring-2 focus:ring-primary text-sm font-semibold shadow-inner"
                    value={newBusData.routeId}
                    onChange={(e) => setNewBusData({...newBusData, routeId: e.target.value})}
                  >
                    <option value="">Select Routing Path</option>
                    {routes.map((r: any) => (
                      <option key={r._id} value={r._id}>{r.name} ({r.source} - {r.destination})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                   <div>
                      <label className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-1.5 block">Load Cap</label>
                      <input type="number" className="w-full px-5 py-3 border border-border/50 rounded-xl bg-muted/20 font-mono shadow-inner outline-none focus:ring-2 focus:ring-primary" value={newBusData.capacity} onChange={(e) => setNewBusData({...newBusData, capacity: parseInt(e.target.value)})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-1.5 block">Unit Specs</label>
                      <select className="w-full px-5 py-3 border border-border/50 rounded-xl bg-muted/20 outline-none font-semibold shadow-inner focus:ring-2 focus:ring-primary" value={newBusData.type} onChange={(e) => setNewBusData({...newBusData, type: e.target.value})}>
                          <option value="AC">Climate Ctrl</option>
                          <option value="NON_AC">Standard</option>
                      </select>
                   </div>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <button onClick={() => setShowAddBusModal(false)} className="flex-1 px-5 py-3.5 border border-border/50 rounded-xl font-bold text-sm hover:bg-muted/50 transition-colors uppercase tracking-wider">Abort</button>
                <button onClick={handleAddBus} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-black text-sm transition-transform active:scale-95 shadow-lg shadow-blue-500/20 uppercase tracking-wider">Commit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSmartGenModal && (
          <motion.div 
             initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
             animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
             exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              className="bg-card/90 backdrop-blur-3xl border border-orange-500/30 rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_80px_rgba(249,115,22,0.2)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full blur-[60px] pointer-events-none" />
              <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg shadow-orange-500/30">
                     <Zap className="fill-white w-6 h-6 stroke-white" />
                  </div>
                  <h2 className="text-3xl font-black text-foreground drop-shadow-sm">Auto-Gen</h2>
              </div>
              <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-8 relative z-10">Algorithm will analyze topology matrices to structure optimal timings.</p>
              
              <div className="space-y-5 mb-8 relative z-10">
                <select
                  className="w-full px-5 py-3.5 border border-border/50 rounded-xl bg-background/50 outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm shadow-inner"
                  onChange={(e) => setSmartGenData({...smartGenData, routeId: e.target.value})}
                >
                  <option value="">Select Target Topology</option>
                  {routes.map((r: any) => (
                    <option key={r._id} value={r._id}>{r.source} ➞ {r.destination}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase block">T-Start</label>
                    <input type="time" className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background/50 font-mono shadow-inner outline-none focus:ring-2 focus:ring-orange-500" value={smartGenData.startTime} onChange={(e) => setSmartGenData({...smartGenData, startTime: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase block">T-End</label>
                    <input type="time" className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background/50 font-mono shadow-inner outline-none focus:ring-2 focus:ring-orange-500" value={smartGenData.endTime} onChange={(e) => setSmartGenData({...smartGenData, endTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase block">Execution Date</label>
                  <input type="date" className="w-full px-5 py-3 border border-border/50 rounded-xl bg-background/50 font-mono shadow-inner outline-none focus:ring-2 focus:ring-orange-500" value={smartGenData.date} onChange={(e) => setSmartGenData({...smartGenData, date: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <button onClick={() => setShowSmartGenModal(false)} className="flex-1 px-5 py-3.5 border border-border/50 rounded-xl font-bold hover:bg-muted/50 transition-colors uppercase text-sm tracking-wider">Halt</button>
                <button onClick={handleSmartGenerate} className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 text-white py-3.5 rounded-xl font-black transition-transform active:scale-95 shadow-lg shadow-orange-500/20 uppercase tracking-wider text-sm">Execute</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}