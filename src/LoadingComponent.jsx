import React from "react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";

const LoadingComponent = () => {
  // Particle configuration
  const particlesOptions = {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 1000 } },
      color: { value: ["#8B5CF6", "#3B82F6", "#D946EF"] },
      shape: { type: ["circle", "star"], stroke: { width: 0 } },
      opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1 } },
      size: { value: 4, random: true },
      move: {
        enable: true,
        speed: 3,
        direction: "none",
        random: true,
        out_mode: "out",
      },
      links: {
        enable: true,
        distance: 120,
        color: "#ffffff",
        opacity: 0.3,
        width: 1,
      },
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: "bubble" },
        onclick: { enable: true, mode: "push" },
      },
      modes: {
        bubble: { distance: 200, size: 6, duration: 2, opacity: 0.8 },
        push: { quantity: 3 },
      },
    },
    retina_detect: true,
  };

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut",
      },
    },
  };

  const orbVariants = {
    animate: {
      scale: [1, 1.15, 1],
      rotate: [0, 15, -15, 0],
      boxShadow: [
        "0 0 60px rgba(139, 92, 246, 0.5)",
        "0 0 80px rgba(59, 130, 246, 0.7)",
        "0 0 60px rgba(139, 92, 246, 0.5)",
      ],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const swirlVariants = {
    animate: {
      rotate: 360,
      opacity: [0.1, 0.2, 0.1],
      transition: {
        rotate: { duration: 12, repeat: Infinity, ease: "linear" },
        opacity: { duration: 3, repeat: Infinity },
      },
    },
  };

  const textVariants = {
    animate: {
      y: [-8, 8, -8],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const iconVariants = {
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-[90vh] relative overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        options={particlesOptions}
        className="absolute inset-0 z-0"
      />

      {/* Magic Swirl */}
      <motion.div
        className="absolute w-[150px] h-[150px] border-[6px] border-purple-500 rounded-full"
        variants={swirlVariants}
        animate="animate"
        style={{
          boxShadow: "0 0 80px rgba(139, 92, 246, 0.5)",
          top: "30%",
          left: "30%",
          position: "absolute",
        }}
      />

      {/* Center Glowing Orb with Icon */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500"
          variants={orbVariants}
          animate="animate"
        >
          <motion.svg
            className="w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            variants={iconVariants}
            animate="animate"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </motion.svg>
        </motion.div>

        <motion.p
          className="mt-8 text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 tracking-wider drop-shadow-glow"
          variants={textVariants}
          animate="animate"
        >
          Summoning the Realm...
        </motion.p>
      </motion.div>

      {/* Aura Blurs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-purple-500/15 blur-3xl top-10 left-10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-blue-500/15 blur-2xl bottom-20 right-20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.2 }}
      />
    </motion.div>
  );
};

export default LoadingComponent;