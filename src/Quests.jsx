import React from 'react';

const Quests = ({ quests, openQuestForm, openSubquestForm, completeQuest, completeSubquest }) => {
  const renderQuests = () => {
    const dailyQuests = quests.filter((q) => q.type === 'daily');
    if (dailyQuests.length > 5) {
      // In-app notification logic to be added later
      return null;
    }

    return ['daily', 'main'].map((type) => (
      <div key={type}>
        <h2 className="text-lg font-bold mb-2">{type === 'daily' ? 'Daily Quests' : 'Main Quests'}</h2>
        <ul className="space-y-2">
          {quests
            .filter((q) => q.type === type)
            .sort((a, b) => a.priority - b.priority)
            .map((q) => (
              <li key={q.id} className={`quest-item ${q.done ? 'done' : ''}`}>
                <div>
                  <div>
                    <strong>{q.name}</strong> [{q.difficulty}]
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
                  {!q.done && (
                    <button onClick={() => completeQuest(q.id)} className="btn-small">
                      ✔
                    </button>
                  )}
                  {!q.done && type === 'main' && (
                    <button onClick={() => openSubquestForm(q.id)} className="btn-small">
                      +Subquest
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 mb-6 shadow-lg">
      <button
        onClick={() => openQuestForm('daily')}
        className="bg-purple-500 px-4 py-2 rounded mb-4 hover:bg-purple-400 transition"
      >
        ➕ New Quest
      </button>
      {renderQuests()}
    </div>
  );
};

export default Quests;