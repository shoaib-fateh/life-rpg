import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const QuestModal = ({ show, onClose, onConfirm, editingQuest = null }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: "easy",
    type: "daily",
    is_24_hour: false,
    deadline: "",
    required_level: 1,
    coins: 0,
    xp: 0,
  });
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const particlesInit = async (main) => await loadFull(main);

  useEffect(() => {
    if (editingQuest) {
      setForm({
        name: editingQuest.name || "",
        description: editingQuest.description || "",
        difficulty: editingQuest.difficulty || "easy",
        type: editingQuest.type || "daily",
        is_24_hour: !!editingQuest.is_24_hour,
        deadline: editingQuest.deadline ? new Date(editingQuest.deadline) : "",
        required_level: editingQuest.required_level || 1,
        coins: editingQuest.coins || 0,
        xp: editingQuest.xp || 0,
      });
    } else {
      setForm({
        name: "",
        description: "",
        difficulty: "easy",
        type: "daily",
        is_24_hour: false,
        deadline: "",
        required_level: 1,
        coins: 0,
        xp: 0,
      });
    }
    setError(null);
    setRetryCount(0);
  }, [editingQuest, show]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Quest name is required");
      return;
    }

    setError(null);

    const questToSend = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      required_level: Number(form.required_level) || 1,
      coins: Number(form.coins) || 0,
      xp: Number(form.xp) || 0,
      deadline: form.deadline ? form.deadline.toISOString() : null,
      repeatable: form.is_24_hour,
    };

    const attemptAddQuest = (attempt = 0) => {
      onConfirm(questToSend)
        .then(() => {
          onClose();
          setRetryCount(0);
          setError(null);
        })
        .catch((err) => {
          if (err?.code === "resource-exhausted" && attempt < 3) {
            setError("Resource limit! Retrying...");
            setRetryCount(attempt + 1);
            setTimeout(
              () => attemptAddQuest(attempt + 1),
              Math.pow(2, attempt) * 1000
            );
          } else {
            setError("Error adding quest. Please try again later.");
          }
        });
    };

    attemptAddQuest(retryCount);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-xl py-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative overflow-y-auto max-h-[90vh] backdrop-blur-2xl bg-gradient-to-br from-gray-900/90 via-indigo-900/50 to-gray-800/90 rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-[0_0_80px_-20px_rgba(139,92,246,0.5)] mx-4 custom-scrollbar"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Particles
            init={particlesInit}
            className="absolute inset-0 pointer-events-none opacity-20"
            options={{
              particles: {
                number: { value: 40 },
                color: { value: ["#a855f7", "#8b5cf6", "#6366f1"] },
                size: { value: 2, random: true },
                move: {
                  speed: 0.3,
                  direction: "none",
                  random: true,
                  straight: false,
                  out_mode: "out",
                },
                opacity: { value: 0.5, random: true },
                links: { enable: false },
              },
            }}
          />

          <motion.h2
            className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              textShadow: [
                "0 0 10px rgba(168,85,247,0.5)",
                "0 0 20px rgba(139,92,246,0.8)",
                "0 0 10px rgba(168,85,247,0.5)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {editingQuest ? "Edit Quest" : "Create New Quest"}
          </motion.h2>

          {error && (
            <motion.div
              className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-xl border border-red-500/30 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">
                Quest Name
              </label>
              <motion.input
                name="name"
                type="text"
                placeholder="Enter quest name"
                value={form.name}
                onChange={onChange}
                className="w-full bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(139,92,246,0.5)",
                }}
                autoComplete={false}
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">
                Description
              </label>
              <motion.textarea
                name="description"
                placeholder="Enter quest description"
                value={form.description}
                onChange={onChange}
                className="w-full h-24 bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                whileFocus={{
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(139,92,246,0.5)",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-300 text-sm font-medium">
                  Difficulty
                </label>
                <motion.select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={onChange}
                  // className="w-full bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  className="w-full 
                  bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </motion.select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 text-sm font-medium">
                  Type
                </label>
                <motion.select
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  className="w-full bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="daily">Daily</option>
                  <option value="main">Main</option>
                  <option value="subquest">Subquest</option>
                </motion.select>
              </div>
            </div>

            {form.type === "daily" && !form.is_24_hour && (
              <div className="space-y-1">
                <label className="text-gray-300 text-sm font-medium">
                  Deadline
                </label>
                <DatePicker
                  selected={form.deadline}
                  onChange={(date) => setForm({ ...form, deadline: date })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  wrapperClassName="w-full"
                  popperClassName="bg-gray-900 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl"
                />
              </div>
            )}

            <motion.div
              className="flex items-center p-3 bg-gray-800/40 border border-white/10 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <input
                name="is_24_hour"
                type="checkbox"
                checked={form.is_24_hour}
                onChange={onChange}
                className="h-5 w-5 accent-purple-500"
                id="is_24_hour"
              />
              <label
                htmlFor="is_24_hour"
                className="text-white ml-3 select-none cursor-pointer"
              >
                24-hour Quest
              </label>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-gray-300 text-sm font-medium">
                  Min Level
                </label>
                <motion.input
                  name="required_level"
                  type="number"
                  min={1}
                  value={form.required_level}
                  onChange={onChange}
                  className="w-full bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 text-sm font-medium">
                  Coins
                </label>
                <motion.input
                  name="coins"
                  type="number"
                  min={0}
                  value={form.coins}
                  onChange={onChange}
                  className="w-full bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 text-sm font-medium">XP</label>
                <motion.input
                  name="xp"
                  type="number"
                  min={0}
                  value={form.xp}
                  onChange={onChange}
                  className="w-full bg-gray-800/40 border border-white/10 rounded-xl p-3 text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <motion.button
                type="button"
                onClick={() => {
                  setError(null);
                  onClose();
                }}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-br from-gray-700/80 to-gray-800/80 border border-white/10 backdrop-blur-lg"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(255,255,255,0.2)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-br from-purple-600/80 to-blue-600/80 border border-white/10 backdrop-blur-lg shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                whileHover={{
                  scale: 1.05,
                  background: [
                    "linear-gradient(to bottom right, #8b5cf6, #6366f1)",
                    "linear-gradient(to bottom right, #6366f1, #3b82f6)",
                    "linear-gradient(to bottom right, #8b5cf6, #6366f1)",
                  ],
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ background: { duration: 3, repeat: Infinity } }}
              >
                {editingQuest ? "Update Quest" : "Create Quest"}
              </motion.button>
            </div>
          </form>

          <motion.div
            className="absolute top-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-[100px] -z-10"
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full filter blur-[100px] -z-10"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestModal;
