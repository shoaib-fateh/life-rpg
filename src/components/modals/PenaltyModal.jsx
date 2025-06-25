import React from "react";

const PenaltyModal = ({ currentPenalty, onClose, completeTask, updateApology }) => {
  if (!currentPenalty) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-gray-800 bg-opacity-50 rounded-lg p-6 max-w-md w-full backdrop-blur-xl border border-white/10">
        <h2 className="text-2xl font-bold text-red-400 mb-4 drop-shadow-glow">Penalty Details</h2>
        <p className="text-gray-300 mb-4">You have been penalized...</p>
        <p className="text-gray-300 mb-4">
          Penalties applied:
          <ul className="list-disc ml-5">
            <li>HP and Mana reduced by 80%</li>
            <li>20% of coins deducted</li>
            <li>XP gain reduced by 20%</li>
            <li>Store prices increased</li>
          </ul>
        </p>
        <p className="text-gray-300 mb-4">
          Penalty ends on: {new Date(currentPenalty.end_time).toLocaleString()}
        </p>
        <ul className="list-disc ml-5">
          {currentPenalty.tasks.map((task, i) => (
            <li key={i}>
              {task.name} - {task.completed ? "Completed" : "Pending"}
              {!task.completed && (
                <button onClick={() => completeTask(currentPenalty.id, i)} className="ml-2 text-sm bg-green-500 px-2 py-1 rounded">Complete</button>
              )}
            </li>
          ))}
        </ul>
        <div className="mb-4 mt-4">
          <label className="block text-gray-300 mb-2">Apology/Reason:</label>
          <textarea className="w-full p-2 bg-gray-700 rounded"
            value={currentPenalty.apology || ""}
            onChange={(e) => updateApology(currentPenalty.id, e.target.value)}
          />
        </div>
        <button onClick={onClose} className="bg-red-500 px-4 py-2 rounded hover:bg-red-400 transition">Close</button>
      </div>
    </div>
  );
};

export default PenaltyModal;
