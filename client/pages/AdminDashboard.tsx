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
    <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary mb-2" />
        <p className="text-foreground/60">Connecting to Campus Server...</p>
    </div>
  );

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-primary">Smart Campus Admin</h1>
            <p className="text-foreground/70">Manage routes and demand-based scheduling</p>
          </div>
          <button 
            onClick={() => setShowSmartGenModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-4 h-4" /> Smart Auto-Gen
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground/70">Total Schedules</h3>
                <Clock className="w-5 h-5 text-primary" />
             </div>
             <div className="text-3xl font-bold">{schedules.length}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground/70">Configured Routes</h3>
                <MapPin className="w-5 h-5 text-accent" />
             </div>
             <div className="text-3xl font-bold">{routes.length}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground/70">Number of Buses</h3>
                <TrendingUp className="w-5 h-5 text-success" />
             </div>
             <div className="text-3xl font-bold text-success"></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
          {["overview", "heatmap", "routes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 py-3 font-semibold transition-colors border-b-2 capitalize whitespace-nowrap ${
                selectedTab === tab ? "border-primary text-primary" : "border-transparent text-foreground/70 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT SECTIONS --- */}

        {selectedTab === "overview" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Live Schedule Board</h2>
              <button 
                onClick={() => setShowAddBusModal(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Bus
              </button>
            </div>

            <div className="space-y-3">
              {schedules.length === 0 ? (
                <p className="text-center py-10 text-foreground/50">No schedules generated yet. Try Smart Auto-Gen!</p>
              ) : (
                schedules.map((sch: any) => (
                  <div key={sch._id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg"><Clock className="text-primary w-5 h-5" /></div>
                        <div>
                          <div className="font-bold">{sch.bus?.busNumber || "N/A"}</div>
                          <div className="text-sm text-foreground/60">
                            {sch.route?.source} → {sch.route?.destination}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">
                            {new Date(sch.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className={`text-xs font-bold ${sch.status === 'ACTIVE' ? 'text-success' : 'text-destructive'}`}>
                          {sch.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedTab === "routes" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Network Route List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.length === 0 ? (
                <p className="col-span-2 text-center py-10 text-foreground/50 border-2 border-dashed rounded-xl">
                    No routes found.
                </p>
              ) : (
                routes.map((route: any) => (
                  <div key={route._id} className="border border-border rounded-xl p-5 hover:border-primary/50 transition-all bg-muted/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-primary">{route.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <span className="font-medium">{route.source}</span>
                          <span className="text-foreground/30">→</span>
                          <span className="font-medium">{route.destination}</span>
                        </div>
                      </div>
                      <div className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-1 rounded uppercase">
                        {route.stops?.length || 0} Stops
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedTab === "heatmap" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">Demand Analysis</h2>
                <p className="text-sm text-foreground/60">Real-time demand data from heatmap collection</p>
              </div>
              <button 
                onClick={() => setIsVisualMode(!isVisualMode)}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-bold transition-colors border border-border"
              >
                {isVisualMode ? <LayoutGrid size={16}/> : <BarChart3 size={16} />}
                {isVisualMode ? "View Grid" : "Visualize Demand"}
              </button>
            </div>

            {isVisualMode ? (
              /* --- BAR CHART VISUALIZATION --- */
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-end justify-between h-48 gap-2 border-b border-border pb-2 px-4">
                  {heatmaps.slice(0, 12).map((heat: any) => (
                    <div key={heat._id} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full">
                         <div 
                          style={{ height: `${Math.min(heat.count, 100)}%` }}
                          className={`w-full rounded-t-md transition-all duration-700 ${heat.count > 45 ? 'bg-red-500' : 'bg-primary'}`}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-sm">
                          {heat.count} pax
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-foreground/40">{heat.hour}:00</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 text-xs font-bold">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /> High Demand</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded" /> Regular Demand</div>
                </div>
              </div>
            ) : (
              /* --- DATA GRID MODE --- */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heatmaps.length === 0 ? (
                  <p className="col-span-full text-center py-10 text-foreground/50 border-2 border-dashed rounded-xl">No heatmap data found.</p>
                ) : (
                  heatmaps.map((heat: any) => (
                    <div key={heat._id} className="border border-border rounded-xl p-4 bg-muted/5 relative overflow-hidden group">
                      {heat.count > 45 && <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-bl-full flex items-start justify-end p-2 text-red-500"><AlertTriangle size={14}/></div>}
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg"><TrendingUp size={16} /></div>
                        <div className={`text-2xl font-bold ${heat.count > 45 ? 'text-red-500' : 'text-primary'}`}>{heat.count}</div>
                      </div>
                      <div className="text-xs font-bold uppercase text-foreground/40 mb-1">Route Context</div>
                      <div className="text-sm font-semibold truncate mb-4">{heat.source} → {heat.destination}</div>
                      <div className="flex justify-between items-center pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-foreground/60"><Clock size={12} /> {heat.hour}:00</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${heat.count > 45 ? 'border-red-500/20 text-red-500' : 'border-primary/20 text-primary'}`}>
                          {heat.count > 45 ? 'Peak' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- MODALS --- */}

      {showAddBusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-1">Register New Bus</h2>
            <p className="text-sm text-foreground/60 mb-6">Add a bus to the fleet to start scheduling.</p>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Bus Number</label>
                <input
                  type="text"
                  placeholder="e.g., CAMPUS-01"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={newBusData.busNumber}
                  onChange={(e) => setNewBusData({...newBusData, busNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Primary Route</label>
                <select
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background outline-none focus:ring-2 focus:ring-primary"
                  value={newBusData.routeId}
                  onChange={(e) => setNewBusData({...newBusData, routeId: e.target.value})}
                >
                  <option value="">Select Primary Route</option>
                  {routes.map((r: any) => (
                    <option key={r._id} value={r._id}>{r.name} ({r.source}-{r.destination})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Capacity</label>
                    <input type="number" className="w-full px-4 py-2 border border-border rounded-lg bg-background" value={newBusData.capacity} onChange={(e) => setNewBusData({...newBusData, capacity: parseInt(e.target.value)})} />
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase text-foreground/50 mb-1 block">Type</label>
                    <select className="w-full px-4 py-2 border border-border rounded-lg bg-background outline-none" value={newBusData.type} onChange={(e) => setNewBusData({...newBusData, type: e.target.value})}>
                        <option value="AC">AC</option>
                        <option value="NON_AC">Non-AC</option>
                    </select>
                 </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddBusModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg font-semibold hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAddBus} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary/90 transition-transform active:scale-95">Save Bus</button>
            </div>
          </div>
        </div>
      )}

      {showSmartGenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
                <Zap className="text-orange-500 fill-orange-500 w-6 h-6" />
                <h2 className="text-2xl font-bold">Smart Auto-Gen</h2>
            </div>
            <p className="text-sm text-foreground/60 mb-6">Algorithm will analyze heatmap demand and generate schedules automatically.</p>
            <div className="space-y-4 mb-6">
              <select
                className="w-full px-4 py-2 border border-border rounded-lg bg-background outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setSmartGenData({...smartGenData, routeId: e.target.value})}
              >
                <option value="">Select Target Route</option>
                {routes.map((r: any) => (
                  <option key={r._id} value={r._id}>{r.source} to {r.destination}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="time" className="p-2 border rounded-lg bg-background" value={smartGenData.startTime} onChange={(e) => setSmartGenData({...smartGenData, startTime: e.target.value})} />
                <input type="time" className="p-2 border rounded-lg bg-background" value={smartGenData.endTime} onChange={(e) => setSmartGenData({...smartGenData, endTime: e.target.value})} />
              </div>
              <input type="date" className="w-full p-2 border rounded-lg bg-background" value={smartGenData.date} onChange={(e) => setSmartGenData({...smartGenData, date: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSmartGenModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg">Cancel</button>
              <button onClick={handleSmartGenerate} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold transition-transform active:scale-95">Start Process</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}