import React, { useState } from 'react';

const Quests = ({ quests, openQuestForm, openSubquestForm, completeQuest, completeSubquest, startQuest }) => {
  const [activeTab, setActiveTab] = useState('Quests');

  const calculateTimeRemaining = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'منقضی شده';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} روز، ${hours} ساعت باقی‌مانده`;
  };

  const canStartQuest = (quest) => {
    if (!quest.dependencies || quest.dependencies.length === 0) return true;
    return quest.dependencies.every((depId) => {
      const depQuest = quests.find((q) => q.id === depId);
      return depQuest && depQuest.status === 'completed';
    });
  };

  const renderQuests = () => {
    return ['daily', 'main', 'side', 'timed', 'challenge', 'repeatable'].map((type) => (
      <div key={type}>
        <h2 className="text-lg font-bold mb-2">
          {type === 'daily' ? 'کوئست‌های روزانه' : 
           type === 'main' ? 'کوئست‌های اصلی' : 
           type === 'side' ? 'کوئست‌های جانبی' : 
           type === 'timed' ? 'کوئست‌های زمان‌دار' : 
           type === 'challenge' ? 'کوئست‌های چالشی' : 'کوئست‌های تکرارشونده'}
        </h2>
        <ul className="space-y-2">
          {quests
            .filter((q) => q.type === type)
            .sort((a, b) => a.priority - b.priority)
            .map((q) => (
              <li key={q.id} className={`quest-item ${q.status}`}>
                <div>
                  <div>
                    <strong>{q.name}</strong> [{q.difficulty}] - {q.status === 'not_started' ? 'شروع نشده' : 
                      q.status === 'in_progress' ? 'در حال انجام' : 
                      q.status === 'completed' ? 'تکمیل شده' : 'ناموفق'}
                    {q.deadline && <span className="text-gray-400 text-xs"> ({calculateTimeRemaining(q.deadline)})</span>}
                  </div>
                  <div className="text-gray-400 text-xs">{q.description || ''}</div>
                  {q.subquests?.length > 0 && (
                    <div className="subquests-list">
                      {q.subquests.map((sq) => (
                        <div key={sq.id} className={`subquest-item ${sq.done ? 'done' : ''}`}>
                          <div>
                            <strong>{sq.name}</strong> - {sq.description || ''}
                          </div>
                          {!sq.done && (
                            <button onClick={() => completeSubquest(q.id, sq.id)} className="btn-small">
                              ✔
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {q.status === 'not_started' && canStartQuest(q) && (
                    <button
                      onClick={() => startQuest(q.id)}
                      className="btn-small"
                    >
                      شروع
                    </button>
                  )}
                  {q.status === 'in_progress' && (
                    <button onClick={() => completeQuest(q.id)} className="btn-small">
                      ✔
                    </button>
                  )}
                  {q.status !== 'completed' && type === 'main' && (
                    <button onClick={() => openSubquestForm(q.id)} className="btn-small">
                      +ساب‌کوئست
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    ));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Quests':
        return (
          <>
            <button
              onClick={() => openQuestForm('daily')}
              className="bg-purple-500 px-4 py-2 rounded mb-4 hover:bg-purple-400 transition"
            >
              ➕ کوئست جدید
            </button>
            {renderQuests()}
          </>
        );
      case 'Notification':
        return <div className="p-4 text-gray-300">محتوای اعلان‌ها در اینجا قرار می‌گیرد.</div>;
      case 'Achievements':
        return <div className="p-4 text-gray-300">محتوای دستاوردها در اینجا قرار می‌گیرد.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="backdrop-blur-md bg-gray-800 bg-opacity-90 rounded-lg mb-6 shadow-lg">
      <div className="flex space-x-4 mb-4 bg-gray-900 rounded-t-lg">
        {['Notification', 'Quests', 'Achievements'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab === 'Notification' ? 'اعلان‌ها' : tab === 'Quests' ? 'کوئست‌ها' : 'دستاوردها'}
          </button>
        ))}
      </div>
      <div className="p-4 bg-gray-800 rounded-b-lg">{renderTabContent()}</div>
    </div>
  );
};

export default Quests;