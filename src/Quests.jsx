import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import CustomButton from './CustomButton';

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [userLevel, setUserLevel] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'quests'), (snapshot) => {
      const questsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuests(questsData);
    }, (error) => {
      console.error("Error fetching quests: ", error);
    });

    const timer = setInterval(() => {
      const now = new Date();
      const updatedTimes = {};
      quests.forEach((q) => {
        if (q.type === 'daily' && q.deadline && q.status === 'in_progress') {
          const diff = new Date(q.deadline).getTime() - now.getTime();
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            updatedTimes[q.id] = `${hours}ساعت ${minutes}دقیقه`;
          } else {
            updatedTimes[q.id] = 'منقضی شده';
          }
        }
      });
      setTimeRemaining(updatedTimes);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [quests]);

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '🟢';
    }
  };

  const startQuest = async (questId) => {
    // Update status to 'in_progress' in Firestore
    // This is a placeholder, replace with actual Firestore update logic
    const questRef = doc(db, 'quests', questId);
    await updateDoc(questRef, { status: 'in_progress' });
  };

  const completeQuest = async (questId) => {
    // Update status to 'completed' in Firestore
    // This is a placeholder, replace with actual Firestore update logic
    const questRef = doc(db, 'quests', questId);
    await updateDoc(questRef, { status: 'completed' });
  };

  const renderQuest = (quest) => {
    const canStart = userLevel >= (quest.requiredLevel || 0);
    const isStarted = quest.status === 'in_progress';

    return (
      <div key={quest.id} className="quest-item bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-md rounded-lg p-4 mb-4 shadow-lg hover:scale-105 transition-transform">
        <h3 className="text-xl font-bold text-white">{quest.name}</h3>
        <p className="text-purple-300 mb-2 !uppercase text-sm">{quest.type} • {quest.status || 'not_started'} • {getDifficultyEmoji(quest.difficulty)} {quest.difficulty}</p>

        {quest.description && <p className="text-gray-300 mb-2">{quest.description}</p>}

        {quest.deadline && (
          <p className="text-red-300">Deadline: {timeRemaining[quest.id] || new Date(quest.deadline).toLocaleString()}</p>
        )}
        <p className="text-sm">🪙{quest.coins || 0} • {quest.xp || 0} XP</p>
        <p className="text-blue-300 mb-2">Required Level • {quest.requiredLevel || 100001}</p>
        {!isStarted && canStart && (
          <CustomButton
            onClick={() => startQuest(quest.id)}
            className="bg-green-500 px-4 py-2 rounded hover:bg-green-400 transition mr-2"
          >
            شروع
          </CustomButton>
        )}
        {isStarted && (
          <CustomButton
            onClick={() => completeQuest(quest.id)}
          >
            انجام شد
          </CustomButton>
        )}
        {!isStarted && canStart && (
          <CustomButton
            onClick={() => {/* Edit logic here */}}
          >
            ویرایش
          </CustomButton>
        )}
        {!canStart && <p className="text-red-500">لول کافی نیست!</p>}
      </div>
    );
  };

  return (
    <div className="backdrop-blur-md bg-gray-800 bg-opacity-90 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">کوئست‌ها</h2>
      {quests.map(renderQuest)}
    </div>
  );
};

export default Quests;