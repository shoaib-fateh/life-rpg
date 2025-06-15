import React from 'react';

const InventoryModal = ({ show, onClose, inventory, applyItem }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20" onClick={onClose}>
      <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4 text-purple-400">Inventory</h2>
        <ul className="space-y-3">
          {Object.entries(inventory).map(([id, item]) => (
            <li key={id} className="bg-gray-700 bg-opacity-50 p-3 rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
                <div className="text-yellow-400 font-bold mt-1">{item.count}X •🪙{item.purchasedPrice.toLocaleString()}</div>
              </div>
              <button
                onClick={() => applyItem(id)}
                className={`px-2 py-1 rounded ${item.count > 0 ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-600 cursor-not-allowed'}`}
                disabled={item.count <= 0}
              >
                Use
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded mt-4 hover:bg-gray-500 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InventoryModal;