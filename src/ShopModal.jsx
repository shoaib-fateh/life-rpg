import React from "react";
import { motion } from "framer-motion";

const ShopModal = ({ show, onClose, items, coins, realMoney, onBuy, userLevel, achievements }) => {
  if (!show) return null;

  const canBuyItem = (item) => {
    return (
      (item.requirements.level ? userLevel >= item.requirements.level : true) &&
      (item.requirements.achievement ? achievements.includes(item.requirements.achievement) : true) &&
      (item.costType === "coins" ? coins >= item.cost : realMoney >= item.cost)
    );
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="backdrop-blur-md bg-gradient-to-b from-gray-900/90 to-gray-800/90 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-purple-400 drop-shadow-glow">🛒 Arcane Shop</h2>
        <div className="space-y-4">
          {items.map((item) => {
            const canBuy = canBuyItem(item);
            return (
              <motion.div
                key={item.id}
                className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center"
                whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                    <div className="text-yellow-400 text-sm mt-1">
                      Cost: {item.cost} {item.costType === "coins" ? "🪙" : "$"}
                    </div>
                    {item.requirements.level && (
                      <div className={`text-xs mt-1 ${userLevel >= item.requirements.level ? "text-green-400" : "text-red-400"}`}>
                        Requires Level {item.requirements.level}
                      </div>
                    )}
                    {item.requirements.achievement && (
                      <div className={`text-xs mt-1 ${achievements.includes(item.requirements.achievement) ? "text-green-400" : "text-red-400"}`}>
                        Requires Achievement: {item.requirements.achievement}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => canBuy && onBuy(item.id)}
                  className={`px-4 py-2 rounded transition ${
                    canBuy ? "bg-yellow-600 hover:bg-yellow-500" : "bg-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!canBuy}
                >
                  Buy
                </button>
              </motion.div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded w-full mt-4 hover:bg-gray-500 transition"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ShopModal;