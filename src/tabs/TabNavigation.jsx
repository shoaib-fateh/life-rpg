import React from 'react';
import { motion } from 'framer-motion';

const TabNavigation = ({ tabNames, activeTab, setActiveTab }) => (
  <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/10">
    {Object.entries(tabNames).map(([key, name]) => (
      <motion.button
        key={key}
        onClick={() => setActiveTab(key)}
        className={`relative px-5 py-2.5 text-sm font-medium rounded-xl z-10 transition-all ${
          activeTab === key 
            ? "text-white" 
            : "text-gray-400 hover:text-gray-200"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {activeTab === key && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-600/70 to-purple-600/70 rounded-xl border border-cyan-400/30 shadow-glow"
            layoutId="activeTab"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {name}
          {activeTab === key && (
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              {key === 'notifications' ? '🔔' : '🏆'}
            </motion.span>
          )}
        </span>
      </motion.button>
    ))}
  </div>
);

export default TabNavigation;