import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CustomButton from "./CustomButton";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = "https://dycmmpjydiilovfvqxog.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y21tcGp5ZGlpbG92ZnZxeG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzcyMzAsImV4cCI6MjA2NjM1MzIzMH0.SYXqbiZbWCI-CihtGO3jIWO0riYOC_tEiFV2EYw_lmE";
const supabase = createClient(supabaseUrl, supabaseKey);

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const { data: journalEntries, error } = await supabase
          .from("journal")
          .select("*")
          .order("timestamp", { ascending: false });
        if (error) throw error;
        setEntries(journalEntries);
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
      const { data, error } = await supabase
        .from("journal")
        .insert([{ text: newEntry, timestamp: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      setEntries([{ ...data }, ...entries]);
      setNewEntry("");
    } catch (error) {
      console.error("Error adding journal entry:", error);
    }
  };

  const deleteEntry = async (id) => {
    try {
      const { error } = await supabase.from("journal").delete().eq("id", id);
      if (error) throw error;
      setEntries(entries.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-[200px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="backdrop-blur-xl bg-gradient-to-b from-gray-900/50 to-gray-800/50 border border-white/10 rounded-xl p-6 shadow-2xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.p
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-bold text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your journal...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="backdrop-blur-xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 rounded-2xl p-6 shadow-2xl border border-white/10 will-change-transform"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6 drop-shadow-glow"
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
        Personal Journal
      </motion.h2>

      <div className="mb-6">
        <motion.textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm"
          rows="4"
          whileFocus={{
            boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.5)",
            borderColor: "rgba(139, 92, 246, 0.5)",
            scale: 1.01,
          }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <div className="mt-4 flex justify-end gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CustomButton
              variant="primary"
              onClick={addEntry}
              disabled={!newEntry.trim()}
              className="px-8 py-3 text-lg"
            >
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Save Entry
              </motion.span>
            </CustomButton>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CustomButton
              variant="secondary"
              onClick={() => setNewEntry("")}
              className="px-8 py-3 text-lg"
            >
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Clear
              </motion.span>
            </CustomButton>
          </motion.div>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar overflow-hidden">
        <AnimatePresence>
          {entries.length === 0 ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.p
                className="text-gray-400 text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Your journal is waiting for your first entry...
              </motion.p>
              <motion.div
                className="mt-4 flex justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✍️
              </motion.div>
            </motion.div>
          ) : (
            entries.map((entry) => (
              <motion.div
                key={entry.id}
                className="bg-gray-800/50 backdrop-blur-md rounded-xl p-5 border border-white/10 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] will-change-transform"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <p className="text-gray-200 text-lg mb-3">{entry.text}</p>
                <div className="flex justify-between items-center">
                  <motion.span
                    className="text-sm text-gray-400"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {new Date(entry.timestamp).toLocaleString()}
                  </motion.span>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <CustomButton
                      variant="danger"
                      onClick={() => deleteEntry(entry.id)}
                      className="px-4 py-2 text-sm"
                    >
                      Delete
                    </CustomButton>
                  </motion.div>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full filter blur-3xl -z-10"></div>
    </motion.div>
  );
};

export default Journal;