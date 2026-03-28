import { Layout } from "@/components/Layout";
import { useState, useEffect, useMemo } from "react";
import { MapPin, Search, Clock, Users, Loader2, Navigation, AlertCircle } from "lucide-react";

const API_BASE = `${import.meta.env.VITE_API}/schedule`;

export default function BookRide() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [availableBuses, setAvailableBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  const [startStopName, setStartStopName] = useState<string | null>(null);
  const [endStopName, setEndStopName] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchInitialRoutes();
  }, []);

  const fetchInitialRoutes = async () => {
    try {
      const res = await fetch(`${API_BASE}/routes`);
      const data = await res.json();
      setRoutes(data.data || []);
    } catch (err) {
      console.error("Failed to load routes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFindBuses = async () => {
    if (!startStopName || !endStopName) return;
    setSearching(true);
    setShowResults(false);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API}/bus/between-stops?startLocation=${encodeURIComponent(startStopName)}&endLocation=${encodeURIComponent(endStopName)}`
      );
      const data = await res.json();
      setAvailableBuses(data);
      setShowResults(true);
    } catch (err) {
      alert("Error searching for buses.");
    } finally {
      setSearching(false);
    }
  };

  const allAvailableStops = useMemo(() => {
    const stops = routes.flatMap(r => r.stops || []);
    return stops.filter((stop, index, self) =>
      index === self.findIndex((t) => t.name === stop.name)
    );
  }, [routes]);

  // --- MAP LOGIC START ---
  // This calculates the boundaries so the map "zooms" into your specific city/stops
  const bounds = useMemo(() => {
    if (allAvailableStops.length === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    const lons = allAvailableStops.map(s => s.location.coordinates[0]);
    const lats = allAvailableStops.map(s => s.location.coordinates[1]);
    const padX = (Math.max(...lons) - Math.min(...lons)) * 0.15 || 0.01;
    const padY = (Math.max(...lats) - Math.min(...lats)) * 0.15 || 0.01;
    return {
      minX: Math.min(...lons) - padX,
      maxX: Math.max(...lons) + padX,
      minY: Math.min(...lats) - padY,
      maxY: Math.max(...lats) + padY
    };
  }, [allAvailableStops]);

  const getCoords = (stop: any) => {
    const lon = stop.location?.coordinates[0] || 0;
    const lat = stop.location?.coordinates[1] || 0;
    const x = ((lon - bounds.minX) / (bounds.maxX - bounds.minX)) * 100;
    const y = 100 - ((lat - bounds.minY) / (bounds.maxY - bounds.minY)) * 100;
    return { x, y };
  };
  // --- MAP LOGIC END ---

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin w-8 h-8 text-primary" />
    </div>
  );

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-2">Book Your Ride</h1>
        <p className="text-foreground/70 mb-12">Select points to see real-time availability and demand-based pricing</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Map Area */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border h-[500px] relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

              {/* FIXED SVG: Using viewBox to avoid % errors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {routes.map((route) => (
                  <polyline
                    key={route._id}
                    points={route.stops.map((s: any) => `${getCoords(s).x},${getCoords(s).y}`).join(" ")}
                    fill="none"
                    stroke="currentColor"
                    className="text-primary/20"
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                    strokeDasharray="1,1"
                  />
                ))}
              </svg>

              {allAvailableStops.map((stop) => {
                const pos = getCoords(stop);
                return (
                  <button
                    key={stop._id}
                    onClick={() => {
                      if (!startStopName) setStartStopName(stop.name);
                      else setEndStopName(stop.name);
                    }}
                    className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-xl border-2 ${
                      startStopName === stop.name ? "bg-green-500 border-white scale-125 ring-4 ring-green-500/20" : 
                      endStopName === stop.name ? "bg-red-500 border-white scale-125 ring-4 ring-red-500/20" : 
                      "bg-white dark:bg-slate-800 border-primary text-primary hover:scale-110"
                    }`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {/* Bottom Status Cards */}
            <div className="grid grid-cols-2 gap-4">
               <div className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${startStopName ? 'border-green-500 bg-green-500/5' : 'border-dashed border-border'}`}>
                 <label className="text-[10px] font-black text-green-600 uppercase mb-1 block">Start Point</label>
                 <div className="font-bold text-lg truncate">{startStopName || "Pick on map/list"}</div>
               </div>
               <div className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${endStopName ? 'border-red-500 bg-red-500/5' : 'border-dashed border-border'}`}>
                 <label className="text-[10px] font-black text-red-600 uppercase mb-1 block">Destination</label>
                 <div className="font-bold text-lg truncate">{endStopName || "Select Drop-off"}</div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* JOURNEY PLANNER - Restored original UI */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" /> Journey Planner
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase px-1">Starting From</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {allAvailableStops.map(stop => (
                      <button 
                        key={`start-${stop._id}`}
                        onClick={() => {setStartStopName(stop.name); setShowResults(false);}}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${startStopName === stop.name ? 'bg-green-500 text-white font-bold' : 'hover:bg-muted border border-transparent'}`}
                      >
                        {stop.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-l pl-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase px-1">Going To</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {allAvailableStops.map(stop => (
                      <button 
                        key={`end-${stop._id}`}
                        onClick={() => {setEndStopName(stop.name); setShowResults(false);}}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-all ${endStopName === stop.name ? 'bg-red-500 text-white font-bold' : 'hover:bg-muted border border-transparent'}`}
                      >
                        {stop.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleFindBuses}
                disabled={!startStopName || !endStopName || searching}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {searching ? <Loader2 className="animate-spin w-5 h-5" /> : "Search Upcoming Buses"}
              </button>
            </div>

            {/* Results section */}
            {showResults && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <h3 className="font-bold text-sm flex items-center gap-2 italic px-1">
                  <Clock className="w-4 h-4 text-orange-500" /> Upcoming Arrivals
                </h3>
                {availableBuses.length > 0 ? (
                  availableBuses.map((bus: any) => (
                    <div key={bus.scheduleId} className="bg-card border border-border p-4 rounded-2xl hover:border-primary transition-all shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded">Bus: {bus.bus?.busNumber || "EXP"}</span>
                        <span className="text-lg font-black text-primary">₹{bus.price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="text-xl font-bold">{new Date(bus.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                         <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users size={14}/> {bus.availableSeats} Left</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-muted/30 border border-dashed rounded-2xl p-8 text-center text-xs text-muted-foreground uppercase font-bold">
                    No Direct Routes Today
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}