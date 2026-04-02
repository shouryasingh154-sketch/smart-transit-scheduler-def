import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron, Stars } from "@react-three/drei";

function Hero3DBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1.5} />
        <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
          <Icosahedron args={[1.5, 4]} position={[4, 0, -2]} rotation={[0, 0, 0]}>
             <MeshDistortMaterial
                color="#0ea5e9"
                attach="material"
                distort={0.5}
                speed={2.5}
                roughness={0.1}
                metalness={0.9}
                wireframe={true}
              />
          </Icosahedron>
        </Float>
        <Float speed={2} rotationIntensity={2} floatIntensity={3}>
          <Icosahedron args={[0.8, 2]} position={[-4, 2, -4]} rotation={[0, 0, 0]}>
             <MeshDistortMaterial
                color="#3b82f6"
                attach="material"
                distort={0.3}
                speed={3}
                roughness={0.3}
                metalness={0.8}
                wireframe={true}
              />
          </Icosahedron>
        </Float>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
      </Canvas>
    </div>
  );
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-primary/20 text-white py-20 md:py-36 overflow-hidden min-h-[85vh] flex items-center">
        
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        
        <Hero3DBackground />

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={fadeUp} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-primary-foreground font-semibold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                 🚀 Next-Generation Transit Matrix
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-white drop-shadow-md">
                Smart Bus Scheduling
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  Made Simple
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-xl text-slate-300 mb-10 max-w-lg leading-relaxed font-medium">
                Optimize your public transport network with real-time scheduling,
                intelligent route management, and fluid data insights.
              </motion.p>

              {/* 🔥 BUTTONS */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5">
                <Link
                  to="/book"
                  className="group relative overflow-hidden bg-white text-slate-900 px-8 py-4 rounded-xl font-black transition-all transform hover:scale-[1.03] shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">Initialize Search</span>
                </Link>

                <Link
                  to="/admin"
                  className="group bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all border-2 border-white/20 hover:border-white/50 flex items-center justify-center backdrop-blur-md"
                >
                   <span className="relative z-10 flex items-center gap-2">Admin Uplink</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, rotateX: 10, y: 40 }}
               animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
               transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
               className="hidden md:block perspective-[1000px]"
            >
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-gpu hover:-translate-y-2 transition-transform duration-500">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { val: "47", label: "Active Matrices" },
                    { val: "12.4K", label: "Daily Transits" },
                    { val: "99%", label: "System Uptime" },
                    { val: "28", label: "Core Routes" }
                  ].map((stat, i) => (
                    <motion.div 
                       key={i}
                       whileHover={{ scale: 1.05, y: -5 }}
                       className="bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors duration-300" />
                      <div className="text-4xl font-black mb-2 text-white drop-shadow-md">{stat.val}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-background py-32 overflow-hidden border-t border-border">
        {/* Glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="container text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground">
            Ready to Transform Your Network?
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
            Jump into the matrix and experience zero-latency scheduling operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/auth"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 hover:-translate-y-1"
            >
              System Login
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}