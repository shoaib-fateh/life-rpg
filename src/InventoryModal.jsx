import React, { useState } from "react";
import { motion } from "framer-motion";

const InventoryModal = ({ show, onClose, inventory, applyItem, convertCoinsToRealMoney, coins, realMoney }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [convertAmount, setConvertAmount] = useState(100);

  if (!show) return null;

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
        <h2 className="text-2xl font-bold mb-4 text-purple-400 drop-shadow-glow">🎒 Inventory</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Object.values(inventory).map((item) => (
            <motion.div
              key={item.id}
              className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-2">{item.icon}</span>
                <div>
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">x{item.count}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mb-4">
          <p className="text-yellow-300">Real Money: ${realMoney}</p>
          <div className="flex items-center mt-2">
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(Math.max(100, parseInt(e.target.value) || 0))}
              className="bg-gray-800 text-white p-2 rounded-l w-24"
              min="100"
            />
            <button
              onClick={() => convertCoinsToRealMoney(convertAmount)}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-r transition"
            >
              Convert Coins
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">100 coins = 1 real money</p>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded w-full hover:bg-gray-500 transition"
        >
          Close
        </button>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm border border-purple-500/30"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{selectedItem.name}</h3>
                <button onClick={() => setSelectedItem(null)} className="text-2xl text-gray-400">
                  &times;
                </button>
              </div>
              <div className="flex items-center mb-4">
                <motion.span
                  className="text-4xl mr-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {selectedItem.icon}
                </motion.span>
                <div>
                  <p className="text-gray-300 mb-2">{selectedItem.description}</p>
                  <p className="text-yellow-400">Count: {selectedItem.count}</p>
                  {selectedItem.quality && (
                    <p className="text-green-400">Quality: {(selectedItem.quality * 100).toFixed(1)}%</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    applyItem(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="bg-green-600 hover:bg-green-500 py-2 rounded transition"
                  disabled={selectedItem.count <= 0}
                >
                  Use
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="bg-gray-600 hover:bg-gray-500 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InventoryModal;