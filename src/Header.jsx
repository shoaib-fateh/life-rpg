import React, { useEffect, useRef } from "react";
import CustomButton from "./CustomButton";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { motion, useTransform, useViewportScroll } from "framer-motion";
import confetti from "canvas-confetti";

gsap.registerPlugin(MotionPathPlugin);

const Header = ({
  level,
  coins,
  hp,
  maxHp,
  mana,
  maxMana,
  xp,
  maxXP,
  setShowInventoryModal,
  setShowShopModal,
  badges,
}) => {
  const headerRef = useRef();
  const coinsRef = useRef();
  const xpBarRef = useRef();
  const { scrollY } = useViewportScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  useEffect(() => {
    gsap.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });

    gsap.to(coinsRef.current, {
      y: -5,
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: "sine.inOut",
    });

    gsap.to(xpBarRef.current, {
      boxShadow: "0 0 20px #10b981",
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: "power1.inOut",
    });
  }, []);

  useEffect(() => {
    if (level > 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
      });
    }
  }, [level]);

  const getAnimatedGradient = (value, max, colors) => {
    const percentage = Math.min(100, (value / max) * 100);
    return `linear-gradient(90deg, 
      ${colors[0]} 0%, 
      ${colors[1]} ${percentage - 10}%, 
      ${colors[2]} ${percentage}%, 
      rgba(255,255,255,0.1) ${percentage + 5}%, 
      rgba(255,255,255,0.1) 100%)`;
  };

  return (
    <motion.header
      ref={headerRef}
      className="mt-2 relative overflow-hidden backdrop-blur-xl bg-gradient-to-b from-gray-900/90 to-gray-800/90 rounded-3xl p-6 mb-8 shadow-2xl border-2 border-white/10 will-change-transform"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/20 rounded-full filter blur-3xl"
          style={{ y: y1, willChange: "transform" }}
        />
        <motion.div
          className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full filter blur-3xl"
          style={{ y: y2, willChange: "transform" }}
        />
      </div>

      <div className="relative z-10 flex flex-col space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <motion.div
              className="flex items-center space-x-3 mb-2"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.h1
                className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 drop-shadow-glow tracking-tight uppercase"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  textShadow: [
                    "0 0 10px rgba(192, 132, 252, 0.5)",
                    "0 0 20px rgba(192, 132, 252, 0.8)",
                    "0 0 10px rgba(192, 132, 252, 0.5)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ willChange: "background-position, text-shadow" }}
              >
                j-kuu
              </motion.h1>
              <motion.span
                className="text-xs px-2 py-1 bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-full text-white font-bold border border-white/10 shadow-glow"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Lv. {level}
              </motion.span>
            </motion.div>
            <div className="flex space-x-2 h-8">
              {badges.map((badgeObj, index) => (
                <motion.div
                  key={badgeObj.id}
                  className="relative"
                  style={{ transform: `translateY(${index % 2 === 0 ? -3 : 3}px)` }}
                  whileHover={{
                    scale: 1.1,
                    y: -5,
                    transition: { type: "spring", stiffness: 400 },
                  }}
                >
                  <span className="text-xs bg-gradient-to-br from-purple-600/90 to-blue-600/90 px-3 py-1 rounded-full border border-white/10 shadow-glow flex items-center">
                    <motion.span
                      className="mr-1"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      {badgeObj.emoji}
                    </motion.span>
                    {badgeObj.badge}
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white opacity-0"
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            ref={coinsRef}
            className="flex items-center space-x-2 bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 px-4 py-2 rounded-full border border-yellow-500/30 shadow-glow"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 15, 0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🪙
            </motion.span>
            <motion.span
              className="text-xl font-bold text-yellow-300"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {coins}
            </motion.span>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              type: "hp",
              value: hp,
              max: maxHp,
              icon: "❤️",
              colors: ["#ef4444", "#f87171", "#fca5a5"],
            },
            {
              type: "mana",
              value: mana,
              max: maxMana,
              icon: "🔮",
              colors: ["#8b5cf6", "#a78bfa", "#c4b5fd"],
            },
            {
              type: "xp",
              value: xp,
              max: maxXP,
              icon: "✨",
              colors: ["#10b981", "#34d399", "#6ee7b7"],
            },
          ].map((bar, i) => (
            <motion.div
              key={bar.type}
              className="space-y-2 group"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            >
              <div className="flex justify-between items-center">
                <motion.span
                  className={`text-sm font-bold flex items-center ${
                    bar.type === "hp"
                      ? "text-red-400"
                      : bar.type === "mana"
                      ? "text-purple-400"
                      : "text-green-400"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="mr-2">{bar.icon}</span>
                  {bar.type === "hp"
                    ? "HEALTH"
                    : bar.type === "mana"
                    ? "MANA"
                    : "EXPERIENCE"}
                </motion.span>
                <span className="text-xs font-mono text-gray-300 bg-gray-800/50 px-2 py-1 rounded">
                  {Math.floor(bar.value)}/{Math.floor(bar.max)}
                </span>
              </div>
              <div
                className="h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-md relative"
                ref={bar.type === "xp" ? xpBarRef : null}
              >
                <motion.div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    background: getAnimatedGradient(bar.value, bar.max, bar.colors),
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(100, (bar.value / bar.max) * 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-end space-x-4 pt-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CustomButton
              variant="primary"
              onClick={() => setShowInventoryModal(true)}
              className="px-8 py-3 text-lg group"
            >
              <motion.span
                className="flex items-center transform group-hover:-translate-y-0.5 transition-transform"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="mr-3 text-xl">🎒</span>
                <span>Inventory</span>
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </motion.span>
            </CustomButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CustomButton
              variant={level >= 4 ? "secondary" : "danger"}
              onClick={() => level >= 4 && setShowShopModal(true)}
              disabled={level < 4}
              className="px-8 py-3 text-lg group relative overflow-hidden"
            >
              <motion.span
                className="flex items-center transform group-hover:-translate-y-0.5 transition-transform relative z-10"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="mr-3 text-xl">🛒</span>
                {level >= 4 ? (
                  <>
                    <span>Arcane Shop</span>
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      ↗
                    </span>
                  </>
                ) : (
                  <span>Unlocks at Lvl 4</span>
                )}
              </motion.span>
              {level < 4 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </CustomButton>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full filter blur-3xl -z-10"></div>
    </motion.header>
  );
};

export default Header;