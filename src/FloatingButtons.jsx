import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
// import useSound from 'use-sound'; // Uncomment if using sound

const FloatingButtons = ({ setActiveButton, activeButton }) => {
  const particlesInit = async (main) => await loadFull(main);
  const [hoveredButton, setHoveredButton] = useState(null);
  const buttons = [
    { name: 'home', emoji: '🏠', color: '#8b5cf6' },
    { name: 'workout', emoji: '💪', color: '#ef4444' },
    { name: 'nutrition', emoji: '🍎', color: '#10b981' },
  ];

  // Sound effects (uncomment if using)
  // const [playClick] = useSound('/sounds/quantum-switch.mp3');
  // const [playHover] = useSound('/sounds/energy-pulse.mp3');

  return (
    <div className="absolute right-[-4rem] sm:right-[-1rem] top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-6">
      {buttons.map((button) => {
        const isActive = activeButton === button.name;
        const isHovered = hoveredButton === button.name;
        
        return (
          <motion.div
            key={button.name}
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            {/* Quantum Flux Particles */}
            <AnimatePresence>
              {isActive && (
                <Particles
                  init={particlesInit}
                  className="absolute inset-0 pointer-events-none opacity-60"
                  options={{
                    particles: {
                      number: { value: 15 },
                      color: { value: button.color },
                      size: { value: 3, random: true },
                      move: {
                        speed: 0.4,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        attract: { enable: true, rotateX: 600, rotateY: 1200 }
                      },
                      opacity: { value: 0.7, random: true },
                      line_linked: {
                        enable: true,
                        distance: 100,
                        color: `${button.color}80`,
                        opacity: 0.4,
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
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => {
                // playClick();
                setActiveButton(button.name);
              }}
              onHoverStart={() => {
                // playHover();
                setHoveredButton(button.name);
              }}
              onHoverEnd={() => setHoveredButton(null)}
              className={`relative w-14 h-14 rounded-full z-10 flex items-center justify-center text-2xl backdrop-blur-xl border border-white/10 ${
                isActive ? "text-white" : "text-gray-300"
              }`}
              style={{
                background: isActive 
                  ? `radial-gradient(circle at center, ${button.color}40, transparent 70%), rgba(30, 30, 40, 0.7)` 
                  : 'rgba(20, 20, 30, 0.6)',
                boxShadow: isActive 
                  ? `0 0 20px ${button.color}80, inset 0 0 10px rgba(255, 255, 255, 0.1)` 
                  : '0 0 15px rgba(0, 0, 0, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.05)'
              }}
              whileHover={{ 
                scale: 1.1,
                boxShadow: `0 0 25px ${button.color}`
              }}
              whileTap={{ scale: 0.9 }}
              animate={{
                boxShadow: isActive ? [
                  `0 0 15px ${button.color}80`,
                  `0 0 25px ${button.color}`,
                  `0 0 15px ${button.color}80`,
                ] : undefined
              }}
              transition={isActive ? { 
                boxShadow: { duration: 3, repeat: Infinity } 
              } : { duration: 0.2 }}
            >
              {/* Active Quantum Core */}
              {isActive && (
                <>
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${button.color}80, transparent 70%)`,
                    }}
                    animate={{ 
                      opacity: [0.4, 0.7, 0.4],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  <motion.div 
                    className="absolute -inset-1 rounded-full blur-md"
                    style={{ background: button.color }}
                    animate={{ 
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                </>
              )}

              {/* Hover Effect */}
              {isHovered && !isActive && (
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  style={{ background: `${button.color}20` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              <motion.span
                className="relative z-10"
                animate={isActive ? {
                  rotate: [0, 10, -5, 0],
                  scale: [1, 1.2, 1],
                  y: [0, -3, 0]
                } : {}}
                transition={isActive ? { 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                {button.emoji}
              </motion.span>

              {/* Quantum Burst */}
              {isActive && (
                <Particles
                  init={particlesInit}
                  className="absolute inset-0 pointer-events-none"
                  options={{
                    particles: {
                      number: { value: 10 },
                      color: { value: button.color },
                      size: { value: 2, random: true },
                      move: { 
                        speed: 1.5,
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

            {/* Label */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap border border-white/10 backdrop-blur-sm"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {button.name}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      
      {/* Space-Time Continuum */}
      <motion.div 
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gradient-to-t from-purple-500/0 via-purple-500/50 to-purple-500/0"
        animate={{
          background: [
            "linear-gradient(to top, rgba(168,85,247,0), rgba(168,85,247,0.7), rgba(168,85,247,0))",
            "linear-gradient(to top, rgba(139,92,246,0), rgba(139,92,246,0.7), rgba(139,92,246,0))",
            "linear-gradient(to top, rgba(168,85,247,0), rgba(168,85,247,0.7), rgba(168,85,247,0))",
          ]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </div>
  );
};

export default FloatingButtons;