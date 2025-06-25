import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrail, animated } from '@react-spring/web';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import useSound from 'use-sound'; 

const NotificationPanel = ({
  notifications,
  unreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
}) => {
  const particlesInit = async (main) => await loadFull(main);
  const [pulsingId, setPulsingId] = useState(null);
  const [ripplePos, setRipplePos] = useState(null);
  // const { play: playUnlock } = useSound('/sounds/quantum-unlock.mp3');
  // const { play: playHover } = useSound('/sounds/holographic-hover.mp3');

  // Quantum trail effect for notifications
  const trail = useTrail(notifications.length, {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 200, friction: 30 }
  });

  const handleMarkRead = (id, e) => {
    // playUnlock();
    markNotificationAsRead(id);
    setRipplePos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setRipplePos(null), 1000);
  };

  return (
    <motion.div 
      className="relative overflow-hidden backdrop-blur-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/90 via-violet-900/50 to-gray-800/90 rounded-3xl p-8 shadow-[0_0_80px_-20px_rgba(139,92,246,0.5)] border-2 border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: [
          "0 0 80px -20px rgba(139,92,246,0.5)",
          "0 0 100px -10px rgba(99,102,241,0.7)",
          "0 0 80px -20px rgba(139,92,246,0.5)",
        ]
      }}
      transition={{
        duration: 0.8,
        boxShadow: { duration: 6, repeat: Infinity }
      }}
    >
      {/* Quantum Entanglement Particles */}
      <Particles
        id="quantum-notifications"
        init={particlesInit}
        className="absolute inset-0 pointer-events-none opacity-30"
        options={{
          background: { color: "transparent" },
          particles: {
            number: { value: 60 },
            color: { value: ["#a855f7", "#8b5cf6", "#6366f1"] },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              attract: { 
                enable: true, 
                rotateX: 2000, 
                rotateY: 2000 
              }
            },
            opacity: { value: 0.7, random: true },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#c4b5fd",
              opacity: 0.3,
              width: 1
            },
          },
          interactivity: {
            events: {
              onhover: { 
                enable: true, 
                mode: "bubble",
                parallax: { enable: true, force: 30 }
              }
            }
          }
        }}
      />

      {/* Holographic Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <motion.h2 
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(90deg,#a855f7,#8b5cf6,#6366f1)] tracking-tighter"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            textShadow: [
              "0 0 15px rgba(168,85,247,0.5)",
              "0 0 30px rgba(139,92,246,0.8)",
              "0 0 15px rgba(168,85,247,0.5)",
            ],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            textShadow: { duration: 3, repeat: Infinity }
          }}
        >
          Notifications
        </motion.h2>
        
        {unreadNotifications > 0 && (
          <motion.button
            onClick={() => {
              // playUnlock();
              markAllNotificationsAsRead();
            }}
            className="px-6 py-3 bg-gradient-to-br from-purple-600/90 to-blue-600/90 rounded-xl text-white font-bold border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center gap-3"
            whileHover={{ 
              scale: 1.05,
              background: [
                "linear-gradient(to bottom right, #8b5cf6, #6366f1)",
                "linear-gradient(to bottom right, #6366f1, #3b82f6)",
                "linear-gradient(to bottom right, #8b5cf6, #6366f1)",
              ]
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              background: { duration: 3, repeat: Infinity }
            }}
          >
            <span>Read All</span>
            <motion.span
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {/* ⚛️ */}
            </motion.span>
          </motion.button>
        )}
      </div>

      {/* Quantum Ripple Effect */}
      {ripplePos && (
        <motion.div
          className="absolute rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.8),transparent_70%)] pointer-events-none"
          initial={{ 
            x: ripplePos.x - 100, 
            y: ripplePos.y - 100,
            width: 0,
            height: 0,
            opacity: 1
          }}
          animate={{ 
            width: 400, 
            height: 400,
            opacity: 0
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            pointerEvents: 'none',
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* Notification Singularity */}
      <div className="relative h-[600px] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center relative">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="mb-8"
            >
              <div className="w-32 h-32 border-t-4 border-b-4 border-purple-500 rounded-full"></div>
            </motion.div>
            <motion.p
              className="text-gray-400 text-center text-xl max-w-md"
              animate={{ 
                opacity: [0.6, 1, 0.6],
                textShadow: [
                  "0 0 10px rgba(168,85,247,0)",
                  "0 0 20px rgba(168,85,247,0.5)",
                  "0 0 10px rgba(168,85,247,0)",
                ]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                textShadow: { duration: 3, repeat: Infinity }
              }}
            >
              Quantum field is stable. No anomalies detected.
            </motion.p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar pr-3 space-y-5">
            {trail.map((style, index) => {
              const notification = notifications[index];
              const isUnread = !notification.read;
              
              return (
                <animated.div 
                  key={notification.id}
                  style={style}
                  className="relative"
                >
                  <motion.div
                    className={`p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-500 ${
                      isUnread
                        ? "bg-[linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.3))] border-purple-400/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                        : "bg-gray-800/30 border-gray-700/50"
                    }`}
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      boxShadow: isUnread ? "0 20px 50px rgba(139,92,246,0.5)" : "0 10px 30px rgba(0,0,0,0.3)"
                    }}
                    onHoverStart={() => {
                      if (isUnread) {
                        // playHover();
                        setPulsingId(notification.id);
                      }
                    }}
                    onHoverEnd={() => setPulsingId(null)}
                  >
                    {/* Quantum Pulse */}
                    {isUnread && (
                      <motion.div 
                        className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(168,85,247,0.3),transparent_70%)]"
                        animate={{ 
                          opacity: pulsingId === notification.id ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1],
                          scale: pulsingId === notification.id ? [1, 1.05, 1] : 1
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="text-4xl"
                          animate={{
                            scale: isUnread ? [1, 1.2, 1] : 1,
                            rotate: isUnread ? [0, 15, -15, 0] : 0,
                            y: isUnread ? [0, -5, 0] : 0
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            y: { duration: 2, repeat: Infinity }
                          }}
                        >
                          {notification.type === "level" && "🌌"}
                          {notification.type === "achievement" && "⚡"}
                          {notification.type === "penalty" && "⚠️"}
                        </motion.div>
                        <div>
                          <p className={`text-xl mb-2 ${isUnread ? "text-white font-bold" : "text-gray-300"}`}>
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {isUnread && (
                        <motion.button
                          onClick={(e) => handleMarkRead(notification.id, e)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-sm font-medium flex items-center gap-2"
                          whileHover={{ 
                            scale: 1.1,
                            background: "linear-gradient(to right, #8b5cf6, #6366f1)"
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <span>Read</span>
                          <motion.span
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            {/* 👁️ */}
                          </motion.span>
                        </motion.button>
                      )}
                    </div>

                    {/* Data Stream */}
                    {isUnread && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400/80 to-transparent"
                        animate={{ 
                          x: ["-100%", "100%"],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      />
                    )}
                  </motion.div>
                </animated.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quantum Signature */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0"></div>
      
      {/* Cosmic Background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full filter blur-[120px] -z-10"></div>
    </motion.div>
  );
};

export default NotificationPanel;