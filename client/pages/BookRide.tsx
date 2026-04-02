import { Layout } from "@/components/Layout";
import { useState, useEffect, useMemo } from "react";
import { MapPin, Search, Clock, Users, Loader2, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- 3D & Animation Imports ---
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

const API_BASE = `${import.meta.env.VITE_API}/schedule`;

/* ------------- 3D Scene Components ------------- */
function AbstractGlobe() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Sphere args={[1, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color="hsl(var(--primary))"
          attach="material"
          distort={0.4}
          speed={2.5}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
    </Float>
  );
}

/* ------------- Map Components ------------- */
function MapBounds({ stops }: { stops: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.location.coordinates[1], s.location.coordinates[0]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops, map]);
  return null;
}

const createDivIcon = (isStart: boolean, isEnd: boolean) => {
  const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300";
  const stateClasses = isStart
    ? "bg-green-500 border-white scale-125 ring-4 ring-green-500/20 text-white z-50"
    : isEnd
    ? "bg-blue-500 border-white scale-125 ring-4 ring-blue-500/20 text-white z-50"
    : "bg-background border-primary text-primary hover:scale-110";

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="${baseClasses} ${stateClasses}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

/* ------------- Main Page ------------- */
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

  // Framer Animation Definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>
    </div>
  );

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container py-12"
      >
        
        {/* Header Section with 3D Canvas */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="z-10 relative">
             {/* Decorative Background Glow */}
            <div className="absolute -inset-12 bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />
            <motion.h1 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-5xl md:text-6xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-cyan-400"
            >
              Book Your Ride
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-foreground/70 text-lg max-w-xl font-medium"
            >
              Select interconnected nodes to visualize real-time transit telemetry and fluid price action tracking.
            </motion.p>
          </div>
          
          <div className="h-32 w-32 hidden md:block opacity-80 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 4] }}>
              <AbstractGlobe />
            </Canvas>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Map Area */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-[2rem] border-[6px] border-border/40 h-[500px] relative overflow-hidden shadow-2xl shadow-primary/10">
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                className="w-full h-full z-0"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapBounds stops={allAvailableStops} />

                {routes.map((route) => (
                  <Polyline
                    key={`route-${route._id}`}
                    positions={route.stops.map((s: any) => [s.location.coordinates[1], s.location.coordinates[0]])}
                    color="hsl(var(--primary))"
                    weight={4}
                    opacity={0.4}
                    dashArray="5, 10"
                    lineCap="round"
                    lineJoin="round"
                  />
                ))}

                {allAvailableStops.map((stop) => {
                  const isStart = startStopName === stop.name;
                  const isEnd = endStopName === stop.name;
                  return (
                    <Marker
                      key={`stop-${stop._id}`}
                      position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
                      icon={createDivIcon(isStart, isEnd)}
                      eventHandlers={{
                        click: () => {
                          if (!startStopName) setStartStopName(stop.name);
                          else setEndStopName(stop.name);
                        },
                      }}
                    >
                      <Popup className="font-sans border-0 shadow-xl rounded-2xl overflow-hidden p-0 m-0 custom-popup">
                        <div className="p-3 bg-background border border-border/50 text-foreground">
                           <div className="font-black text-sm mb-2">{stop.name}</div>
                           <div className="flex gap-2 mt-2">
                             <button
                               onClick={() => { setStartStopName(stop.name); setShowResults(false); }}
                               className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                             >
                               Set Start
                             </button>
                             <button
                               onClick={() => { setEndStopName(stop.name); setShowResults(false); }}
                               className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                             >
                               Set End
                             </button>
                           </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Bottom Status Cards */}
            <div className="grid grid-cols-2 gap-4">
               <motion.div layout className={`p-5 rounded-3xl border-2 transition-all shadow-lg ${startStopName ? 'border-green-500 bg-green-500/10' : 'border-dashed border-border bg-card/40 backdrop-blur-sm'}`}>
                 <label className="text-[10px] font-black tracking-widest text-green-600 uppercase mb-1 block">Telemetry Start</label>
                 <div className="font-bold text-xl truncate">{startStopName || "Select Location Node"}</div>
               </motion.div>
               <motion.div layout className={`p-5 rounded-3xl border-2 transition-all shadow-lg ${endStopName ? 'border-blue-500 bg-blue-500/10' : 'border-dashed border-border bg-card/40 backdrop-blur-sm'}`}>
                 <label className="text-[10px] font-black tracking-widest text-blue-500 uppercase mb-1 block">Destination Node</label>
                 <div className="font-bold text-xl truncate">{endStopName || "Awaiting Target"}</div>
               </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            {/* JOURNEY PLANNER */}
            <div className="bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:shadow-primary/5 transition-all duration-500">
              {/* Dynamic light effects */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-700" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-700" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <motion.span 
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl text-primary ring-1 ring-primary/20 shadow-inner"
                  >
                    <Navigation className="w-5 h-5" />
                  </motion.span>
                  Global Planner
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8 bg-background/40 backdrop-blur-md p-5 rounded-3xl ring-1 ring-border shadow-inner">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-4 ring-green-500/20" />
                      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">From</p>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {allAvailableStops.map(stop => (
                        <motion.button 
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          key={`start-${stop._id}`}
                          onClick={() => {setStartStopName(stop.name); setShowResults(false);}}
                          className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${startStopName === stop.name ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'hover:bg-card bg-background/50 border border-border/50'}`}
                        >
                          {stop.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-l-2 border-border/50 pl-4 relative">
                    <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-6 h-6 bg-card rounded-full border-2 border-border/50 flex items-center justify-center shadow-lg">
                      <Search className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-500/20" />
                      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">To</p>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {allAvailableStops.map(stop => (
                        <motion.button 
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          key={`end-${stop._id}`}
                          onClick={() => {setEndStopName(stop.name); setShowResults(false);}}
                          className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${endStopName === stop.name ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-card bg-background/50 border border-border/50'}`}
                        >
                          {stop.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={(!startStopName || !endStopName || searching) ? {} : { scale: 1.03, y: -2 }}
                  whileTap={(!startStopName || !endStopName || searching) ? {} : { scale: 0.97 }}
                  onClick={handleFindBuses}
                  disabled={!startStopName || !endStopName || searching}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 text-white py-5 rounded-2xl font-black text-sm transition-all duration-300 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-xl shadow-primary/20 group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    {searching ? <Loader2 className="animate-spin w-5 h-5" /> : "Initiate Search Matrix"} 
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Results section */}
            <AnimatePresence>
              {showResults && (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="space-y-4"
                >
                  <motion.h3 variants={itemVariants} className="font-bold text-sm flex items-center gap-2 italic px-1 opacity-70">
                    <Clock className="w-4 h-4 text-orange-500" /> Incoming Transit Nodes
                  </motion.h3>
                  
                  {availableBuses.length > 0 ? (
                    availableBuses.map((bus: any) => (
                      <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, x: -5 }}
                        key={bus.scheduleId} 
                        className="bg-card/80 backdrop-blur-lg border border-border/50 p-5 rounded-3xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 shadow-sm">
                            MATRIX ID: {bus.bus?.busNumber || "EXP"}
                          </span>
                          <span className="text-2xl font-black text-primary drop-shadow-sm">₹{bus.price}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="text-2xl font-bold tracking-tight">{new Date(bus.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                           <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                             <Users size={14} className="text-blue-500"/> {bus.availableSeats} Slots 
                           </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div variants={itemVariants} className="bg-card/30 backdrop-blur-sm border border-dashed border-border/50 rounded-3xl p-10 text-center text-xs text-muted-foreground uppercase font-black tracking-widest shadow-inner">
                      No Transit Links Active
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}