import React from 'react';

const InventoryModal = ({ show, onClose, inventory, applyItem }) => { 
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-lg w-80" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-2 text-white">Inventory</h2>
        <ul className="space-y-2">
          {Object.entries(inventory).map(([id, item]) => (
            <li key={id} className="flex justify-between items-center text-white">
              <span>{item.name} (تعداد: {item.count}, خرید در: {new Date(item.timestamp).toLocaleString()})</span>
              <button onClick={() => applyItem(id)} className="bg-green-500 px-2 py-1 rounded hover:bg-green-400 transition">Use</button> {/* تغییر useItem به applyItem */}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 bg-red-500 px-4 py-2 rounded hover:bg-red-400 transition text-white">Close</button>
      </div>
    </div>
  );
};

export default InventoryModal;