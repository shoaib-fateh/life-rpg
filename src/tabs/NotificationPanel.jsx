import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const NotificationPanel = ({
  notifications,
  unreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
}) => {
  const particlesInit = async (main) => await loadFull(main);
  
  return (
    <motion.div 
      className="backdrop-blur-xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 rounded-2xl p-6 shadow-2xl border border-white/10 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-600/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full filter blur-3xl -z-10"></div>
      
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider uppercase text-glow"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            textShadow: [
              "0 0 10px rgba(0,240,255,0.5)",
              "0 0 20px rgba(0,240,255,0.8)",
              "0 0 10px rgba(0,240,255,0.5)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Notifications
        </motion.h2>
        
        {unreadNotifications > 0 && (
          <motion.button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-full text-white font-bold border border-white/10 shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mark All Read
          </motion.button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center relative">
          <Particles
            id="notifications-particles"
            init={particlesInit}
            className="absolute inset-0 pointer-events-none"
            options={{
              particles: {
                number: { value: 10 },
                color: { value: "#8b5cf6" },
                size: { value: 2, random: true },
                move: { speed: 0.5 },
                links: { enable: false },
                opacity: { value: 0.5, random: true },
              }
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <div className="w-16 h-16 border-t-4 border-purple-400 rounded-full"></div>
          </motion.div>
          <motion.p
            className="text-gray-400 text-center text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            No notifications yet
          </motion.p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {[...notifications].reverse().map((notification) => (
              <motion.div
                key={notification.id}
                className={`p-4 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                  notification.read
                    ? "bg-gray-800/30 border-gray-700/50"
                    : "bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/50 shadow-glow"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <motion.span 
                      className="text-2xl mt-1"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, 0, -10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {notification.type === "level" && "🌟"}
                      {notification.type === "achievement" && "🏆"}
                      {notification.type === "penalty" && "⚠️"}
                    </motion.span>
                    <div>
                      <p className={notification.read ? "text-gray-300" : "text-white font-medium"}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <motion.button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✓ Mark Read
                    </motion.button>
                  )}
                </div>
                {!notification.read && (
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationPanel;