import React, { useState, useEffect } from "react";
import Dexie from "dexie";

const db = new Dexie("life_rpg");
db.version(1).stores({
  journal: "++id, text, timestamp",
});

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");

  useEffect(() => {
    db.journal.toArray().then(setEntries);
  }, []);

  const addEntry = async () => {
    if (!newEntry.trim()) return;
    const entry = { text: newEntry, timestamp: new Date().toISOString() };
    await db.journal.add(entry);
    setEntries([...entries, entry]);
    setNewEntry("");
  };

  return (
    <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 shadow-lg mb-6">
      <h2 className="text-xl font-bold text-purple-400 mb-4">Journal</h2>
      <textarea
        className="w-full p-2 bg-gray-700 rounded mb-4 text-white"
        value={newEntry}
        onChange={(e) => setNewEntry(e.target.value)}
        placeholder="Write your notes, mottos, or anything here..."
      />
      <button
        onClick={addEntry}
        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500 transition"
      >
        Save Entry
      </button>
      <div className="mt-4 max-h-64 overflow-y-auto custom-scrollbar">
        {entries.map((entry) => (
          <div key={entry.id} className="p-2 bg-gray-800 rounded mb-2">
            <p className="text-gray-200">{entry.text}</p>
            <p className="text-xs text-gray-500">
              {new Date(entry.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;