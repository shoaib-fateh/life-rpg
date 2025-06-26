import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import useSound from "use-sound";

const AchievementsPanel = ({ achievements }) => {
  const particlesInit = async (main) => await loadFull(main);
  const [unlocked, setUnlocked] = useState([]);
  const { play: playUnlock } = useSound("/sounds/achievement-unlock.mp3");
  // const { play: playHover } = useSound('/sounds/glow-hover.mp3');

  // Detect new achievements
  useEffect(() => {
    const newUnlocks = achievements.filter((a) => !unlocked.includes(a.id));
    if (newUnlocks.length) {
      // playUnlock();
      setUnlocked((prev) => [...prev, ...newUnlocks.map((a) => a.id)]);
    }
  }, [achievements]);

  return (
    <motion.div
      className="relative overflow-hidden backdrop-blur-xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/80 via-indigo-900/40 to-gray-800/80 rounded-2xl p-6 shadow-[0_0_60px_-15px_rgba(192,132,252,0.3)] border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          "0 0 60px -15px rgba(192,132,252,0.3)",
          "0 0 80px -10px rgba(236,72,153,0.5)",
          "0 0 60px -15px rgba(192,132,252,0.3)",
        ],
      }}
      transition={{
        duration: 0.5,
        boxShadow: { duration: 8, repeat: Infinity },
      }}
    >
      {/* Quantum Particle Field */}
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

      {/* Holographic Title */}
      <motion.h2
        className="text-4xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(90deg,#a855f7,#8b5cf6,#6366f1)] tracking-tighter mb-6"
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
          textShadow: { duration: 3, repeat: Infinity },
        }}
      >
        Achievements
      </motion.h2>

      {achievements.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center relative">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="mb-4"
          >
            <div className="w-24 h-24 border-t-4 border-b-4 border-purple-500 rounded-full"></div>
          </motion.div>
          <motion.p
            className="text-gray-400 text-center text-lg max-w-md"
            animate={{
              opacity: [0.5, 1, 0.5],
              textShadow: [
                "0 0 5px rgba(192,132,252,0)",
                "0 0 15px rgba(192,132,252,0.3)",
                "0 0 5px rgba(192,132,252,0)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              textShadow: { duration: 3, repeat: Infinity },
            }}
          >
            Complete quests to unlock quantum achievements!
          </motion.p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 !user-select-none !cursor-default select-none">
          {/* <AnimatePresence> */}
          {achievements.map((achievement) => {
            const isNew = unlocked.includes(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                className={`relative p-5 rounded-2xl backdrop-blur-lg border overflow-hidden ${
                  achievement.type === "positive"
                    ? "bg-gradient-to-br from-indigo-900/30 to-pink-900/30 border-purple-500/30"
                    : "bg-gradient-to-br from-rose-900/30 to-amber-900/30 border-rose-500/30"
                }`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  // boxShadow: isNew
                  //   ? ["0 0 30px rgba(192,132,252,0.5)", "0 0 50px rgba(236,72,153,0.8)", "0 0 30px rgba(192,132,252,0.5)"]
                  //   : "0 0 15px rgba(0,0,0,0.1)"
                }}
                transition={{
                  duration: 0.5,
                  boxShadow: isNew ? { duration: 3, repeat: Infinity } : 0.3,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
                // onHoverStart={playHover}
              >
                {/* Holographic Emission */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 30%, rgba(192,132,252,0.1), transparent 70%)",
                      "radial-gradient(circle at 80% 70%, rgba(236,72,153,0.15), transparent 70%)",
                      "radial-gradient(circle at 20% 30%, rgba(192,132,252,0.1), transparent 70%)",
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />

                {/* Quantum Ripple */}
                {isNew && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(192,132,252,0.3),transparent_70%)] opacity-0"
                    animate={{
                      opacity: [0, 0.5, 0],
                      scale: [1, 1.5, 2],
                    }}
                    transition={{
                      duration: 3,
                      times: [0, 0.5, 1],
                    }}
                  />
                )}

                <div className="flex items-start gap-4 z-10 relative">
                  <motion.div
                    className="text-4xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 15, 0, -15, 0],
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      y: { duration: 2, repeat: Infinity },
                    }}
                  >
                    {achievement.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-xl mb-1 text-white drop-shadow-glow">
                      {achievement.name}
                      {isNew && (
                        <span className="ml-2 px-2 py-1 text-xs bg-purple-500/30 rounded-full animate-pulse">
                          NEW!
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      {achievement.description}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          achievement.type === "positive"
                            ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30"
                            : "bg-gradient-to-r from-rose-600/30 to-amber-600/30"
                        }`}
                      >
                        {achievement.type === "positive"
                          ? "🌟 Bonus"
                          : "⚠️ Challenge"}
                      </span>
                      <span className="text-xs px-3 py-1 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-full">
                        +{achievement.xp} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Particle Trail */}
                {achievement.type === "positive" && (
                  <Particles
                    init={particlesInit}
                    className="absolute inset-0 pointer-events-none opacity-30"
                    options={{
                      particles: {
                        number: { value: 15 },
                        color: { value: "#f0abfc" },
                        size: { value: 2, random: true },
                        move: {
                          speed: 0.5,
                          direction: "outside",
                          out_mode: "destroy",
                        },
                        opacity: { value: 0.7, random: true },
                      },
                    }}
                  />
                )}
              </motion.div>
            );
          })}
          {/* </AnimatePresence> */}
        </div>
      )}

      {/* Quantum Entanglement Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full filter blur-[120px] -z-10"></div>
    </motion.div>
  );
};

export default AchievementsPanel;
