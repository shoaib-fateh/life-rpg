import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import useSound from 'use-sound'; 

const TabNavigation = ({ tabNames, activeTab, setActiveTab }) => {
  const particlesInit = async (main) => await loadFull(main);
  const [hoveredTab, setHoveredTab] = useState(null);
  // const { play: playTabSwitch } = useSound('/sounds/quantum-switch.mp3');
  // const { play: playHover } = useSound('/sounds/energy-pulse.mp3');

  return (
    <div className="relative p-2 bg-gray-900/80 rounded-2xl backdrop-blur-xl border-2 border-white/10 shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)]">
      {/* Quantum Flux Particles */}
      <Particles
        init={particlesInit}
        className="absolute inset-0 pointer-events-none opacity-40"
        options={{
          particles: {
            number: { value: 30 },
            color: { value: ["#a855f7", "#8b5cf6", "#6366f1"] },
            size: { value: 3, random: true },
            move: {
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              attract: { enable: true, rotateX: 600, rotateY: 1200 }
            },
            opacity: { value: 0.7, random: true },
            line_linked: {
              enable: true,
              distance: 120,
              color: "#c4b5fd",
              opacity: 0.3,
              width: 1
            },
          },
          interactivity: {
            events: {
              onhover: { 
                enable: true, 
                mode: "repulse",
                parallax: { enable: true, force: 20 }
              }
            }
          }
        }}
      />

      <div className="flex gap-3 relative z-10">
        {Object.entries(tabNames).map(([key, name]) => {
          const isActive = activeTab === key;
          
          return (
            <motion.button
              key={key}
              onClick={() => {
                // playTabSwitch();
                setActiveTab(key);
              }}
              onHoverStart={() => {
                // playHover();
                setHoveredTab(key);
              }}
              onHoverEnd={() => setHoveredTab(null)}
              className={`relative px-8 py-4 text-sm font-bold rounded-xl z-10 transition-all ${
                isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <>
                  {/* Quantum Core */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-blue-600/80 rounded-xl border-2 border-purple-400/50 shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                    layoutId="quantumTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    animate={{
                      boxShadow: [
                        "0 0 30px rgba(139,92,246,0.5)",
                        "0 0 50px rgba(99,102,241,0.8)",
                        "0 0 30px rgba(139,92,246,0.5)",
                      ]
                    }}
                    transition={{ 
                      boxShadow: { duration: 3, repeat: Infinity }
                    }}
                  />

                  {/* Event Horizon */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-[radial-gradient(circle,rgba(168,85,247,0.4),transparent_70%)]"
                    animate={{ 
                      opacity: [0.4, 0.7, 0.4],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </>
              )}

              {/* Hover Quantum Effect */}
              {hoveredTab === key && !isActive && (
                <motion.div 
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-3">
                {name}
                {isActive && (
                  <motion.span
                    className="text-xl"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.3, 1],
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      y: { duration: 1.5, repeat: Infinity }
                    }}
                  >
                    {key === 'notifications' ? '🔮' : '⚛️'}
                  </motion.span>
                )}
              </span>

              {/* Quantum Burst */}
              {isActive && (
                <Particles
                  init={particlesInit}
                  className="absolute inset-0 pointer-events-none"
                  options={{
                    particles: {
                      number: { value: 20 },
                      color: { value: "#f0abfc" },
                      size: { value: 4, random: true },
                      move: { 
                        speed: 2,
                        direction: "outside",
                        out_mode: "destroy"
                      },
                      opacity: { value: 0.8, random: true },
                    },
                    emitters: {
                      position: { x: 50, y: 50 },
                      rate: { delay: 3, quantity: 1 }
                    }
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Space-Time Continuum */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0"
        animate={{
          background: [
            "linear-gradient(to right, rgba(168,85,247,0), rgba(168,85,247,0.7), rgba(168,85,247,0))",
            "linear-gradient(to right, rgba(139,92,246,0), rgba(139,92,246,0.7), rgba(139,92,246,0))",
            "linear-gradient(to right, rgba(168,85,247,0), rgba(168,85,247,0.7), rgba(168,85,247,0))",
          ]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </div>
  );
};

export default TabNavigation;