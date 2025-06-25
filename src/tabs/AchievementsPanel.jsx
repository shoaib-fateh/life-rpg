import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const AchievementsPanel = ({ achievements }) => {
  const particlesInit = async (main) => await loadFull(main);
  
  return (
    <motion.div 
      className="backdrop-blur-xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 rounded-2xl p-6 shadow-2xl border border-white/10 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 w-32 h-32 bg-green-600/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-600/10 rounded-full filter blur-3xl -z-10"></div>
      
      <motion.h2 
        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400 tracking-wider uppercase text-glow mb-6"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          textShadow: [
            "0 0 10px rgba(255,230,0,0.5)",
            "0 0 20px rgba(255,230,0,0.8)",
            "0 0 10px rgba(255,230,0,0.5)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        Achievements
      </motion.h2>

      {achievements.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center relative">
          <Particles
            id="achievements-particles"
            init={particlesInit}
            className="absolute inset-0 pointer-events-none"
            options={{
              particles: {
                number: { value: 15 },
                color: { value: "#facc15" },
                size: { value: 3, random: true },
                move: { speed: 0.3 },
                opacity: { value: 0.7, random: true },
              }
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <div className="w-16 h-16 border-t-4 border-yellow-400 rounded-full"></div>
          </motion.div>
          <motion.p
            className="text-gray-400 text-center text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Complete quests to earn achievements!
          </motion.p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`p-5 rounded-xl backdrop-blur-md border relative overflow-hidden ${
                  achievement.type === "positive"
                    ? "bg-gradient-to-br from-green-900/20 to-yellow-900/20 border-green-500/50 shadow-glow"
                    : "bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/50"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="text-3xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 15, 0, -15, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {achievement.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                    <p className="text-gray-300 text-sm">{achievement.description}</p>
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs px-2 py-1 bg-black/30 rounded-full">
                        {achievement.type === "positive" ? "🌟 Bonus" : "⚠️ Challenge"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-black/30 rounded-full">
                        +{achievement.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
                
                {achievement.type === "positive" && (
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent opacity-30 pointer-events-none"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity }}
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

export default AchievementsPanel;