import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import CustomButton from "./CustomButton";

// Initialize Dexie DB
const db = new Dexie("life_rpg");
db.version(1).stores({
  journal: "++id, text, timestamp",
});

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const journalEntries = await db.journal.toArray();
        setEntries(journalEntries.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error("Error loading journal entries:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, []);

  const addEntry = async () => {
    if (!newEntry.trim()) return;

    try {
      const id = await db.journal.add({
        text: newEntry,
        timestamp: new Date().toISOString(),
      });
      setEntries([{ id, text: newEntry, timestamp: new Date().toISOString() }, ...entries]);
      setNewEntry("");
    } catch (error) {
      console.error("Error adding journal entry:", error);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await db.journal.delete(id);
      setEntries(entries.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="backdrop-blur-xl bg-gradient-to-b from-gray-900/50 to-gray-800/50 border border-white/10 rounded-xl p-6 shadow-2xl animate-fade-in">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-bold text-lg">
            Loading your journal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 rounded-2xl p-6 shadow-2xl border border-white/10 animate-fade-in">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6 drop-shadow-glow">
        Personal Journal
      </h2>
      
      <div className="mb-6">
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
          rows="4"
        />
        <div className="mt-4 flex justify-end gap-3">
          <CustomButton 
            variant="primary" 
            onClick={addEntry} 
            disabled={!newEntry.trim()}
            className="px-8 py-3 text-lg"
          >
            Save Entry
          </CustomButton>
          <CustomButton 
            variant="secondary" 
            onClick={() => setNewEntry("")}
            className="px-8 py-3 text-lg"
          >
            Clear
          </CustomButton>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg animate-pulse">
              Your journal is waiting for your first entry...
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-5 border border-white/10 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            >
              <p className="text-gray-200 text-lg mb-3">{entry.text}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <CustomButton
                  variant="danger"
                  onClick={() => deleteEntry(entry.id)}
                  className="px-4 py-2 text-sm"
                >
                  Delete
                </CustomButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;