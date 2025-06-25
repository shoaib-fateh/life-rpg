import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import CustomButton from "./CustomButton";
import Modals from "./Modals";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { gsap } from "gsap";
import QuestItem from "./QuestItem";
import CountdownTimer from "./CountdownTimer";

const supabaseUrl = "https://dycmmpjydiilovfvqxog.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y21tcGp5ZGlpbG92ZnZxeG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzcyMzAsImV4cCI6MjA2NjM1MzIzMH0.SYXqbiZbWCI-CihtGO3jIWO0riYOC_tEiFV2EYw_lmE";
const supabase = createClient(supabaseUrl, supabaseKey);

const InfoPopup = ({ message, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!message) return;

    gsap.from(popupRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    });

    const timeout = setTimeout(onClose, 6000);
    return () => clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bottom-5 right-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-5 py-3 rounded-xl shadow-2xl z-50 max-w-xs border-2 border-white/20"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl mr-2">⚠️</span>
          <div>
            <strong className="text-black">Warning: </strong>
            <span className="text-gray-900">{message}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-3 font-bold hover:text-red-700 transition"
          aria-label="Close notification"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

const Quests = ({
  quests,
  setQuests,
  openQuestForm,
  openSubquestForm,
  completeQuest,
  completeSubquest,
  startQuest,
  canStartQuest,
  addNotification,
  userLevel,
}) => {
  const [now, setNow] = useState(new Date());
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [editingQuest, setEditingQuest] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("everyDay");
  const questsContainerRef = useRef(null);

  const timerRefs = useRef({});

  const calculateTimeUntilReset = useCallback(() => {
    const resetTime = new Date();
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);
    return resetTime.getTime() - Date.now();
  }, []);

  const [resetTimeLeft, setResetTimeLeft] = useState(calculateTimeUntilReset());

  useEffect(() => {
    const interval = setInterval(() => {
      setResetTimeLeft(calculateTimeUntilReset());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeUntilReset]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const getDifficultyEmoji = (difficulty) => {
    switch ((difficulty || "").toLowerCase()) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪️";
    }
  };

  const startQuestHandler = async (questId) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.status !== "not_started") return;
    if (!canStartQuest(quest)) return;

    try {
      const questElement = document.querySelector(
        `[data-quest-id="${questId}"]`
      );
      if (questElement) {
        gsap.to(questElement, {
          scale: 0.95,
          backgroundColor: "#4B5563",
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        });
      }

      const { error } = await supabase
        .from("quests")
        .update({ status: "in_progress" })
        .eq("id", questId);
      if (error) throw error;

      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, status: "in_progress" } : q
        )
      );

      addNotification(`🚀 Quest started: "${quest.name}"`, "quest");
    } catch (err) {
      console.error("Failed to start quest:", err);
      addNotification(`❌ Failed to start quest: "${quest.name}"`, "error");
    }
  };

  const completeQuestHandler = async (questId) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    try {
      const questElement = document.querySelector(
        `[data-quest-id="${questId}"]`
      );
      if (questElement) {
        gsap.to(questElement, {
          scale: 1.05,
          backgroundColor: "#10B981",
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            gsap.to(questElement, { opacity: 0, duration: 0.5 });
          },
        });
      }

      await completeQuest(questId);

      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, status: "completed" } : q))
      );
    } catch (err) {
      console.error("Failed to complete quest:", err);
      addNotification(`❌ Failed to complete quest: "${quest.name}"`, "error");
    }
  };

  const applyPenaltyAndResetQuest = useCallback(
    async (questId) => {
      const quest = quests.find((q) => q.id === questId);
      if (!quest) return;

      try {
        const { data: ps, error: psError } = await supabase
          .from("game_state")
          .select("*")
          .eq("id", "playerState")
          .single();
        if (psError) throw psError;

        let { hp, max_hp: maxHp, mana, max_mana: maxMana, coins } = ps;

        hp = Math.max(0, hp - Math.floor(maxHp * 0.85));
        mana = Math.max(0, mana - Math.floor(maxMana * 0.85));
        coins = Math.max(0, coins - Math.floor(coins * 0.15));

        await supabase
          .from("game_state")
          .update({ hp, mana, coins })
          .eq("id", "playerState");

        const newDeadline = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();

        const { error: questError } = await supabase
          .from("quests")
          .update({
            status: "not_started",
            deadline: newDeadline,
            warning_sent_for_current_period: false,
          })
          .eq("id", questId);
        if (questError) throw questError;

        setQuests((prev) =>
          prev.map((q) =>
            q.id === questId
              ? {
                  ...q,
                  status: "not_started",
                  deadline: newDeadline,
                  warning_sent_for_current_period: false,
                }
              : q
          )
        );

        addNotification(
          `💀 Quest "${quest.name}" expired! Penalties applied:\n- 85% HP/Mana loss\n- 15% Coins lost`,
          "penalty"
        );
      } catch (err) {
        console.error("Error applying penalty:", err);
      }
    },
    [addNotification, quests, setQuests]
  );

  const resetEveryDayQuests = async () => {
    const everyDayQuests = quests.filter(
      (q) => q.type === "daily" && q.repeatable && q.status !== "completed"
    );

    if (everyDayQuests.length > 0) {
      try {
        const { data: ps, error: psError } = await supabase
          .from("game_state")
          .select("*")
          .eq("id", "playerState")
          .single();
        if (psError) throw psError;

        let { hp, max_hp: maxHp, mana, max_mana: maxMana, coins } = ps;

        hp = Math.max(0, hp - Math.floor(maxHp * 0.85));
        mana = Math.max(0, mana - Math.floor(maxMana * 0.85));
        coins = Math.max(0, coins - Math.floor(coins * 0.15));
        await supabase
          .from("game_state")
          .update({ hp, mana, coins })
          .eq("id", "playerState");

        const newDeadline = new Date();
        newDeadline.setDate(newDeadline.getDate() + 1);
        newDeadline.setHours(0, 0, 0, 0);

        const updates = everyDayQuests.map((q) =>
          supabase
            .from("quests")
            .update({
              status: "not_started",
              deadline: newDeadline.toISOString(),
              warning_sent_for_current_period: false,
            })
            .eq("id", q.id)
        );

        await Promise.all(updates);

        setQuests((prev) =>
          prev.map((q) =>
            everyDayQuests.some((eq) => eq.id === q.id)
              ? {
                  ...q,
                  status: "not_started",
                  deadline: newDeadline.toISOString(),
                  warning_sent_for_current_period: false,
                }
              : q
          )
        );

        addNotification(
          `🔄 Daily quests reset! Penalties applied for incomplete quests.`,
          "penalty"
        );
      } catch (err) {
        console.error("Error resetting daily quests:", err);
      }
    }
  };

  const questsByCategory = {
    everyDay: quests
      .filter(
        (q) => q.type === "daily" && q.repeatable && q.status !== "completed"
      )
      .sort((a, b) => b.priority - a.priority),
    daily: quests
      .filter(
        (q) => q.type === "daily" && !q.repeatable && q.status !== "completed"
      )
      .sort((a, b) => b.priority - a.priority),
    subquest: quests
      .filter((q) => q.type === "subquest" && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
    main: quests
      .filter((q) => q.type === "main" && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
  };

  const tabLabels = [
    { key: "everyDay", label: "🔄 Every Day" },
    { key: "daily", label: "🗓️ Daily" },
    { key: "subquest", label: "🧩 Sub Quests" },
    { key: "main", label: "🏆 Main Quests" },
  ];

  return (
    <div className="relative">
      <InfoPopup message={infoMessage} onClose={() => setInfoMessage(null)} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Quest Journal
        </h2>
        <CustomButton
          onClick={() => {
            setCurrentQuestType("daily");
            setEditingQuest(null);
            setShowQuestModal(true);
          }}
          variant="primary"
          className="px-6 py-3"
        >
          + New Quest
        </CustomButton>
      </div>

      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-gray-700/50">
          {tabLabels.map(({ key, label }) => (
            <button
              key={key}
              className={`px-5 py-3 text-sm font-medium transition-all duration-300 ${
                activeTab === key
                  ? "text-white bg-gradient-to-b from-purple-500/20 to-transparent border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          ref={questsContainerRef}
          className="p-5 max-h-[500px] overflow-y-auto custom-scrollbar"
        >
          {activeTab === "everyDay" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-white/10">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold text-white mb-3">
                  Daily Reset In:
                </h3>
                <div className="flex justify-center items-center space-x-4">
                  <div className="relative">
                    <CountdownCircleTimer
                      key={`hours-${Math.floor(resetTimeLeft / 1000)}`}
                      isPlaying
                      duration={24 * 60 * 60}
                      initialRemainingTime={Math.floor(resetTimeLeft / 1000)}
                      colors={[["#EF4444"]]}
                      trailColor="#374151"
                      strokeWidth={6}
                      size={70}
                      rotation="counterclockwise"
                      onComplete={() => {
                        resetEveryDayQuests();
                        return { shouldRepeat: false };
                      }}
                    >
                      {({ remainingTime }) => (
                        <div className="flex flex-col items-center">
                          <div className="text-xl font-bold text-red-400">
                            {Math.floor(remainingTime / 3600)
                              .toString()
                              .padStart(2, "0")}
                          </div>
                          <div className="text-xs text-gray-400">HRS</div>
                        </div>
                      )}
                    </CountdownCircleTimer>
                  </div>

                  <div className="relative">
                    <CountdownCircleTimer
                      key={`minutes-${Math.floor(resetTimeLeft / 1000)}`}
                      isPlaying
                      duration={3600}
                      initialRemainingTime={Math.floor(
                        (resetTimeLeft / 1000) % 3600
                      )}
                      colors={[["#F59E0B"]]}
                      trailColor="#374151"
                      strokeWidth={6}
                      size={60}
                      rotation="counterclockwise"
                      onComplete={() => ({ shouldRepeat: true })}
                    >
                      {({ remainingTime }) => (
                        <div className="flex flex-col items-center">
                          <div className="text-lg font-bold text-yellow-400">
                            {Math.floor(remainingTime / 60)
                              .toString()
                              .padStart(2, "0")}
                          </div>
                          <div className="text-xs text-gray-400">MIN</div>
                        </div>
                      )}
                    </CountdownCircleTimer>
                  </div>

                  <div className="relative">
                    <CountdownCircleTimer
                      key={`seconds-${Math.floor(resetTimeLeft / 1000)}`}
                      isPlaying
                      duration={60}
                      initialRemainingTime={Math.floor(
                        (resetTimeLeft / 1000) % 60
                      )}
                      colors={[["#10B981"]]}
                      trailColor="#374151"
                      strokeWidth={6}
                      size={50}
                      rotation="counterclockwise"
                      onComplete={() => ({ shouldRepeat: true })}
                    >
                      {({ remainingTime }) => (
                        <div className="flex flex-col items-center">
                          <div className="text-base font-bold text-green-400">
                            {remainingTime.toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-gray-400">SEC</div>
                        </div>
                      )}
                    </CountdownCircleTimer>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Uncompleted quests will reset with penalties
                </p>
              </div>
            </div>
          )}

          {questsByCategory[activeTab].length > 0 ? (
            <div className="grid gap-4">
              {questsByCategory[activeTab].map((quest) => (
                <QuestItem
                  key={quest.id}
                  quest={quest}
                  db={supabase}
                  userLevel={userLevel}
                  activeTab={activeTab}
                  startQuestHandler={startQuestHandler}
                  completeQuestHandler={completeQuestHandler}
                  setEditingQuest={setEditingQuest}
                  applyPenaltyAndResetQuest={applyPenaltyAndResetQuest}
                  setInfoMessage={setInfoMessage}
                  addNotification={addNotification}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-4">No quests in this category</p>
              <CustomButton
                onClick={() => {
                  setCurrentQuestType(
                    activeTab === "everyDay" ? "daily" : activeTab
                  );
                  setEditingQuest(null);
                  setShowQuestModal(true);
                }}
                variant="secondary"
                className="px-6 py-2"
              >
                Create New Quest
              </CustomButton>
            </div>
          )}
        </div>
      </div>

      {showQuestModal && (
        <Modals
          showQuestModal={showQuestModal}
          setShowQuestModal={setShowQuestModal}
          currentQuestType={currentQuestType}
          onQuestConfirm={async (questData) => {
            if (!questData.name) return;

            try {
              const dbFormat = {
                name: questData.name,
                description: questData.description,
                difficulty: questData.difficulty,
                type: questData.type,
                deadline: questData.deadline,
                repeatable: questData.repeatable,
                required_level: questData.required_level,
                xp: questData.xp,
                coins: questData.coins,
                is_24_hour: questData.is_24_hour,
              };

              if (editingQuest) {
                const { error } = await supabase
                  .from("quests")
                  .update(dbFormat)
                  .eq("id", editingQuest.id);
                if (error) throw error;

                setQuests((prev) =>
                  prev.map((q) =>
                    q.id === editingQuest.id ? { ...q, ...dbFormat } : q
                  )
                );
              } else {
                const newQuest = {
                  ...dbFormat,
                  id: Date.now().toString(),
                  status: "not_started",
                  subquests: [],
                  priority:
                    quests.reduce((max, q) => Math.max(max, q.priority), 0) + 1,
                  dependencies: [],
                  warning_sent_for_current_period: false,
                };

                const { error } = await supabase
                  .from("quests")
                  .insert(newQuest);
                if (error) throw error;
                setQuests((prev) => [...prev, newQuest]);
              }

              setShowQuestModal(false);
              setEditingQuest(null);
            } catch (err) {
              console.error("Failed to save quest:", err);
              addNotification("Failed to save quest", "error");
            }
          }}
          editingQuest={editingQuest}
          onQuestCancel={() => {
            setEditingQuest(null);
            setShowQuestModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Quests;